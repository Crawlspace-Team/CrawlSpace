const searchButton = document.querySelector('#inputSearchButton')
const geolocationButton = document.querySelector('#geolocationButton')
searchButton.addEventListener('click', searchForPubs)
const googleAPIKey = 'AIzaSyC3v_pZbmLZNkIasBzu_U2M9wqyO3O1rf8'
const googlePlacesDetailUrl = 'https://maps.googleapis.com/maps/api/place/details/json?placeid='
const googlePlacesPhotoUrl = 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference='
const searchPubsMenu = document.querySelector('.searchPubsContainer')
const searchPubsOverlay = searchPubsMenu.querySelector('.overlay')
const searchPubsButton = document.querySelector('.button--hover')
const searchStatusElement = searchPubsMenu.querySelector('#searchStatus')
const searchResultsList = document.querySelector('#searchResults')

searchPubsButton.addEventListener('click', toggleSearchPubsMenu)
searchPubsOverlay.addEventListener('click', toggleSearchPubsMenu)
geolocationButton.addEventListener('click', getLocationByGeolocation)

const body = document.querySelector('body')

const pubDetailsContainer = document.querySelector('.pubDetailsContainer')
const pubDetailsOverlay = pubDetailsContainer.querySelector('.overlay')
pubDetailsOverlay.addEventListener('click', closeDetailsMenu)

let crawlID = ''

window.onload = function(){
  crawlID = window.location.href.split('/')[4]
  const pubs = document.querySelectorAll('.pubDetailsButton')
  pubs.forEach(pub => {
    pub.addEventListener('click', showPubDetails)
    const select = pub.querySelector('select')
    const options = select.querySelectorAll('option')
    const position = select.dataset.position-1
    const selectedOption = options[position]
    selectedOption.setAttribute('selected', true)
  })
}

function toggleSearchPubsMenu() {
  body.classList.toggle('fixedScroll')
  searchPubsMenu.classList.toggle('menu--open')
  searchPubsButton.classList.toggle('button--active')
}

function searchForPubs(e) {
  e.preventDefault()
  searchLocation = document.querySelector('#inputLocation').value
  if(searchLocation) {
    getLocationBySearch(searchLocation)
  }
}

function getLocationBySearch(searchLocation) {
  fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${searchLocation}&key=${googleAPIKey}`)
  .then(function(response) {
    return response.json()
  }).then(function(body) {
    const location = body.results[0].geometry.location
    const position = new Object();
    position.coords = {}
    position.coords.latitude = location.lat
    position.coords.longitude = location.lng
    getPubsAtLocation(position)
  }).catch(function(error) {
    console.log("Location search" + error)
  });
}

function getLocationByGeolocation(e) {
    e.preventDefault()
    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 0
      };
      navigator.geolocation.getCurrentPosition(getPubsAtLocation, handleErrors, options);
    } else {
      statusEle.innerHTML = 'Geolocation is not supported by this browser.';
      console.log('Geolocation is not supported by this browser.');
    }
}

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

function getPubsAtLocation(position) {
  const lat = position.coords.latitude
  const lon = position.coords.longitude
  searchStatusElement.innerHTML = 'Searching for pubs'
  removeChildren(searchResultsList)
  fetch(`/searchPubs/lat=${lat}&lon=${lon}`)
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

function displayPubResult(pub) {
  const pubName = pub.name
  const pubPlaceID = pub.place_id
  const pubAddress = pub.vicinity
  let pubImageUrl = ''
  if (pub.photos != null) {
    const pubImageCode = pub.photos[0].photo_reference
    pubImageUrl = googlePlacesPhotoUrl + pubImageCode + '&key=' + googleAPIKey
  }
  const pubLinkContainer = document.createElement('a')
  pubLinkContainer.classList.add('pubDetailsButton')
  pubLinkContainer.dataset.id = pubPlaceID
  const pubElement = document.createElement('li')
  pubElement.classList.add('pub')
  const pubOverlay = document.createElement('div')
  pubOverlay.classList.add('pub_overlay')
  if (pubImageUrl) {
    const pubImage = document.createElement('img')
    pubImage.classList.add('pub_image')
    pubImage.src = pubImageUrl
    pubElement.appendChild(pubImage)
  } else {
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
  pubLinkContainer.appendChild(pubElement)
  pubElement.appendChild(pubDescriptionElement)
  pubDescriptionElement.appendChild(pubNameElement)
  pubDescriptionElement.appendChild(pubAddressElement)

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

  function createAddPubForm() {
    const addPubForm = document.createElement('form')
    addPubForm.classList.add('addPubForm')
    addPubForm.action = '/crawl/' + crawlID + '/addpub/'
    addPubForm.method = 'POST'
    return addPubForm
  }

  function createValidationToken() {
    const token = document.createElement('input')
    token.type = 'hidden'
    token.value = csrfToken
    token.name = 'csrfmiddlewaretoken'
    return token
  }

  function createPubText() {
    const pubText = document.createElement('input')
    pubText.value = pubName
    pubText.type = 'hidden'
    pubText.name = 'pubname'
    return pubText
  }

  function createPubID() {
    const pubID = document.createElement('input')
    pubID.type = 'hidden'
    pubID.value = pubPlaceID
    pubID.name = 'placeid'
    return pubID
  }

  function createPubButton() {
    const pubButton = document.createElement('button')
    pubButton.classList.add('pub_button')
    pubButton.type = 'submit'
    pubButton.name = 'addPub'
    return pubButton
  }

  function createAddIcon() {
    const addIcon = document.createElement('img')
    addIcon.classList.add('icon')
    addIcon.src = '/static/images/plus_icon_blue.svg'
    return addIcon
  }
}

function showPubDetails(e) {
  const clickedElement = e.target
  console.log(e.target);
  if (clickedElement.classList.contains('pub_button') || clickedElement.classList.contains('icon') || clickedElement.classList.contains('reorderPubSelect')) {
    return false
  } else {
    const pubElement = clickedElement.closest('ul > .pubDetailsButton')
    const pubID = pubElement.dataset.id

    fetch(`/pubdetails/${pubID}`)
    .then(function(response) {
      return response.json()
    }).then(function(body) {
      showPubDetailsInterface(body.result)
    }).catch(function(error) {
      console.log("Pub Details Error: " + error)
    });
  }
}

function showPubDetailsInterface(pub) {
  console.log(pub)
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

  removeChildren(sliderContainerElement)
  removeChildren(dotContainerElement)

  const photos = pub.photos
  if (photos != null) {
    sliderElement.style.display = 'grid'
    photos.forEach(photo => {
      const pubImageCode = photo.photo_reference
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
    const firstSlide = sliderContainerElement.querySelector('.slider__slide')
    firstSlide.classList.add('is-selected')
    const firstDot = dotContainerElement.querySelector('.slider__dot')
    firstDot.classList.add('is-selected')
  } else {
    sliderElement.style.display = 'none'
  }

  const pubAddress = pub.formatted_address
  const pubWebsite = pub.website
  const pubPhone = pub.international_phone_number
  const pubRating = (pub.rating*20)
  const pubOpeningHours = pub.opening_hours
  pubRatingElement.style.width = `${pubRating}%`
  if (pubAddress != null) {
    pubAddressElement.innerHTML = pubAddress
  }
  if (pubWebsite != null) {
    pubUrlElement.innerHTML = pubWebsite
    pubUrlElement.href = pubWebsite
  }
  if (pubPhone != null) {
    pubPhoneElement.innerHTML = pubPhone
  }
  if (pubOpeningHours != null) {
    if (pubOpeningHours.open_now == true) {
      pubOpenElement.innerHTML = 'Open Now'
    } else {
      pubOpenElement.innerHTML = 'Closed'
    }
  }
  openDetailsMenu()
  initSlider()
}

function openDetailsMenu() {
  body.classList.add('fixedScroll')
  searchPubsButton.classList.add('hidden')
  pubDetailsContainer.classList.add('menu--open')
}

function removeChildren(element) {
  while (element.firstChild) {
      element.removeChild(element.firstChild);
  }
}

function closeDetailsMenu() {
  body.classList.remove('fixedScroll')
  searchPubsButton.classList.remove('hidden')
  pubDetailsContainer.classList.remove('menu--open')
  const pubDetailsCloseButton = pubDetailsContainer.querySelector('.pubDetails_close')
  pubDetailsCloseButton.removeEventListener('click', closeDetailsMenu, true)
}

function displaySearchResults(results) {
  foundPubs = results.results
  const numberOfResults = foundPubs.length
  searchStatusElement.innerHTML = `Found ${numberOfResults} pubs`
  foundPubs.forEach(pub => searchResultsList.appendChild(displayPubResult(pub)))
  endOfSearchText = document.createElement('p')
  endOfSearchText.innerHTML = "No more pubs available, try other search criteria."
  searchResultsList.appendChild(endOfSearchText)
}
