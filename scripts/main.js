const bannedWords = ['sex', 'brothel', 'movies', 'movie', 'album', 'episodes'];
const proxyURL = 'https://nameless-crag-96897.herokuapp.com';
const noArticlesDiv = document.querySelector('#no-articles');
const searchInput = document.getElementById('search');
let nonEarthlingArticles = [];
let allApprovedArticles = [];
let currentFilter = null;

// call newsAPI via proxy to get 2 pages (limit of free newsAPI user) of results
const getNews = async (sort = 'publishedAt') => {
  const response = await fetch(`${proxyURL}/news?sort=${sort}`);
  const json = await response.json();
  const responsePage2 = await fetch(`${proxyURL}/news-second-page?sort=${sort}`);
  const jsonPage2 = await responsePage2.json();
  const allReceivedArticles = [...json.articles, ...jsonPage2.articles];
  removeUnwantedArticles(allReceivedArticles);
  const filteredArticles = currentFilter
    ? searchByTerm(allApprovedArticles)
    : allApprovedArticles;
  setArticles(filteredArticles);
};

// remove articles containing banned words and repeated articles published on different dates
const removeUnwantedArticles = (articles) => {
  const approvedArticles = removeBannedArticles(articles);
  allApprovedArticles = removeRepeatingArticles(approvedArticles);
};

// filter out any articles that have the same title, because sometimes
// they come through as different dates
const removeRepeatingArticles = (articles) => {
  const nonRepeated = {};
  return articles.filter((article) => {
    if (!nonRepeated[article.title]) {
      nonRepeated[article.title] = article.title;
      return true;
    }
    if (nonRepeated[article.title]) return false;
  });
};

// filter out any articles that have banned words in their titles so we don't have to think
// about inappropriate aliens
const removeBannedArticles = (articles) => {
  const bannedRegexp = new RegExp(bannedWords.join('|'), 'ig');
  return articles.filter((article) => !article.title.match(bannedRegexp));
};

// set the nonEarthlingArticles to articles filtered/sorted by settings
const setArticles = (articles) => {
  if (!articles || articles.length === 0) {
    nonEarthlingArticles = [];
    noArticlesFound();
  } else nonEarthlingArticles = articles;
  addArticlesToPage();
};

// setup the sort select element
const setupSelect = () => {
  const sortSelect = document.getElementById('sort');
  sortSelect.classList.add(['custom-select', 'custom-select-sm']);
  sortSelect.addEventListener('change', (e) => {
    searchInput.value = '';
    getNews(e.target.value);
  });
};

// set up the search element
const setupSearch = () => {
  searchInput.classList.add('nen-search-input');
  searchInput.addEventListener('keyup', () => {
    if (searchInput.value.length === 0) setArticles(allApprovedArticles);
    else searchByTerm(searchInput.value);
  });
};

// set up the filters buttons
const setupFilters = () => {
  const currentAvailableFilters = ['Vice News', 'Gizmodo', 'Daily Star'];
  const filterContainer = document.querySelector('#filter-container');
  currentAvailableFilters.forEach((filter) => {
    const filterValue = filter === 'Daily Star' ? 'dailystar' : filter;
    const createElementOptions = {
      content: filter,
      attributes: { [filter]: 'id', [filterValue]: 'value' },
      classes: ['nen-filter', 'btn', 'btn-dark'],
    };
    const button = createAnyElementWithContent('button', filterContainer, createElementOptions);
    addListenerToButton(button);
  });
};

// add click listener to filter buttons
const addListenerToButton = (button) => {
  const selectedColor = 'btn-primary';
  const defaultColor = 'btn-dark';

  button.addEventListener('click', (e) => {
    const lowerCaseValue = e.target.value.toLowerCase();
    searchInput.value = '';
    if (currentFilter === lowerCaseValue) {
      currentFilter = null;
      setArticles(allApprovedArticles);
      applyColorsToFilterButton(button, defaultColor, selectedColor);
    } else {
      currentFilter = lowerCaseValue;
      const allFilterButtons = document.querySelectorAll('button');
      allFilterButtons.forEach((filterButton) => {
        applyColorsToFilterButton(filterButton, defaultColor, selectedColor);
      });
      applyColorsToFilterButton(button, selectedColor, defaultColor);
      setArticles(allApprovedArticles);
      searchByTerm(currentFilter);
    }
  });
};

// change the colors of the buttons based on clicks
const applyColorsToFilterButton = (element, colorToAdd, colorToDelete) => {
  element.classList.remove(colorToDelete);
  element.classList.add(colorToAdd);
};

// set up all the various parts of the page
const setupPage = () => {
  setupSelect();
  setupSearch();
  const articlesDiv = document.querySelector('#articles');
  articlesDiv.classList.add('container');
  const dateP = document.querySelector('#todays-date');
  dateP.textContent = formatDate(new Date());
  setupFilters();
  return articlesDiv;
};

// create any dom element by specifying the element, the parent, the text content,
// any attributes, and any classes
const createAnyElementWithContent = (elementType, parent, options = null) => {
  const createdElement = document.createElement(elementType);
  if (options) {
    const { content, attributes, classes } = options;
    if (content) createdElement.textContent = content;
    if (attributes) {
      const keys = Object.keys(attributes);
      keys.forEach((key) => {
        createdElement.setAttribute(attributes[key], key);
      });
    }
    if (classes) {
      classes.forEach((name) => {
        createdElement.classList.add(name);
      });
    }
  }
  parent.appendChild(createdElement);
  return createdElement;
};

// setup the html for each individual article
const setupArticle = () => {
  const articleDiv = document.createElement('div');
  const titleAndDetails = createAnyElementWithContent('div', articleDiv, { classes: ['col'] });
  const title = createAnyElementWithContent('div', titleAndDetails);
  const dateAndAuthor = createAnyElementWithContent('div', titleAndDetails, { classes: ['row', 'justify-content-between', 'custom-container-padding'] });
  createAnyElementWithContent('hr', titleAndDetails);

  const pictureAndContent = createAnyElementWithContent('div', articleDiv, { classes: ['row', 'custom-container-padding'] });
  titleAndDetails.appendChild(dateAndAuthor);
  createAnyElementWithContent('hr', titleAndDetails);
  return {
    articleDiv, title, pictureAndContent, dateAndAuthor,
  };
};

// if no articles are found according to settings, the show an h2 that says so
const noArticlesFound = () => {
  noArticlesDiv.innerHTML = '';
  createAnyElementWithContent('h2', noArticlesDiv, { content: 'No Articles Found.' });
};

// search or filter an article via the title, content, source, or description
const searchByTerm = (term) => {
  const regexTerm = new RegExp(term, 'g');
  const searched = nonEarthlingArticles.filter(
    (article) => article.title.toLowerCase().match(regexTerm)
      || article.content.toLowerCase().match(regexTerm)
      || article.source.name.toLowerCase().match(regexTerm)
      || article.description.toLowerCase().match(regexTerm),
  );
  if (searched.length === 0) noArticlesFound();
  setArticles(searched);
};

// add all the articles that match settings to the dom
const addArticlesToPage = () => {
  articlesDiv.innerHTML = '';
  articlesDiv.classList.remove('align-text-center');
  nonEarthlingArticles.forEach((article, i) => {
    const {
      articleDiv,
      title,
      pictureAndContent,
      dateAndAuthor,
    } = setupArticle();
    const createImgOptions = {
      content: '',
      attributes: {
        [article.urlToImage]: 'src',
        [altText(article.url)]: 'alt',
      },
      classes: ['col-sm', 'nen-article-image'],
    };
    const createPOptions = {
      content: formatContentSnippet(article.content),
      attributes: { [`content${i}`]: 'id' },
      classes: ['col-sm', 'nen-article-content'],
    };
    if (i % 2 === 0) {
      createAnyElementWithContent('img', pictureAndContent, createImgOptions);
      createAnyElementWithContent('p', pictureAndContent, createPOptions);
    } else {
      createAnyElementWithContent('p', pictureAndContent, createPOptions);
      createAnyElementWithContent('img', pictureAndContent, createImgOptions);
    }
    createAnyElementWithContent('h2', title, { content: article.title });
    createAnyElementWithContent('p', dateAndAuthor, { content: article.author });
    createAnyElementWithContent('p', dateAndAuthor, { content: formatDate(article.publishedAt) });
    createAnyElementWithContent('hr', articleDiv, { classes: ['nen-margin-top', 'nen-hr-title'] });
    createAnyElementWithContent('hr', articleDiv, { classes: ['nen-lil-hr'] });

    articlesDiv.appendChild(articleDiv);
    const contentElement = document.querySelector(`#content${i}`);
    const createAOptions = {
      content: 'More',
      attributes: {
        _blank: 'target',
        [article.url]: 'href',
      },
    };
    createAnyElementWithContent('a', contentElement, createAOptions);
  });
};

// remove unwanted text characters at the end of each news snippet we get from the api
const formatContentSnippet = (snippet) => snippet.split('[')[0];

// since the date will come through the API as a string, format it to something we want
const formatDate = (date) => {
  const dateObj = new Date(date);
  return dateObj.toDateString();
};

// A screen reader should describe the image that is being displayed,
// but since we don't get that information from the
// API, send the user to a place where they can access that content.
const altText = (url) => `Please see ${url} to get detailed information on this image. The API used does not provide alternate text.`;

getNews();
const articlesDiv = setupPage();
