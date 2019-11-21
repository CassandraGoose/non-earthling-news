const getNews = async () => {
  const response = await fetch('https://newsapi.org/v2/everything?q=ufo alien extraterrestrial&sortBy=publishedAt&apiKey=7488c28e0de9432cb5b471f1a27a39ac');
  const json = await response.json();
  const page2response = await fetch('https://newsapi.org/v2/everything?q=ufo alien extraterrestrial&sortBy=publishedAt&page=2&apiKey=7488c28e0de9432cb5b471f1a27a39ac');
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

const setupPage = () => {
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
  articles.forEach((article, i) => {
    const { articleDiv, title, pictureAndContent, dateAndAuthor } = setupArticle();

    if (i % 2 === 0) {
      createAnyElementWithContent('img', pictureAndContent, '', { [article.urlToImage]: 'src' }, ['col-sm', 'article-image']);
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

const articles = getNews();
const articlesDiv = setupPage();
const bannedWords = ['sex', 'brothel', 'movies', 'movie', 'album', 'episodes'];