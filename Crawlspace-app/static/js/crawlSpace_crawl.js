const searchButton = document.querySelector('#inputSearchButton')
searchButton.addEventListener('click', searchForPubs)

const googleAPIKey = 'AIzaSyDw2YcCGEW97S5zIoTwv13fEjIzc118CjY'

function searchForPubs(e) {
  e.preventDefault()
  searchLocation = document.querySelector('#inputLocation').value
  console.log(searchLocation)
  getLocation()
  return false
}

document.addEventListener('DOMContentLoaded', function(event) {
  getLocation();
});

function getLocation() {
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
    displaySearchResults(body)
    return true
  })
}

function displaySearchResults(results) {
  foundPubs = results.results
  console.log(foundPubs);
  const resultsList = document.querySelector('#searchResults')
  for (pub in foundPubs) {
    pubName = foundPubs[pub].name
    pubPlaceID = foundPubs[pub].place_id
    let pubElement = document.createElement('li')
    pubElement.innerHTML = pubName + ', ' + pubPlaceID
    resultsList.appendChild(pubElement)
  }
}
