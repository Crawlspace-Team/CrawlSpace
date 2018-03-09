const nextLocationContainer = document.querySelector('#nextLocation')
const nextLocationButton = nextLocationContainer.querySelector('#nextLocation__button')
nextLocationButton.addEventListener('click', nextLocation)
let currentPubIndex = 0
let pubs = []
let map = ''

function getCrawlPubs () {
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
  if (currentPubIndex < numberOfPubs) {
    const pub = pubs[currentPubIndex]
    nextLocationName.innerHTML = 'Next pub: ' + pub.name
    nextLocationAddress.innerHTML = pub.address
    currentPubIndex++
    map.setCenter(pub);
  } else {
    nextLocationName.innerHTML = 'End of crawl'
    nextLocationAddress.innerHTML = ''
  }
}

function initMap(pubs) {
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

  map = new google.maps.Map(document.getElementById('map'), {
    center: firstPub,
    zoom: 7
  })

  infoWindow = new google.maps.InfoWindow;

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      infoWindow.setPosition(pos);
      infoWindow.setContent('Location found.');
      infoWindow.open(map);
      map.setCenter(pos);
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
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
    }
  })
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}
