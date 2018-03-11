# Standard library imports
import requests
import json

# Django imports
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, authenticate
from django.shortcuts import render, redirect
from django.http import JsonResponse

# Local app imports
from .forms import *
from .models import *
from .functions import *

GOOGLE_API_KEY = 'AIzaSyC3v_pZbmLZNkIasBzu_U2M9wqyO3O1rf8'
GOOGLE_PLACES_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json?placeid='
GOOGLE_PLACES_PHOTO_URL = 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference='


@login_required
def home(request):
    """
    Renders the home page.

    Retrieves the crawls created by the current user and renders them within the home page.

    Parameters
    ----------
    request : HttpRequest
        HttpRequest object retrieved from the url

    Returns
    -------
    HttpRequest
        Home.html page rendered with the user's created crawls

    """
    crawls = Crawl.objects.filter(user=request.user)
    for crawl in crawls:
        crawl.startDate = format_crawl_date(crawl)
        pubs = PubOnCrawl.objects.filter(crawl=crawl).order_by('position')
        number_of_pubs = len(pubs)
        if number_of_pubs >= 1:
            first_pub = pubs[0]
            place_id = str(first_pub.pub.places_id)
            raw_pub_data = requests.get(get_places_details(place_id))
            pub_data = json.loads(raw_pub_data.content)
            pub_details = pub_data['result']
            pub_photos = pub_details['photos']
            if 'photos' in pub_details:
                if len(pub_photos) >= 1:
                    pub_photo_ref = pub_photos[0]['photo_reference']
                    crawl.thumbnail = get_places_photo_url(pub_photo_ref)
        return render(request, 'home.html', {'crawls': crawls, 'status': ''})
    return render(request, 'home.html', {'crawls': [], 'status': 'No crawls'})


def signup(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            raw_password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=raw_password)
            login(request, user)
            return redirect('home')
    else:
        form = SignUpForm()
    return render(request, 'signup.html', {'form': form})


@login_required
def newCrawl(request):
    if request.method == 'POST':
        form = NewCrawlForm(request.POST)
        if form.is_valid():
            crawlName = crawl_name = form.cleaned_data.get('name')
            crawlStartDate = startdate = form.cleaned_data.get('crawlstartdate')
            crawl = Crawl.objects.create(user=request.user, crawl_name=crawlName, start_date=crawlStartDate)
            crawl.save()
    return redirect('/')


@login_required
def editCrawl(request):
    if request.method == 'POST':
        form = EditCrawlForm(request.POST)
        if form.is_valid():
            crawl = Crawl.objects.get(id=form.cleaned_data.get('crawlid'))
            if (crawl.user == request.user):
                crawl.crawl_name = form.cleaned_data.get('name')
                crawl.startdate = form.cleaned_data.get('crawlstartdate')
                crawl.save()
    return redirect('/')


@login_required
def deleteCrawl(request, pk):
    crawl = Crawl.objects.get(id=pk)
    if (crawl.user == request.user):
        crawl.delete()
    return redirect('/')


@login_required
def viewCrawl(request, pk):
    crawl = Crawl.objects.get(id=pk)
    status = ''
    if (crawl.user == request.user):
        pubs = PubOnCrawl.objects.filter(crawl=crawl).order_by('position')
        for pub in pubs:
            pub.name = pub.pub.pub_name
            pub.place_ID = pub.pub.places_id
            rawPubData = requests.get(GOOGLE_PLACES_DETAILS_URL + pub.pub.places_id + '&key=' + GOOGLE_API_KEY)
            if (json.loads(rawPubData.content)['status'] == 'OVER_QUERY_LIMIT'):
                print('OVER LIMIT')
                status = 'Over api query limit'
            else:
                pubData = rawPubData.content
                pubData = json.loads(pubData)
                pubData = pubData['result']
                if ('formatted_phone_number' in pubData):
                    pub.phoneNumber = pubData['formatted_phone_number']
                if ('photos' in pubData):
                    pubPhotos = pubData['photos']
                    pubThumbnailObject = pubPhotos[0]
                    pubThumbnailRef = pubThumbnailObject['photo_reference']
                    pubThumbnailUrl = GOOGLE_PLACES_PHOTO_URL + pubThumbnailRef + '&key=' + GOOGLE_API_KEY
                    pub.thumbnail = pubThumbnailUrl
                if ('address_components' in pubData):
                    pubAddressComponents = pubData['address_components']
                    pubStreetNumber = pubAddressComponents[0]['short_name']
                    pubStreet = pubAddressComponents[1]['short_name']
                    pubLocation = pubAddressComponents[2]['short_name']
                    pub.address = pubStreetNumber + ' ' + pubStreet + ', ' + pubLocation
        if (pubs.exists()):
            return render(request, 'crawl.html',
                          {'status': status, 'crawl_name': crawl.crawl_name, 'crawl_id': crawl.id, 'pubs': pubs})
        else:
            status = 'No Pubs in crawl'
            return render(request, 'crawl.html',
                          {'status': status, 'crawl_name': crawl.crawl_name, 'crawl_id': crawl.id, 'pubs': []})


@login_required
def addPub(request, pk):
    if request.method == 'POST':
        form = AddPubForm(request.POST)
        if form.is_valid():
            crawl = Crawl.objects.get(id=pk)
            if (crawl.user == request.user):
                pubsOnCrawl = PubOnCrawl.objects.filter(crawl=crawl).order_by('position')
                numOfPubs = len(pubsOnCrawl) + 1
                pubName = form.cleaned_data.get('pubname')
                pubplace_ID = form.cleaned_data.get('place_ID')
                pub = Pub.objects.create(pub_name=pubName, places_id=pubplace_ID)
                pub.save()
                pubOnCrawl = PubOnCrawl.objects.create(pub=pub, crawl=crawl, position=numOfPubs)
                pubOnCrawl.save()
    return redirect('/crawl/' + pk + '/')


@login_required
def viewMap(request, pk):
    crawl = Crawl.objects.get(id=pk)
    if (crawl.user == request.user):
        pubs = PubOnCrawl.objects.filter(crawl=crawl).order_by('position')
        if (pubs.exists()):
            return render(request, 'map.html',
                          {'status': '', 'crawl_name': crawl.crawl_name, 'crawl_id': crawl.id, 'pubs': pubs})
        else:
            return render(request, 'map.html',
                          {'status': 'No Pubs in crawl', 'crawl_name': crawl.crawl_name, 'crawl_id': crawl.id,
                           'pubs': []})


@login_required
def reorderPub(request, pk):
    if request.method == 'POST':
        form = ReorderPubForm(request.POST)
        print(form)
        if form.is_valid():
            print("valid")
            crawl = Crawl.objects.get(id=pk)
            if (crawl.user == request.user):
                pubsOnCrawl = PubOnCrawl.objects.filter(crawl=crawl).order_by('position')
                oldPosition = form.cleaned_data.get('pubposition')
                newPosition = form.cleaned_data.get('newposition')
                for pub in pubsOnCrawl:
                    print(pub.pub.pub_name + ", " + str(pub.position))
                print("old: " + str(oldPosition) + ", new: " + str(newPosition))
                first_pub = pubsOnCrawl[oldPosition - 1]
                secondPub = pubsOnCrawl[newPosition - 1]
                first_pub.position = newPosition
                secondPub.position = oldPosition
                first_pub.save()
                secondPub.save()
    return redirect('/crawl/' + pk + '/')


@login_required
def deletePub(request, pk):
    print('delete pub')
    if request.method == 'POST':
        form = DeletePubForm(request.POST)
        if form.is_valid():
            crawl = Crawl.objects.get(id=pk)
            if (crawl.user == request.user):
                pubPosition = form.cleaned_data.get('pubposition')
                pub = PubOnCrawl.objects.filter(crawl=crawl, position=pubPosition)
                pub.delete()
                pubs = PubOnCrawl.objects.filter(crawl=crawl).order_by('position')
                pubCounter = 0
                for pub in pubs:
                    pubPosition = pub.position
                    pubCounter = pubCounter + 1
                    if (pubPosition != pubCounter):
                        pub.position = (pubPosition - 1)
                        pub.save()

    return redirect('/crawl/' + pk + '/')


@login_required
def clearPubs(request, pk):
    crawl = Crawl.objects.get(id=pk)
    if (crawl.user == request.user):
        pubs = PubOnCrawl.objects.filter(crawl=crawl).order_by('position')
        for pub in pubs:
            pub.delete()
    return redirect('/crawl/' + pk + '/')


@login_required
def orderStartDate(request):
    crawls = Crawl.objects.filter(user=request.user)
    orderedCrawls = crawls.order_by('start_date')
    if (crawls.exists()):
        return render(request, 'home.html', {'crawls': orderedCrawls, 'status': ''})
    else:
        return render(request, 'home.html', {'crawls': [], 'status': 'No crawls'})


@login_required
def orderCrawlName(request):
    crawls = Crawl.objects.filter(user=request.user)
    orderedCrawls = crawls.order_by('crawl_name')
    if (crawls.exists()):
        return render(request, 'home.html', {'crawls': orderedCrawls, 'status': ''})
    else:
        return render(request, 'home.html', {'crawls': [], 'status': 'No crawls'})


def searchPubs(request, lat, lon):
    searchRadius = str(2000)
    searchType = 'Pub'
    searchResult = requests.get(
        'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + lat + ',' + lon + '&radius=' + searchRadius + '&type=' + searchType + '&keyword=pub&key=' + GOOGLE_API_KEY)
    searchResult = searchResult.content
    searchResult = json.loads(searchResult)
    return JsonResponse(searchResult, safe=False)


def pubDetails(request, id):
    pubDetailsUrl = (GOOGLE_PLACES_DETAILS_URL + str(id) + '&key=' + GOOGLE_API_KEY)
    pubDetails = requests.get(pubDetailsUrl)
    pubDetails = pubDetails.content
    pubDetails = json.loads(pubDetails)
    return JsonResponse(pubDetails, safe=False)


def getPubs(request, pk):
    crawl = Crawl.objects.get(id=pk)
    pubs = []
    rawPubs = PubOnCrawl.objects.filter(crawl=crawl).order_by('position')
    for pub in rawPubs:
        place_ID = pub.pub.places_id
        rawPubData = requests.get(GOOGLE_PLACES_DETAILS_URL + str(place_ID) + '&key=' + GOOGLE_API_KEY)
        pubData = json.loads(rawPubData.content)
        pubData = pubData['result']
        pubName = pubData['name']
        pubAddress = pubData['formatted_address']
        pubLocation = pubData['geometry']['location']
        pubLat = pubLocation['lat']
        pubLong = pubLocation['lng']

        pubJSON = {}
        pubJSON['name'] = pubName
        pubJSON['address'] = pubAddress
        pubJSON['lat'] = pubLat
        pubJSON['lng'] = pubLong
        pubs.append(pubJSON)
    return JsonResponse(pubs, safe=False)
