from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, authenticate
from django.shortcuts import render, redirect

from crawlspace.core.forms import *
from crawlspace.core.models import *
import requests
import json
from django.http import JsonResponse

googleAPIKey = 'AIzaSyC3v_pZbmLZNkIasBzu_U2M9wqyO3O1rf8'
googlePlacesDetailUrl = 'https://maps.googleapis.com/maps/api/place/details/json?placeid='
googlePlacesPhotoUrl = 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference='

@login_required
def home(request):
    crawls = Crawl.objects.filter(user=request.user)
    if (crawls.exists()):
        return render(request, 'home.html', {'crawls': crawls, 'status': ''})
    else:
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
            crawlName = Crawl_Name=form.cleaned_data.get('name')
            crawlStartDate = startdate=form.cleaned_data.get('crawlstartdate')
            crawl = Crawl.objects.create(user=request.user, Crawl_Name=crawlName, startdate=crawlStartDate)
            crawl.save()
    return redirect('/')

@login_required
def editCrawl(request):
    if request.method == 'POST':
        form = EditCrawlForm(request.POST)
        if form.is_valid():
            crawl = Crawl.objects.get(id=form.cleaned_data.get('crawlid'))
            if (crawl.user == request.user):
                crawl.Crawl_Name = form.cleaned_data.get('name')
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
        pubs = Pub_On_Crawl.objects.filter(crawl=crawl)
        for pub in pubs:
            pub.name = pub.pub.Pub_Name
            pub.placeID = pub.pub.Places_ID
            #pub.position = pub.position + 1
            rawPubData = requests.get(googlePlacesDetailUrl + pub.pub.Places_ID + '&key=' + googleAPIKey)
            if (json.loads(rawPubData.content)['status'] == 'OVER_QUERY_LIMIT'):
                print('OVER LIMIT')
                status = 'Over api query limit'
            else:
                pubData = rawPubData.content
                pubData = json.loads(pubData)
                pubData = pubData['result']
                if('formatted_phone_number' in pubData):
                    pub.phoneNumber = pubData['formatted_phone_number']
                if('photos' in pubData):
                    pubPhotos = pubData['photos']
                    pubThumbnailObject = pubPhotos[0]
                    pubThumbnailCode = pubThumbnailObject['photo_reference']
                    pubThumbnailUrl = googlePlacesPhotoUrl + pubThumbnailCode + '&key=' + googleAPIKey
                    pub.thumbnail = pubThumbnailUrl
                if('address_components' in pubData):
                    pubAddressComponents  = pubData['address_components']
                    pubStreetNumber = pubAddressComponents[0]['short_name']
                    pubStreet = pubAddressComponents[1]['short_name']
                    pubLocation = pubAddressComponents[2]['short_name']
                    pub.address = pubStreetNumber + ' ' + pubStreet + ', ' + pubLocation
        if (pubs.exists()):
            return render(request, 'crawl.html', {'status' : status, 'crawl_name' : crawl.Crawl_Name, 'crawl_id': crawl.id, 'pubs': pubs})
        else:
            status = 'No Pubs in crawl'
            return render(request, 'crawl.html', {'status' : status, 'crawl_name' : crawl.Crawl_Name, 'crawl_id': crawl.id, 'pubs': []})

@login_required
def addPub(request, pk):
    if request.method == 'POST':
        form = AddPubForm(request.POST)
        if form.is_valid():
            crawl = Crawl.objects.get(id=pk)
            if (crawl.user == request.user):
                pubsOnCrawl = Pub_On_Crawl.objects.filter(crawl=crawl)
                numOfPubs = len(pubsOnCrawl)+1
                pubName = form.cleaned_data.get('pubname')
                pubPlaceID = form.cleaned_data.get('placeid')
                pub = Pub.objects.create(Pub_Name=pubName, Places_ID=pubPlaceID)
                pub.save()
                pubOnCrawl = Pub_On_Crawl.objects.create(pub=pub, crawl=crawl, position=numOfPubs)
                pubOnCrawl.save()
    return redirect('/crawl/' + pk + '/')

@login_required
def viewMap(request, pk):
    crawl = Crawl.objects.get(id=pk)
    if (crawl.user == request.user):
        pubs = Pub_On_Crawl.objects.filter(crawl=crawl)
        if (pubs.exists()):
            return render(request, 'map.html', {'status' : '', 'crawl_name' : crawl.Crawl_Name, 'crawl_id': crawl.id, 'pubs': pubs})
        else:
            return render(request, 'map.html', {'status' : 'No Pubs in crawl', 'crawl_name' : crawl.Crawl_Name, 'crawl_id': crawl.id, 'pubs': []})

@login_required
def deletePub(request, pk):
    print('delete pub')
    if request.method == 'POST':
        form = DeleteAppForm(request.POST)
        if form.is_valid():
            crawl = Crawl.objects.get(id=pk)
            if (crawl.user == request.user):
                pubPosition = form.cleaned_data.get('pubposition')
                pub = Pub_On_Crawl.objects.filter(crawl=crawl,position=pubPosition)
                pub.delete()
                pubs = Pub_On_Crawl.objects.filter(crawl=crawl)
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
        pubs = Pub_On_Crawl.objects.filter(crawl=crawl)
        for pub in pubs:
            pub.delete()
    return redirect('/crawl/' + pk + '/')

@login_required
def orderStartDate(request):
    crawls = Crawl.objects.filter(user=request.user)
    orderedCrawls = crawls.order_by('startdate')
    if (crawls.exists()):
        return render(request, 'home.html', {'crawls': orderedCrawls, 'status': ''})
    else:
        return render(request, 'home.html', {'crawls': [], 'status': 'No crawls'})

@login_required
def orderCrawlName(request):
    crawls = Crawl.objects.filter(user=request.user)
    orderedCrawls = crawls.order_by('Crawl_Name')
    if (crawls.exists()):
        return render(request, 'home.html', {'crawls': orderedCrawls, 'status': ''})
    else:
        return render(request, 'home.html', {'crawls': [], 'status': 'No crawls'})

def searchPubs(request, lat, lon):
    searchRadius = str(2000)
    searchType = 'Pub'
    searchResult = requests.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + lat + ',' + lon + '&radius=' + searchRadius + '&type=' + searchType + '&keyword=pub&key=' + googleAPIKey)
    searchResult = searchResult.content
    searchResult = json.loads(searchResult)
    return JsonResponse(searchResult, safe=False)

def pubDetails(request, id):
    pubDetailsUrl = (googlePlacesDetailUrl + str(id) + '&key=' + googleAPIKey)
    pubDetails = requests.get(pubDetailsUrl)
    pubDetails = pubDetails.content
    pubDetails = json.loads(pubDetails)
    return JsonResponse(pubDetails, safe=False)

def getPubs(request, pk):
    crawl = Crawl.objects.get(id=pk)
    pubs = []
    rawPubs = Pub_On_Crawl.objects.filter(crawl=crawl)
    for pub in rawPubs:
        placeID = pub.pub.Places_ID
        rawPubData = requests.get(googlePlacesDetailUrl + str(placeID) + '&key=' + googleAPIKey)
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
