const searchButton = document.querySelector('#inputSearchButton')
const geolocationButton = document.querySelector('#geolocationButton')
searchButton.addEventListener('click', searchForPubs)
const googleAPIKey = 'AIzaSyC3v_pZbmLZNkIasBzu_U2M9wqyO3O1rf8'

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
    pubName = foundPubs[pub].name
    pubPlaceID = foundPubs[pub].place_id
    let pubElement = document.createElement('li')
    pubElement.innerHTML = pubName + ', ' + pubPlaceID
    resultsList.appendChild(pubElement)
  }
}
