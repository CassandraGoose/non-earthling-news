let nonEarthlingArticles = [];
let searchInput = document.getElementById('search');
let allApprovedArticles = [];

const getNews = async (sort = 'publishedAt') => {
  const response = await fetch(`https://nameless-crag-96897.herokuapp.com/news?sort=${sort}`);
  const json = await response.json();
  const page2response = await fetch(`https://nameless-crag-96897.herokuapp.com/news?sort=${sort}`);
  const json2 = await page2response.json();
  const allArticles = [...json.articles, ...json2.articles];
  const approvedArticles = nonBannedArticles(allArticles);
  allApprovedArticles = removeRepeatingArticles(approvedArticles);
  nonEarthlingArticles = allApprovedArticles;  
  addArticlesToPage();
}

const removeRepeatingArticles = (articles) => {
  const nonRepeated = {};
  return articles.filter((article) => {
    if (!nonRepeated[article.title]) {
      nonRepeated[article.title] = article.title;
      return true;
    }
    if (nonRepeated[article.title]) return false;
  });
}

const nonBannedArticles = (articles) => {
  return articles.filter((article) => {
    const lowercaseTitle = article.title.toLowerCase();
    return bannedWords.every((word) => {
      return !lowercaseTitle.includes(word)
    });
  });
}

const resetArticles = () => {
  nonEarthlingArticles = allApprovedArticles;
  addArticlesToPage();
}

const setupSelect = () => {
  const sortSelect = document.getElementById('sort');
  sortSelect.addEventListener('change', (e) => {
    getNews(e.target.value);
  });
}

const setupSearch = () => {
  const searchInput = document.getElementById('search');
  searchInput.classList.add('search-input');
  searchInput.addEventListener('keyup', (e) => {
    if (searchInput.value.length === 0) resetArticles();
    else search(searchInput.value);
  });
}

const search = (term) => {
  resetArticles();
  const regexTerm = new RegExp(term, "g")
  const searched = nonEarthlingArticles
    .filter(article =>
      article.title.toLowerCase().match(regexTerm)
      || article.content.toLowerCase().match(regexTerm)
      || article.source.name.toLowerCase().match(regexTerm)
      || article.description.toLowerCase().match(regexTerm));
  if (searched.length === 0) noArticlesFound();
  else {
    nonEarthlingArticles = searched;
    addArticlesToPage()
  }
}

const setupFilters = () => {
  const currentAvailableFilters = ['Vice News', 'Gizmodo', 'Daily Star', 'NASA', 'Area 51'];
  const filterContainer = document.querySelector('#filter-container');
  currentAvailableFilters.forEach((filter) => {
    const filterValue = filter == 'Daily Star' ? 'dailystar' : filter;
    const button = createAnyElementWithContent('button', filterContainer, filter, { [filter]: 'id', [filterValue]: 'value' }, ['filter']);
    button.addEventListener('click', (e) => {
      search(e.target.value.toLowerCase());
    });
  });
}

const setupPage = () => {
  setupSelect();
  setupSearch();
  const articlesDiv = document.querySelector('#articles');
  articlesDiv.classList.add('container');
  const dateP = document.querySelector('#todays-date');
  dateP.textContent = formatDate(new Date());
  setupFilters();
  return articlesDiv;
}

const createAnyElementWithContent = (elementType, parent, content = null, attributes = null, classes = null) => {
  const createdElement = document.createElement(elementType);
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
  parent.appendChild(createdElement);
  return createdElement;
}

const setupArticle = () => {
  const articleDiv = document.createElement('div');
  const titleAndDetails = createAnyElementWithContent('div', articleDiv, null, null, ['col']);
  const title = createAnyElementWithContent('div', titleAndDetails);
  const dateAndAuthor = createAnyElementWithContent('div', titleAndDetails, null, null, ['row', 'justify-content-between', 'custom-container-padding']);
  createAnyElementWithContent('hr', titleAndDetails);
  const pictureAndContent = createAnyElementWithContent('div', articleDiv, null, null, ['row', 'custom-container-padding']);
  titleAndDetails.appendChild(dateAndAuthor);
  createAnyElementWithContent('hr', titleAndDetails);
  return { articleDiv, title, pictureAndContent, dateAndAuthor };
}

const noArticlesFound = () => {
  nonEarthlingArticles = [];
  addArticlesToPage();
  createAnyElementWithContent('h2', articlesDiv, 'No Articles Found.');
}

const addArticlesToPage = () => {
  articlesDiv.innerHTML = '';
  articlesDiv.classList.remove('align-text-center');
  nonEarthlingArticles.forEach((article, i) => {
    const { articleDiv, title, pictureAndContent, dateAndAuthor } = setupArticle();

    if (i % 2 === 0) {
      createAnyElementWithContent('img', pictureAndContent, '', { [article.urlToImage]: 'src', [altText(article.url)]: 'alt' }, ['col-sm', 'article-image']);
      createAnyElementWithContent('p', pictureAndContent, formatContentSnippet(article.content), { [`content${i}`]: 'id' }, ['col-sm', 'article-content']);
    } else {
      createAnyElementWithContent('p', pictureAndContent, formatContentSnippet(article.content), { [`content${i}`]: 'id' }, ['col-sm', 'article-content']);
      createAnyElementWithContent('img', pictureAndContent, '', { [article.urlToImage]: 'src' }, ['col-sm', 'article-image']);
    }
    createAnyElementWithContent('h2', title, article.title);
    createAnyElementWithContent('p', dateAndAuthor, article.author);
    createAnyElementWithContent('p', dateAndAuthor, formatDate(article.publishedAt));
    createAnyElementWithContent('hr', articleDiv, null, null, ['thicc-hr']);
    createAnyElementWithContent('hr', articleDiv, null, null, ['lil-hr']);

    articlesDiv.appendChild(articleDiv);
    const contentElement = document.querySelector(`#content${i}`);
    createAnyElementWithContent('a', contentElement, 'More', { ['_blank']: 'target', [article.url]: 'href' });
  });
}

const formatContentSnippet = (snippet) => {
  return snippet.split('[')[0];
}

const formatDate = (date) => {
  const dateObj = new Date(date);
  return dateObj.toDateString();
}

const altText = (url) => {
  return `Please see ${url} to get detailed information on this image. The API used does not provide alternate text.`;
}

const articles = getNews();
const articlesDiv = setupPage();
const bannedWords = ['sex', 'brothel', 'movies', 'movie', 'album', 'episodes'];