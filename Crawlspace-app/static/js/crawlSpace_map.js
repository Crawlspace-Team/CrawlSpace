const nextLocationContainer = document.querySelector('#nextLocation')
const nextLocationNext = nextLocationContainer.querySelector('#nextLocation__next')
const nextLocationCentre = nextLocationContainer.querySelector('#nextLocation__centre')
nextLocationNext.addEventListener('click', nextLocation)
nextLocationCentre.addEventListener('click', centreOnGeolocation)
let currentPubIndex = 0
let pubs = []
let map = ''

function getCrawlPubs () {
  //Retrieve the Crawl ID from the URL
  crawlID = window.location.href.split('/')[4]
  fetch(`/crawl/${crawlID}/getpubs/`)
  .then(function(response) {
    return response.json()
  }).then(function(body) {
    pubs = body
    initMap(body)
    nextLocation()
  }).catch(function(error) {
    console.log(error)
  });
}

function nextLocation() {
  const numberOfPubs = pubs.length
  const nextLocationName = nextLocationContainer.querySelector('#nextLocation__name')
  const nextLocationAddress = nextLocationContainer.querySelector('#nextLocation__address')
  if (pubs.length == 0) {
    nextLocationName.innerHTML = 'No pubs in crawl!'
    nextLocationAddress.innerHTML = ''
    nextLocationNext.style.display = 'none'
  } else if (currentPubIndex < numberOfPubs) {
    const pub = pubs[currentPubIndex]
    const pubPosition = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[currentPubIndex]
    nextLocationName.innerHTML = `Next Pub: ${pubPosition}, ${pub.name}`
    nextLocationAddress.innerHTML = pub.address
    if (currentPubIndex == numberOfPubs-1) {
      nextLocationNext.innerHTML = 'End Crawl'
    } else {
      nextLocationNext.innerHTML = 'Next Pub'
    }
    currentPubIndex++
    map.setCenter(pub);
  } else {
    nextLocationName.innerHTML = 'End of crawl'
    nextLocationAddress.innerHTML = ''
    nextLocationNext.innerHTML = 'Restart Crawl'
    currentPubIndex = 0
  }
}

function initMap(pubs) {
  const numberOfPubs = pubs.length

  map = new google.maps.Map(document.getElementById('map'), {
    //Set map center to UK
    center: {lat: 52.083701, lng: -1.159112},
    zoom: 10
  })

  infoWindow = new google.maps.InfoWindow;

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    runGeolocation(false);
    setInterval(function(){ runGeolocation(false) }, 3000);
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }

  if (numberOfPubs >= 2) {
    displayCrawlRoute(pubs)
  } else if (numberOfPubs == 1){
    const pub = pubs[0]
    displaySinglePub(pub)
  }
}

function displaySinglePub(pub) {
  const marker = new google.maps.Marker({
     position: pub,
     map: map,
     title: 'Hello World!'
   });
}

function displayCrawlRoute(pubs) {
  const numberOfPubs = pubs.length
  const firstPub = pubs[0]
  const lastPub = pubs[numberOfPubs-1]
  let middlePubs = []
  if (numberOfPubs > 2) {
    middlePubs = pubs.slice(1,numberOfPubs-1)
  }

  let waypointPubs = []
  for (pub in middlePubs) {
    const waypointPub = new Object();
    waypointPub.location = {}
    waypointPub.location.lat = middlePubs[pub].lat
    waypointPub.location.lng = middlePubs[pub].lng
    waypointPub.stopover = true
    waypointPubs.push(waypointPub)
  }

  const directionsDisplay = new google.maps.DirectionsRenderer({map: map})

  // Set destination, origin and travel mode.
  const request = {
    destination: lastPub,
    origin: firstPub,
    waypoints: waypointPubs,
    travelMode: 'WALKING'
  }

  // Pass the directions request to the directions service.
  const directionsService = new google.maps.DirectionsService()
  directionsService.route(request, function(response, status) {
    if (status == 'OK') {
      // Display the route on the map.
      directionsDisplay.setDirections(response)
      map.setCenter(firstPub)
    }
  })
}

function centreOnGeolocation() {
  if (navigator.geolocation) {
    runGeolocation(true)
  }
}

function runGeolocation(centreMap) {
  navigator.geolocation.getCurrentPosition(function(position) {
    const currentPosition = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };

    infoWindow.setPosition(currentPosition);
    infoWindow.setContent('Current Location');
    infoWindow.open(map);
    if (centreMap == true) {
      map.setCenter(currentPosition)
    }
  }, function() {
    handleLocationError(true, infoWindow, map.getCenter());
  });
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent('Error: The Geolocation service failed.');
  infoWindow.open(map);
}
