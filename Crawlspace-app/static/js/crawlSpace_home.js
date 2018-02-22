window.onload = function(){
  const newCrawlDateInput = document.querySelector('#newCrawlDate')
  newCrawlDateInput.valueAsDate = new Date()
};

const newCrawlMenu = document.querySelector('.newCrawlMenu')
const newCrawlOverlay = newCrawlMenu.querySelector('.overlay')
const newCrawlButton = document.querySelector('.button--createCrawl')
newCrawlButton.addEventListener('click', toggleNewCrawlMenu)
newCrawlOverlay.addEventListener('click', toggleNewCrawlMenu)

function toggleNewCrawlMenu() {
  newCrawlMenu.classList.toggle('menu--open')
  newCrawlButton.classList.toggle('button--active')
}
