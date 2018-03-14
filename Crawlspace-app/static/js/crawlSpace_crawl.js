// Global variables for use in the Google places API calls
const googleAPIKey = 'AIzaSyC3v_pZbmLZNkIasBzu_U2M9wqyO3O1rf8'
const googlePlacesDetailUrl = 'https://maps.googleapis.com/maps/api/place/details/json?placeid='
const googlePlacesPhotoUrl = 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference='

// Create a global ID to store the ID of the current crawl
let crawlID = ''

const body = document.querySelector('body')
const pubDetailsContainer = document.querySelector('.pubDetailsContainer')
const pubDetailsOverlay = pubDetailsContainer.querySelector('.overlay')
const searchButton = document.querySelector('#inputSearchButton')
const geolocationButton = document.querySelector('#geolocationButton')
const searchPubsMenu = document.querySelector('.searchPubsContainer')
const searchPubsOverlay = searchPubsMenu.querySelector('.overlay')
const searchPubsButton = document.querySelector('.button--hover')
const searchStatusElement = searchPubsMenu.querySelector('#searchStatus')
const searchResultsList = document.querySelector('#searchResults')

// Add event listeners to all static HTML elements
searchButton.addEventListener('click', searchForPubs)
searchPubsButton.addEventListener('click', toggleSearchPubsMenu)
searchPubsOverlay.addEventListener('click', toggleSearchPubsMenu)
geolocationButton.addEventListener('click', getLocationByGeolocation)
pubDetailsOverlay.addEventListener('click', closeDetailsMenu)

// Function that is called once all HTML elements have been loaded
window.onload = function(){
  // Get the crawl ID by spliting the URL string into and array and selecting the last section
  crawlID = window.location.href.split('/')[4]
  const pubs = document.querySelectorAll('.pubDetailsButton')
  /* For each pub initialise the reorder pub dropdown selection to set its eefault selection
   * as the pub's position within the crawl
   */
  pubs.forEach(pub => {
    pub.addEventListener('click', showPubDetails)
    const select = pub.querySelector('select')
    const options = select.querySelectorAll('option')
    const position = select.dataset.position-1
    const selectedOption = options[position]
    selectedOption.setAttribute('selected', true)
  })
}

/**
 * Toggle the search pubs menu's visibility by showing the menu and stopping any scrolling within the page
 */
function toggleSearchPubsMenu() {
  body.classList.toggle('fixedScroll')
  searchPubsMenu.classList.toggle('menu--open')
  searchPubsButton.classList.toggle('button--active')
}

/**
 * Handle the pub search by location text input
 * @param {event} e The search pubs button that was pressed within the search pubs form
 */
function searchForPubs(e) {
  // Stop the form submission from reloading the page
  e.preventDefault()
  searchLocation = document.querySelector('#inputLocation').value
  // Check if the location input text is not null
  if(searchLocation) {
    getLocationBySearch(searchLocation)
  }
}

/**
 * Retrieve the latitude and longitude of the search location string from the Google Places API
 * @param {string} searchLocation The string representing the location that the pubs will be searched at
 */
function getLocationBySearch(searchLocation) {
  // Call the Google Places API and retrieve the latitude and longitude of the location
  fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${searchLocation}&key=${googleAPIKey}`)
  .then(function(response) {
    return response.json()
  }).then(function(body) {
    // Retrieve the location object containing the latitude and longitude from the data
    const location = body.results[0].geometry.location
    // Create a new object to contain the search locations coordinates
    const position = new Object();
    position.coords = {}
    position.coords.latitude = location.lat
    position.coords.longitude = location.lng
    getPubsAtLocation(position)
  }).catch(function(error) {
    console.log("Location search" + error)
  });
}

/**
 * Retrieve the latitude and longitude of the current device's location via the browser's geolocation API
 * @param {event} e The search pubs by geolocation button that was pressed within the search pubs form
 */
function getLocationByGeolocation(e) {
  // Stop the form submission from reloading the page
  e.preventDefault()
  // Check if the geolocation API is supported by the browser
  if (navigator.geolocation) {
    const options = {
      enableHighAccuracy: false,
      timeout: 8000,
      maximumAge: 0
    };
    /* Get the device's location and set the getPubsAtLocation function as the callback if the call is succesfull
     * or call the handleErrors function if the geolocation call fails
     */
    navigator.geolocation.getCurrentPosition(getPubsAtLocation, handleErrors, options);
  } else {
    console.log('Geolocation is not supported by this browser.');
  }
}

/**
 * Handle the possible geolocation errors and log the error with the correct error cause
 * @param {Error} error The error that caused the geolocation call to fail
 */
function handleErrors(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            console.log('User denied the request for Geolocation.');
            break;
        case error.POSITION_UNAVAILABLE:
            console.log('Location information is unavailable.');
            break;
        case error.TIMEOUT:
            console.log('The request to get user location timed out.');
            break;
        case error.UNKNOWN_ERROR:
            console.log('An unknown error occurred.');
            break;
    }
}

/**
 * Retrieve the pubs available at the input position from the Google Places API via the Crawlspace server
 * @param {Object} position The object containing the latitude and longitue of the search position
 */
function getPubsAtLocation(position) {
  const lat = position.coords.latitude
  const lon = position.coords.longitude
  searchStatusElement.innerHTML = 'Searching for pubs'
  // Remove any existing search result elements from the search list
  removeChildren(searchResultsList)
  // Call the Crawlspace server to retrieve the pubs at the location
  fetch(`/searchpubs/lat=${lat}&lon=${lon}`)
  .then(function(response) {
    return response.json()
  }).then(function(body) {
    displaySearchResults(body)
    return true
  }).catch(function(error) {
    console.log(error)
    return false
  });
}

/**
 * Generate the pub result's HTML elements and hierachy based on the available information about the pub
 * @param {Object} pub The pub representing the pub data retrieved from the Google Places API
 * @returns {HTMLElement} The generated pub html element
 */
function displayPubResult(pub) {
  const pubName = pub.name
  const pubPlaceID = pub.place_id
  const pubAddress = pub.vicinity
  let pubImageUrl = ''
  // Check to see if there are pub photos available, then assign this pub as the pub's thumbnail
  if (pub.photos != null) {
    const pubImageCode = pub.photos[0].photo_reference
    pubImageUrl = googlePlacesPhotoUrl + pubImageCode + '&key=' + googleAPIKey
  }
  // Generate the root link container element for the pub
  const pubLinkContainer = document.createElement('a')
  pubLinkContainer.classList.add('pubDetailsButton')
  // Add the pub's Google Places API place ID as a data attribute to the HTML element
  pubLinkContainer.dataset.id = pubPlaceID
  const pubElement = document.createElement('li')
  pubElement.classList.add('pub')
  const pubOverlay = document.createElement('div')
  pubOverlay.classList.add('pub_overlay')
  // Check if there is a pub image
  if (pubImageUrl) {
    // Create and append the image element for the pub
    const pubImage = document.createElement('img')
    pubImage.classList.add('pub_image')
    pubImage.src = pubImageUrl
    pubElement.appendChild(pubImage)
  } else {
    // Create and append an element to the pub showing faded blurred text of the pub's name
    const pubBackground = document.createElement('div')
    pubBackground.classList.add('pub_image')
    pubElement.appendChild(pubBackground)
    const pubBackgroundName = document.createElement('p')
    pubBackgroundName.innerHTML = pubName
    pubBackground.appendChild(pubBackgroundName)
  }
  const pubDescriptionElement = document.createElement('section')
  pubDescriptionElement.classList.add('pub_description')
  const pubNameElement = document.createElement('p')
  pubNameElement.classList.add('pub_name')
  pubNameElement.innerHTML = pubName
  const pubAddressElement = document.createElement('p')
  pubAddressElement.classList.add('pub_address')
  pubAddressElement.innerHTML = pubAddress
  const pubDetailsButton = document.createElement('button')
  pubDetailsButton.classList.add('button--blue')
  pubDetailsButton.innerHTML = 'View Details'

  // Generate the HTML element hierachy by appending the elements to their parent elements
  pubLinkContainer.appendChild(pubElement)
  pubElement.appendChild(pubDescriptionElement)
  pubDescriptionElement.appendChild(pubNameElement)
  pubDescriptionElement.appendChild(pubAddressElement)
  pubDescriptionElement.appendChild(pubDetailsButton)

  const addPubForm = createAddPubForm()

  const token = createValidationToken()
  addPubForm.appendChild(token)

  const pubText = createPubText()
  addPubForm.appendChild(pubText)

  const pubID = createPubID()
  addPubForm.appendChild(pubID)

  const pubButton = createPubButton()
  const addIcon = createAddIcon()
  pubButton.appendChild(addIcon)
  addPubForm.appendChild(pubButton)
  pubElement.appendChild(addPubForm)

  pubLinkContainer.addEventListener('click', showPubDetails)
  return pubLinkContainer

  /**
   * Creates the add pub form HTML element with the form attributes to call Crawlspace server
   * to add the pub once the form is submitted
   */
  function createAddPubForm() {
    const addPubForm = document.createElement('form')
    addPubForm.classList.add('addPubForm')
    addPubForm.action = '/crawl/' + crawlID + '/addpub/'
    addPubForm.method = 'POST'
    return addPubForm
  }

  /**
   * Create the HTML input element for the csrfToken which is used by the Crawlspace server to validate the user
   */
  function createValidationToken() {
    const token = document.createElement('input')
    // Hide the input element within the form
    token.type = 'hidden'
    // Assign the value of the csrfToken based on the global variable generated and loaded inline script in the crawl.html
    token.value = csrfToken
    token.name = 'csrfmiddlewaretoken'
    return token
  }

  /**
   * Create the HTML input element for the pubs name
   */
  function createPubText() {
    const pubText = document.createElement('input')
    pubText.value = pubName
    // Hide the input element within the form
    pubText.type = 'hidden'
    pubText.name = 'pub_name'
    return pubText
  }

  /**
   * Create the HTML input element for the pubs Google Maps Place ID
   */
  function createPubID() {
    const pubID = document.createElement('input')
    // Hide the input element within the form
    pubID.type = 'hidden'
    pubID.value = pubPlaceID
    pubID.name = 'place_id'
    return pubID
  }

  /**
   * Create the HTML button element that once called will submit the form to the Crawlspace server
   */
  function createPubButton() {
    const pubButton = document.createElement('button')
    pubButton.classList.add('pub_button')
    pubButton.type = 'submit'
    pubButton.name = 'addPub'
    return pubButton
  }

  /**
   * Create the HTML img element that will show a plus ion
   */
  function createAddIcon() {
    const addIcon = document.createElement('img')
    addIcon.classList.add('icon')
    addIcon.src = '/static/images/plus_icon_blue.svg'
    return addIcon
  }
}

/**
 * Handle the show details button for each pub and retrieve the pub details from the Crawlspace server
 * @param {Event} e The element that was clicked and triggered the showPubDetails call
 */
function showPubDetails(e) {
  // Retrieve the element that was clicked in the event
  const clickedElement = e.target
  // Check if the clicked element is a button, icon or reorder pub position selection, if true cancel the function call
  if (clickedElement.classList.contains('pub_button') || clickedElement.classList.contains('icon') || clickedElement.classList.contains('reorderPubSelect')) {
    return false
  } else {
    // Retrieve the root pub HTML element by looking for the closest .pubDetailsButton element
    const pubElement = clickedElement.closest('ul > .pubDetailsButton')
    // Set the pub's place ID to the root pub elements id data attribute
    const pubID = pubElement.dataset.id
    fetch(`/pubdetails/${pubID}`)
    .then(function(response) {
      return response.json()
    }).then(function(body) {
      // Send the main content of the received JSON and call the function to display the pub's details
      showPubDetailsInterface(body.result)
    }).catch(function(error) {
      console.log("Pub Details Error: " + error)
    });
  }
}

/**
 * Assign the pub's details to the HTML elements in the show pub details menu
 * @param {Object} pub The pub representing the pub data retrieved from the Google Places API
 */
function showPubDetailsInterface(pub) {
  // Assign the pub details menu's HTML elements to variables
  const pubNameElement = pubDetailsContainer.querySelector('.pubDetails_name')
  const sliderElement = pubDetailsContainer.querySelector('.slider')
  const sliderContainerElement = pubDetailsContainer.querySelector('.slider__track')
  const dotContainerElement = pubDetailsContainer.querySelector('.slider__nav')
  const pubDetailsElement = pubDetailsContainer.querySelector('.pubDetailsGrid')
  const pubRatingElement = pubDetailsContainer.querySelector('.pubDetails_rating--top')
  const pubAddressElement = pubDetailsContainer.querySelector('.pubDetails_address')
  const pubUrlElement = pubDetailsContainer.querySelector('.pubDetails_url')
  const pubPhoneElement = pubDetailsContainer.querySelector('.pubDetails_phone')
  const pubOpenElement = pubDetailsContainer.querySelector('.pubDetails_open')
  const pubDetailsCloseButton = pubDetailsContainer.querySelector('.pubDetails_close')
  pubDetailsCloseButton.addEventListener('click', closeDetailsMenu)
  pubNameElement.innerHTML = pub.name

  // Remove all child elements from the slider element so that new slider images may be added
  removeChildren(sliderContainerElement)
  // Remove all child elements from the slider's dot container so that new dots may be added
  removeChildren(dotContainerElement)

  const photos = pub.photos
  if (photos != null) {
    sliderElement.style.display = 'grid'
    // For each pub photo, generate the slider's image element and assign the pub image to this element
    photos.forEach(photo => {
      const pubImageCode = photo.photo_reference
      // Generate a Google Places API URL that can be used to retrieve the image
      const pubImageUrl = googlePlacesPhotoUrl + pubImageCode + '&key=' + googleAPIKey
      const slideContainer = document.createElement('li')
      slideContainer.classList.add('slider__slide')
      const sliderImage = document.createElement('a')
      sliderImage.style.backgroundImage = `url(${pubImageUrl})`
      slideContainer.appendChild(sliderImage)
      sliderContainerElement.appendChild(slideContainer)

      const dotElement = document.createElement('button')
      dotElement.classList.add('slider__dot')
      dotContainerElement.appendChild(dotElement)
    })
    // Reset the slider's current slide to the first slide
    const firstSlide = sliderContainerElement.querySelector('.slider__slide')
    firstSlide.classList.add('selected')
    // Reset the slider's current dot to the first dot
    const firstDot = dotContainerElement.querySelector('.slider__dot')
    firstDot.classList.add('selected')
  } else {
    // Hide the slider if there are no pub photos for the current pub
    sliderElement.style.display = 'none'
  }

  const pubAddress = pub.formatted_address
  const pubWebsite = pub.website
  const pubPhone = pub.international_phone_number
  // Calculate the pub rating out of 100% by multiplying the original out of 5 rating by 20
  const pubRating = (pub.rating*20)
  // Set the graphical representation of the pub's rating based on percentage rating
  pubRatingElement.style.width = `${pubRating}%`
  const pubOpeningHours = pub.opening_hours
  if (pubAddress != null) {
    pubAddressElement.parentNode.style.display = 'flex'
    pubAddressElement.innerHTML = pubAddress
  } else {
    pubAddressElement.parentNode.style.display = 'none'
  }
  if (pubWebsite != null) {
    pubUrlElement.parentNode.style.display = 'flex'
    pubUrlElement.href = pubWebsite
  } else {
    pubUrlElement.parentNode.style.display = 'none'
  }
  if (pubPhone != null) {
    pubPhoneElement.parentNode.style.display = 'flex'
    pubPhoneElement.innerHTML = pubPhone
  } else {
    pubPhoneElement.parentNode.style.display = 'none'
  }
  if (pubOpeningHours != null) {
    pubOpenElement.parentNode.style.display = 'flex'
    if (pubOpeningHours.open_now == true) {
      pubOpenElement.innerHTML = 'Open Now'
    } else {
      pubOpenElement.innerHTML = 'Closed'
    }
  } else {
    pubOpenElement.parentNode.style.display = 'none'
  }
  // Open the menu now that the pub's details have been assigned to the elements
  openDetailsMenu()
  // Intitialise the slider by calling the initSlider function in the crawlSpace_slider.js file
  initSlider()
}

/**
 * Toggle the pub detail menu's visibility by showing the menu and stopping any scrolling within the page
 */
function openDetailsMenu() {
  body.classList.add('fixedScroll')
  searchPubsButton.classList.add('hidden')
  pubDetailsContainer.classList.add('menu--open')
}

/**
 * Remove all child elements from the HTML element
 */
function removeChildren(element) {
  while (element.firstChild) {
      element.removeChild(element.firstChild);
  }
}

/**
 * Hide the pub detail menu's visibility by showing the menu and enabling any scrolling within the page
 */
function closeDetailsMenu() {
  body.classList.remove('fixedScroll')
  searchPubsButton.classList.remove('hidden')
  pubDetailsContainer.classList.remove('menu--open')
  // Remove click event listener for the close pub details menu button as the menu is now closed
  const pubDetailsCloseButton = pubDetailsContainer.querySelector('.pubDetails_close')
  pubDetailsCloseButton.removeEventListener('click', closeDetailsMenu, true)
}

/**
 * Toggle the pub detail menu's visibility by showing the menu and stopping any scrolling within the page
 * @param {Object} results The JSON result from the Google Places API call for the pub search
 */
function displaySearchResults(results) {
  foundPubs = results.results
  const numberOfResults = foundPubs.length
  searchStatusElement.innerHTML = `Found ${numberOfResults} pubs`
  // For each pub found in the search create and append the pub element to the pub results list
  foundPubs.forEach(pub => searchResultsList.appendChild(displayPubResult(pub)))
  endOfSearchText = document.createElement('p')
  endOfSearchText.innerHTML = "No more pubs available, try other search criteria."
  searchResultsList.appendChild(endOfSearchText)
}
