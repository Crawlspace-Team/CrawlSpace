// Create global variables to track the crawl's completion
let currentPubIndex = 0
let pubs = []
let map = ''

// 
const nextLocationContainer = document.querySelector('#nextLocation')
const nextLocationNext = nextLocationContainer.querySelector('#nextLocation__next')
const nextLocationCentre = nextLocationContainer.querySelector('#nextLocation__centre')

// Assign an event listener to the next location button
nextLocationNext.addEventListener('click', nextLocation)
// Assign an event listener to the centre map button
nextLocationCentre.addEventListener('click', centreOnGeolocation)

/**
 * Call the Crawlspace server and get all the pubs within the current crawl
 */
function getCrawlPubs () {
  //Retrieve the Crawl ID from the URL
  crawlID = window.location.href.split('/')[4]
  // Call the Crawlspace server and get the crawl's pubs
  fetch(`/crawl/${crawlID}/getpubs/`)
  .then(function(response) {
    return response.json()
  }).then(function(body) {
    pubs = body
    // Initialise the map based on the crawl's pub details
    initMap(body)
    // Show the next location text and center the map to this location
    nextLocation()
  }).catch(function(error) {
    console.log(error)
  });
}

/**
 * Check if there are still more pubs within the crawl's route and display this route on the page
 */
function nextLocation() {
  const numberOfPubs = pubs.length
  const nextLocationName = nextLocationContainer.querySelector('#nextLocation__name')
  const nextLocationAddress = nextLocationContainer.querySelector('#nextLocation__address')
  if (pubs.length == 0) {
    nextLocationName.innerHTML = 'No pubs in crawl!'
    nextLocationAddress.innerHTML = ''
    nextLocationNext.style.display = 'none'
  } else if (currentPubIndex < numberOfPubs) {
    // If there are still more pubs in the crawl's route
    const pub = pubs[currentPubIndex]
    // Create an alphabet string which is used to get the alphabetical marker based on the current pubs position in the crawl
    const pubPosition = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[currentPubIndex]
    nextLocationName.innerHTML = `Next Pub: ${pubPosition}, ${pub.name}`
    nextLocationAddress.innerHTML = pub.address
    if (currentPubIndex == numberOfPubs-1) {
      nextLocationNext.innerHTML = 'End Crawl'
    } else {
      nextLocationNext.innerHTML = 'Next Pub'
    }
    currentPubIndex++
    // Center the map based on the location of the current pub
    map.setCenter(pub);
  } else {
    nextLocationName.innerHTML = 'End of crawl'
    nextLocationAddress.innerHTML = ''
    nextLocationNext.innerHTML = 'Restart Crawl'
    currentPubIndex = 0
  }
}

/**
 * Initialise the map based on the pub objects within the crawl and display the route between these pubs
 * @param {Array} pubs List of objects representing the pubs with location data formatted for the Google Maps API
 */
function initMap(pubs) {
  const numberOfPubs = pubs.length

  // Create the Google Maps element based on the Google Maps API
  map = new google.maps.Map(document.getElementById('map'), {
    //Set map center to UK
    center: {lat: 52.083701, lng: -1.159112},
    zoom: 10
  })

  // Create an text window within the map to display information to the user
  infoWindow = new google.maps.InfoWindow;

  // Test if the browser supports geolocation
  if (navigator.geolocation) {
    // Geolocate the user and dont center the map
    runGeolocation(false);
    // Geolocate the user every 3 seconds
    setInterval(function(){ runGeolocation(false) }, 3000);
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }


  if (numberOfPubs >= 2) {
    // If there are more than two pubs show the route between the pubs
    displayCrawlRoute(pubs)
  } else if (numberOfPubs == 1){
    const pub = pubs[0]
    // Show the single pub as a custom marker
    displaySinglePub(pub)
  }
}

/**
 * Create a custom marker on the map base on the location of the pub
 * @param {Object} pub Object representing the pub with location data formatted for the Google Maps API
 */
function displaySinglePub(pub) {
  const marker = new google.maps.Marker({
     position: pub,
     map: map,
     title: pub.name
   });
}

/**
 * Display the optimal route between the pubs in the crawl
 * @param {Array} pubs List of objects representing the pubs with location data formatted for the Google Maps API
 */
function displayCrawlRoute(pubs) {
  const numberOfPubs = pubs.length
  const firstPub = pubs[0]
  const lastPub = pubs[numberOfPubs-1]
  let middlePubs = []
  // If there are more than two pubs set middlePubs to all pubs except the first and last
  if (numberOfPubs > 2) {
    middlePubs = pubs.slice(1,numberOfPubs-1)
  }

  let waypointPubs = []
  for (pub in middlePubs) {
    // Create a new object based on the latitude and longitude of the pub, formatted for the Google Maps API
    const waypointPub = new Object();
    waypointPub.location = {}
    waypointPub.location.lat = middlePubs[pub].lat
    waypointPub.location.lng = middlePubs[pub].lng
    waypointPub.stopover = true
    waypointPubs.push(waypointPub)
  }

  // Set the Google Maps API to use the page's map element to render the direction
  const directionsDisplay = new google.maps.DirectionsRenderer({map: map})

  // Set destination, origin, and waypoints based on the crawl's pubs
  const request = {
    destination: lastPub,
    origin: firstPub,
    waypoints: waypointPubs,
    // Ensure that the map's directions use routes only accessible by walking
    travelMode: 'WALKING'
  }

  // Pass the directions request to the directions service and render the route
  const directionsService = new google.maps.DirectionsService()
  directionsService.route(request, function(response, status) {
    if (status == 'OK') {
      // Display the route on the map.
      directionsDisplay.setDirections(response)
      map.setCenter(firstPub)
    }
  })
}

/**
 * Centre the map based on the current location of the user's device
 */
function centreOnGeolocation() {
  if (navigator.geolocation) {
    // Retrieve browser geolocation data and center the map
    runGeolocation(true)
  }
}

/**
 * Call the browser's geolocation API and retrieve the latitude and longitude of the device
 * @param {Boolean} centreMap Boolean representing whether to center the map based on the geolocation data
 */
function runGeolocation(centreMap) {
  navigator.geolocation.getCurrentPosition(function(position) {
    // Set the current position based on the location data
    const currentPosition = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };

    // Set the window of the current location marker to the geolocation data
    infoWindow.setPosition(currentPosition);
    infoWindow.setContent('Current Location');
    // Render the current location marker on the map
    infoWindow.open(map);
    if (centreMap == true) {
      map.setCenter(currentPosition)
    }
  }, function() {
    // Handle the geolocation error
    handleLocationError(true, infoWindow, map.getCenter());
  });
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  // Display a message to the user informing them that geolocation is not current working
  infoWindow.setPosition(pos);
  infoWindow.setContent('Error: The Geolocation service failed.');
  infoWindow.open(map);
}
