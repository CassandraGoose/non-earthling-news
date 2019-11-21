const getNews = async (sort = 'publishedAt') => {
  const response = await fetch(`https://nameless-crag-96897.herokuapp.com/news?sort=${sort}`);
  const json = await response.json();
  const page2response = await fetch(`https://nameless-crag-96897.herokuapp.com/news?sort=${sort}`);
  const json2 = await page2response.json();
  const allArticles = [...json.articles, ...json2.articles];
  const approvedArticles = nonBannedArticles(allArticles);
  const noRepeatingArticles = removeRepeatingArticles(approvedArticles);
  addArticlesToPage(noRepeatingArticles);
}

const removeRepeatingArticles = (articles) => {
  return articles.filter((article, i) => {
    if (i < articles.length - 1) {
      return article.title !== articles[i + 1].title;
    }    
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

setupSelect = () => {
  const sortSelect = document.getElementById('sort');
  sortSelect.addEventListener('change', (e) => {
    getNews(e.target.value);
  });
}


const setupPage = () => {
  setupSelect();
  const articlesDiv = document.querySelector('#articles');
  articlesDiv.classList.add('container');
  const dateP = document.querySelector('#todays-date');
  dateP.textContent = formatDate(new Date());
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
  if(parent === null) console.log(elementType)
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

const addArticlesToPage = (articles) => {
  articlesDiv.innerHTML = '';
  articles.forEach((article, i) => {
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