async function getNews() {
  const response = await fetch('https://newsapi.org/v2/everything?q=ufo alien extraterrestrial&apiKey=7488c28e0de9432cb5b471f1a27a39ac');
  const json = await response.json();
  addToPage(json.articles);
}

const articles = getNews()

const articlesDiv = document.querySelector('#articles');
articlesDiv.classList.add('container'); 
const dateP = document.querySelector('#todays-date');
dateP.textContent = formatDate(new Date())

const setupArticle = () => {
  const articleDiv = document.createElement('div');
  const titleAndDetails = document.createElement('div');
  titleAndDetails.classList.add('col');
  const dateAndAuthor = document.createElement('div');
  dateAndAuthor.classList.add('row', 'justify-content-between', 'custom-container-padding');
  const pictureAndContent = document.createElement('div');
  pictureAndContent.classList.add('row', 'custom-container-padding');
  const topHR = document.createElement('hr');
  titleAndDetails.appendChild(topHR);
  titleAndDetails.appendChild(dateAndAuthor);
  const bottomHR = document.createElement('hr');
  titleAndDetails.appendChild(bottomHR);
  articleDiv.appendChild(titleAndDetails);
  articleDiv.appendChild(pictureAndContent);
  return { articleDiv, titleAndDetails, pictureAndContent, dateAndAuthor };
}

function addToPage(articles) {
  articles.forEach((article, i) => {
    const { articleDiv, titleAndDetails, pictureAndContent, dateAndAuthor } = setupArticle();
    
    createTitle(article.title, titleAndDetails);
    if (i % 2 === 0) {
      createImage(article.urlToImage, pictureAndContent) ;
      createContent(article.content, `content${i}`, pictureAndContent);
    } else {
      createContent(article.content, `content${i}`, pictureAndContent);
      createImage(article.urlToImage, pictureAndContent) ;
    }
    createAndPopulateDetail('p', article.author, dateAndAuthor);
    createAndPopulateDetail('p', formatDate(article.publishedAt), dateAndAuthor);
    const hr = document.createElement('hr');
    const lilHR = document.createElement('hr');
    lilHR.classList.add('lil-hr')
    hr.classList.add('thicc-hr');
    articleDiv.appendChild(hr);
    articleDiv.appendChild(lilHR)
    articlesDiv.appendChild(articleDiv);
    createMoreLink(article.url, `content${i}`);
  });
}

function createTitle(title, parent) {
  const createdTitle = document.createElement('h2');
  createdTitle.textContent = title;
  parent.prepend(createdTitle);
}

const createImage = (url, parent) => {
  const imageElement = document.createElement('img');
  imageElement.src = url;
  imageElement.style = "width: 500px; height: auto"
  imageElement.classList.add('col-sm');
  parent.appendChild(imageElement);
}

const createContent = (content, id, parent) => {
  const createdContent = document.createElement('p');
  createdContent.textContent = formatContentSnippet(content);
  createdContent.classList.add('col-sm', 'article-content');
  createdContent.setAttribute('id', id);
  parent.appendChild(createdContent);
}

const createAndPopulateDetail = (element, content, parent) => {
  const createdElement = document.createElement(element);
  createdElement.textContent = content;
  parent.appendChild(createdElement);
  return createdElement;
}

function createMoreLink(url, id) {
  const createdLink = document.createElement('a');
  createdLink.textContent = 'More';
  createdLink.href = url;
  createdLink.setAttribute('target', '_blank');
  const contentElement = document.querySelector(`#${id}`);
  contentElement.appendChild(createdLink);
  return createdLink;
}

function formatContentSnippet(snippet) {
  return snippet.split('[')[0];
}

function formatDate(date) {
  const dateObj = new Date(date);
  return dateObj.toDateString();
}