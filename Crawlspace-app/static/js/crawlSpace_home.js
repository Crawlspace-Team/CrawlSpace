window.onload = function(){
  const newCrawlDateInput = document.querySelectorAll('.newCrawlDate')
   // Initialise all form date inputs with the current date as the default value
  newCrawlDateInput.forEach(input => input.valueAsDate = new Date())
};

// Intitialise two boolean variables to track whether the new crawl an edit crawl menus are open
let newCrawlMenuOpen = false
let editCrawlMenuOpen = false

const newCrawlMenu = document.querySelector('.newCrawlMenu')
const newCrawlOverlay = newCrawlMenu.querySelector('.overlay')
const newCrawlButton = document.querySelector('.button--hover')

// Assign the toggle new crawl menu function to the new crawl button and overlay
newCrawlButton.addEventListener('click', toggleNewCrawlMenu)
newCrawlOverlay.addEventListener('click', toggleNewCrawlMenu)

const editCrawlButtons = document.querySelectorAll('.editCrawlButton')
const editCrawlMenu = document.querySelector('.editCrawlMenu')
const editCrawlOverlay = editCrawlMenu.querySelector('.overlay')
// Add the click event listener to all edit crawl values
editCrawlButtons.forEach(button => button.addEventListener('click', openEditCrawlMenu))
editCrawlOverlay.addEventListener('click', closeEditCrawlMenu)

/**
 * Toggle the overlay behind the new crawl menu
 */
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

/**
 * Opens the edit crawl menu with menu input values based on the crawl that was clicked
 * @param {Event} e The event that triggered open edit crawl menu
 */
function openEditCrawlMenu(e) {
  // Prevent the link from reloading the page
  e.preventDefault()
  // Select the root crawl element that is the parent of the current element
  const crawlElement = e.target.parentNode.parentNode.parentNode
  const crawlNameElement = crawlElement.querySelector('.details_name')
  const crawlDateElement = crawlElement.querySelector('.details_startDate')
  const crawlIDElement = crawlElement.querySelector('.details_id')
  const editCrawlName = editCrawlMenu.querySelector('.editCrawlName')
  const editCrawlDate = editCrawlMenu.querySelector('.editCrawlDate')
  const editCrawlID = editCrawlMenu.querySelector('.editCrawlID')

  const crawlName = crawlNameElement.innerHTML
  // Gets the date value from the crawl's date element and splits the date into seperate day, month and year values
  let crawlDate = crawlDateElement.innerHTML.split('/')
  const crawlYear = crawlDate[2]
  const crawlMonth = (crawlDate[1]-1)
  const crawlDay = crawlDate[0]
  crawlDate = new Date(crawlYear, crawlMonth, crawlDay);

  editCrawlName.setAttribute('value', crawlName)
  editCrawlDate.valueAsDate = crawlDate
  editCrawlID.setAttribute('value', crawlIDElement.innerHTML)
  editCrawlMenu.classList.toggle('menu--open')
  newCrawlButton.classList.toggle('button--active')
  editCrawlMenuOpen = !editCrawlMenuOpen
}

/**
 * Closes the edit crawl menu and hides the overlay
 */
function closeEditCrawlMenu() {
  editCrawlMenuOpen = !editCrawlMenuOpen
  editCrawlMenu.classList.toggle('menu--open')
  newCrawlButton.classList.toggle('button--active')
}
