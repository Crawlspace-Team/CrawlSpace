window.onload = function(){
  const newCrawlDateInput = document.querySelectorAll('.newCrawlDate')
  newCrawlDateInput.forEach(input => input.valueAsDate = new Date())
};

let newCrawlMenuOpen = false
let editCrawlMenuOpen = false

const newCrawlMenu = document.querySelector('.newCrawlMenu')
const newCrawlOverlay = newCrawlMenu.querySelector('.overlay')
const newCrawlButton = document.querySelector('.button--hover')
newCrawlButton.addEventListener('click', toggleNewCrawlMenu)
newCrawlOverlay.addEventListener('click', toggleNewCrawlMenu)

function toggleNewCrawlMenu() {
  newCrawlMenuOpen = !newCrawlMenuOpen
  if (editCrawlMenuOpen == true) {
    editCrawlMenu.classList.remove('menu--open')
    newCrawlMenu.classList.remove('menu--open')
    editCrawlMenuOpen = !editCrawlMenuOpen
  } else {
    newCrawlMenu.classList.toggle('menu--open')
  }
  newCrawlButton.classList.toggle('button--active')
}

const editCrawlButtons = document.querySelectorAll('.editCrawlButton')
const editCrawlMenu = document.querySelector('.editCrawlMenu')
const editCrawlOverlay = editCrawlMenu.querySelector('.overlay')
editCrawlButtons.forEach(button => button.addEventListener('click', openEditCrawlMenu))
editCrawlOverlay.addEventListener('click', closeEditCrawlMenu)

function openEditCrawlMenu(e) {
  e.preventDefault()
  let crawlElement = e.target.parentNode.parentNode.parentNode
  let crawlNameElement = crawlElement.querySelector('.details_name')
  let crawlDateElement = crawlElement.querySelector('.details_startDate')
  let crawlIDElement = crawlElement.querySelector('.details_id')
  const crawlName = crawlNameElement.innerHTML
  let editCrawlName = editCrawlMenu.querySelector('.editCrawlName')
  let editCrawlDate = editCrawlMenu.querySelector('.editCrawlDate')
  let editCrawlID = editCrawlMenu.querySelector('.editCrawlID')
  let crawlDate = crawlDateElement.innerHTML.split('/')
  const crawlYear = crawlDate[2]
  const crawlMonth = (crawlDate[1]-1)
  const crawlDay = crawlDate[0]
  crawlDate = new Date(crawlYear, crawlMonth, crawlDay);
  editCrawlName.setAttribute('value', crawlName)
  editCrawlDate.valueAsDate = crawlDate
  editCrawlID.setAttribute('value', crawlIDElement.innerHTML)

  editCrawlMenuOpen = !editCrawlMenuOpen
  editCrawlMenu.classList.toggle('menu--open')
  newCrawlButton.classList.toggle('button--active')
}

function closeEditCrawlMenu() {
  editCrawlMenuOpen = !editCrawlMenuOpen
  editCrawlMenu.classList.toggle('menu--open')
  newCrawlButton.classList.toggle('button--active')
}
