const searchButton = document.querySelector('#inputSearchButton')
const geolocationButton = document.querySelector('#geolocationButton')
searchButton.addEventListener('click', searchForPubs)
const googleAPIKey = 'AIzaSyC3v_pZbmLZNkIasBzu_U2M9wqyO3O1rf8'
const googlePlacesPhotoUrl = 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference='
const searchPubsMenu = document.querySelector('.searchPubsContainer')
const searchpubsOverlay = searchPubsMenu.querySelector('.overlay')
const searchPubsButton = document.querySelector('.button--searchPubs')
searchPubsButton.addEventListener('click', toggleSearchPubsMenu)
searchpubsOverlay.addEventListener('click', toggleSearchPubsMenu)
geolocationButton.addEventListener('click', getLocationByGeolocation)
const body = document.querySelector('body')

function toggleSearchPubsMenu() {
  body.classList.toggle('fixedScroll')
  searchPubsMenu.classList.toggle('menu--open')
  searchPubsButton.classList.toggle('button--active')
}


function searchForPubs(e) {
  e.preventDefault()
  searchLocation = document.querySelector('#inputLocation').value
  console.log(searchLocation)
  if(searchLocation) {
    getLocationBySearch(searchLocation)
  } else {
    console.log("Search input empty");
  }
  //getLocationByGeolocation()
}

function getLocationBySearch(searchLocation) {
  searchString = searchLocation
  fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${searchString}&key=${googleAPIKey}`)
  .then(function(response) {
    return response.json()
  }).then(function(body) {
    const location = body.results[0].geometry.location
    const position = new Object();
    position.coords = {}
    position.coords.latitude = location.lat
    position.coords.longitude = location.lng
    console.log(position);
    getPubsAtLocation(position)
  }).catch(function(error) {
    console.log("Location search" + error)
  });
}

function getLocationByGeolocation(e) {
    e.preventDefault()
    console.log('Geolocation search');
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
  //fetch(`/searchPubs/${lat}/${long}/`)
  fetch(`/searchPubs/lat=${lat}&lon=${lon}`)
  .then(function(response) {
    return response.json()
  }).then(function(body) {
    console.log(body)
    displaySearchResults(body)
    return true
  }).catch(function(error) {
    console.log(error)
    return false
  });
}

function displaySearchResults(results) {
  foundPubs = results.results
  const resultsList = document.querySelector('#searchResults')
  while (resultsList.firstChild) {
      resultsList.removeChild(resultsList.firstChild);
  }
  for (pub in foundPubs) {
    console.log(foundPubs[pub])
    const pubName = foundPubs[pub].name
    const pubPlaceID = foundPubs[pub].place_id
    let pubImageUrl = ''
    if (foundPubs[pub].photos != null) {
      const pubImageCode = foundPubs[pub].photos[0].photo_reference
      pubImageUrl = googlePlacesPhotoUrl + pubImageCode + '&key=' + googleAPIKey
      console.log(pubImageUrl);
    }
    const pubLinkContainer = document.createElement('a')
    pubLinkContainer.classList.add('pubDetailsButton')
    const pubElement = document.createElement('li')
    pubElement.classList.add('pub')
    const pubOverlay = document.createElement('div')
    pubOverlay.classList.add('pub_overlay')
    const pubImage = document.createElement('img')
    pubImage.classList.add('pub_image')
    pubImage.src = pubImageUrl
    const pubDescription = document.createElement('section')
    pubDescription.classList.add('pub_description')
    const pubNameElement = document.createElement('p')
    pubNameElement.classList.add('pub_name')
    const pubAddress = document.createElement('p')
    pubAddress.classList.add('pub_address')
    pubNameElement.innerHTML = pubName + ', ' + pubPlaceID
    resultsList.appendChild(pubLinkContainer)
    pubLinkContainer.appendChild(pubElement)
    pubElement.appendChild(pubOverlay)
    pubElement.appendChild(pubImage)
    pubElement.appendChild(pubDescription)
    pubDescription.appendChild(pubNameElement)
    pubDescription.appendChild(pubAddress)
  }
}
