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

document.addEventListener("DOMContentLoaded", function(event) {
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
      statusEle.innerHTML = "Geolocation is not supported by this browser.";
      console.log("Geolocation is not supported by this browser.");
    }
}

function handleErrors(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            console.log("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            console.log("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            console.log("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            console.log("An unknown error occurred.");
            break;
    }
}

function getPubsAtLocation(position) {
  const lat = position.langitude
  const long = position.longitude
  fetch('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=50.790589,-1.089377&radius=500&type=pub&keyword=pub&key=AIzaSyDw2YcCGEW97S5zIoTwv13fEjIzc118CjY')
  .then(function(response) {
    return response.text()
  }).then(function(body) {
    console.log(body)
    return true
  }).catch(function(error) {
    console.log('Fetch error')
  });
}
