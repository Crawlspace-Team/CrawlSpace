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
    Retrieves the crawls created by the current user and renders them within the home page.

    Parameters
    ----------
    request : HttpRequest
        HttpRequest object retrieved from the url

    Returns
    -------
    HttpRequest
        home.html page rendered with the user's created crawls

    """
    crawls = Crawl.objects.filter(user=request.user) # Retrieve all crawls created by the current user
    for crawl in crawls:
        crawl.start_date = format_crawl_date(crawl)
        pubs_on_crawl = PubOnCrawl.objects.filter(crawl=crawl).order_by('position') # Retrieve all pubs in the crawl
        number_of_pubs = len(pubs_on_crawl)
        if number_of_pubs >= 1:
            first_pub = pubs_on_crawl[0]
            place_id = str(first_pub.pub.place_id)
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
    """
    Renders the sign up page or processes the sign up form if the sign up form is passed to the view

    Parameters
    ----------
    request : HttpRequest
        HttpRequest object retrieved from the url

    Returns
    -------
    HttpRequest
        Sign up page with the rendered sign up form

    """
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
def new_crawl(request):
    """
    Handles the new crawl form and creates a new crawl in the database from the form's data

    Parameters
    ----------
    request : HttpRequest
        HttpRequest object retrieved from the url with the form data

    Returns
    -------
    HttpRequest
        Redirects to the root url of the app

    """
    if request.method == 'POST':
        form = NewCrawlForm(request.POST)
        if form.is_valid():
            crawl_name = form.cleaned_data.get('name')
            crawl_start_date = form.cleaned_data.get('crawl_start_date')
            crawl = Crawl.objects.create(user=request.user, crawl_name=crawl_name, start_date=crawl_start_date)
            crawl.save()
    return redirect('/')


@login_required
def edit_crawl(request):
    """
    Handles the edit crawl form and edits the specified crawl in the database from the form's data

    Parameters
    ----------
    request : HttpRequest
        HttpRequest object retrieved from the url with the form data

    Returns
    -------
    HttpRequest
        Redirects to the root url of the app

    """
    if request.method == 'POST':
        form = EditCrawlForm(request.POST)
        if form.is_valid():
            crawl_id = form.cleaned_data.get('crawl_id')
            crawl = Crawl.objects.get(id=crawl_id)
            if crawl.user == request.user:
                crawl.crawl_name = form.cleaned_data.get('name')
                crawl.start_date = form.cleaned_data.get('crawl_start_date')
                crawl.save()
    return redirect('/')


@login_required
def delete_crawl(request, crawl_id):
    """
    Handles the delete crawl form and deletes the specified crawl in the database from the form's data

    Parameters
    ----------
    request : HttpRequest
        HttpRequest object retrieved from the url with the form data
    crawl_id : String
        String referencing the crawl to be rendered within the page

    Returns
    -------
    HttpRequest
        Redirects to the root url of the app

    """
    crawl = Crawl.objects.get(id=crawl_id)
    if crawl.user == request.user:
        crawl.delete()
    return redirect('/')


@login_required
def view_crawl(request, crawl_id):
    """
    Renders the view crawl page based on the crawl's data retrieved from the
    database based on the crawl id passed on from the url

    Parameters
    ----------
    request : HttpRequest
        HttpRequest object retrieved from the url with the form data
    crawl_id : String
        String referencing the crawl to be rendered within the page

    Returns
    -------
    HttpRequest
        crawl.html page rendered with the specified crawl's details

    """
    crawl = Crawl.objects.get(id=crawl_id)
    status = ''
    if crawl.user == request.user:
        pubs_on_crawl = PubOnCrawl.objects.filter(crawl=crawl).order_by('position')
        for pub in pubs_on_crawl:
            pub.name = pub.pub.pub_name
            pub.place_id = pub.pub.place_id
            raw_pub_data = requests.get(get_places_details(pub.place_id))
            if json.loads(raw_pub_data.content)['status'] == 'OVER_QUERY_LIMIT':
                status = 'Over api query limit'
            else:
                pub_data = json.loads(raw_pub_data.content)
                pub_data = pub_data['result']
                if 'formatted_phone_number' in pub_data:
                    pub.phone_number = pub_data['formatted_phone_number']
                if 'photos' in pub_data:
                    pub_photos = pub_data['photos']
                    pub_thumbnail_object = pub_photos[0]
                    pub_thumbnail_ref = pub_thumbnail_object['photo_reference']
                    pub_thumbnail_url = get_places_photo_url(pub_thumbnail_ref)
                    pub.thumbnail = pub_thumbnail_url
                if 'address_components' in pub_data:
                    pub_address_components = pub_data['address_components']
                    pub_street_number = pub_address_components[0]['short_name']
                    pub_street = pub_address_components[1]['short_name']
                    pub_location = pub_address_components[2]['short_name']
                    pub.address = pub_street_number + ' ' + pub_street + ', ' + pub_location
        if pubs_on_crawl.exists():
            return render(request, 'crawl.html',
                          {'status': status, 'crawl_name': crawl.crawl_name, 'crawl_id': crawl.id, 'pubs': pubs_on_crawl})
        else:
            status = 'No Pubs in crawl'
            return render(request, 'crawl.html',
                          {'status': status, 'crawl_name': crawl.crawl_name, 'crawl_id': crawl.id, 'pubs': []})


@login_required
def add_pub(request, crawl_id):
    """
    Handles the add pub form and adds the pub to the specified crawl in the database from the form's data

    Parameters
    ----------
    request : HttpRequest
        HttpRequest object retrieved from the url with the form data
    crawl_id : String
        String referencing the crawl to be rendered within the page

    Returns
    -------
    HttpRequest
        Redirects to the crawl page for the specified crawl

    """
    if request.method == 'POST':
        form = AddPubForm(request.POST)
        if form.is_valid():
            crawl = Crawl.objects.get(id=crawl_id)
            if crawl.user == request.user:
                pubs_on_crawl = PubOnCrawl.objects.filter(crawl=crawl).order_by('position')
                num_of_pubs = len(pubs_on_crawl) + 1
                pub_name = form.cleaned_data.get('pub_name')
                pub_place_id = form.cleaned_data.get('place_id')
                pub = Pub.objects.create(pub_name=pub_name, place_id=pub_place_id)
                pub.save()
                pub_on_crawl = PubOnCrawl.objects.create(pub=pub, crawl=crawl, position=num_of_pubs)
                pub_on_crawl.save()
    return redirect('/crawl/' + crawl_id + '/')


@login_required
def view_map(request, crawl_id):
    """
    Renders the map page for the specified crawl based on the crawl's pubs retrieved from the database

    Parameters
    ----------
    request : HttpRequest
        HttpRequest object retrieved from the url with the form data
    crawl_id : String
        String referencing the crawl to be rendered within the page

    Returns
    -------
    HttpRequest
        map.html page rendered with the specified crawl's route

    """
    crawl = Crawl.objects.get(id=crawl_id)
    if crawl.user == request.user:
        pubs_on_crawl = PubOnCrawl.objects.filter(crawl=crawl).order_by('position')
        if pubs_on_crawl.exists():
            return render(request, 'map.html',
                          {'status': '', 'crawl_name': crawl.crawl_name, 'crawl_id': crawl.id, 'pubs': pubs_on_crawl})
        else:
            return render(request, 'map.html',
                          {'status': 'No Pubs in crawl', 'crawl_name': crawl.crawl_name, 'crawl_id': crawl.id,
                           'pubs': []})


@login_required
def reorder_pub(request, crawl_id):
    """
    Handles the reorder pub form and reorders the pub in the specified crawl in the database based on the form's data

    Parameters
    ----------
    request : HttpRequest
        HttpRequest object retrieved from the url with the form data
    crawl_id : String
        String referencing the crawl to be rendered within the page

    Returns
    -------
    HttpRequest
        Redirects to the crawl page for the specified crawl

    """
    if request.method == 'POST':
        form = ReorderPubForm(request.POST)
        if form.is_valid():
            print("valid")
            crawl = Crawl.objects.get(id=crawl_id)
            if crawl.user == request.user:
                pubs_on_crawl = PubOnCrawl.objects.filter(crawl=crawl).order_by('position')
                old_pub_position = form.cleaned_data.get('pub_position')
                new_pub_position = form.cleaned_data.get('new_position')
                first_pub = pubs_on_crawl[old_pub_position - 1]
                second_pub = pubs_on_crawl[new_pub_position - 1]
                first_pub.position = new_pub_position
                second_pub.position = old_pub_position
                first_pub.save()
                second_pub.save()
    return redirect('/crawl/' + crawl_id + '/')


@login_required
def delete_pub(request, crawl_id):
    """
    Handles the delete pub request and delete the pub from the specified crawl in the database
    Once the pub is deleted the pubs are reordered to keep the pub positions in order

    Parameters
    ----------
    request : HttpRequest
        HttpRequest object retrieved from the url with the form data
    crawl_id : String
        String referencing the crawl to be rendered within the page

    Returns
    -------
    HttpRequest
        Redirects to the crawl page for the specified crawl

    """
    if request.method == 'POST':
        form = DeletePubForm(request.POST)
        if form.is_valid():
            crawl = Crawl.objects.get(id=crawl_id)
            if crawl.user == request.user:
                pub_position = form.cleaned_data.get('pub_position')
                pub = PubOnCrawl.objects.filter(crawl=crawl, position=pub_position)
                pub.delete()
                pubs_on_crawl = PubOnCrawl.objects.filter(crawl=crawl).order_by('position')
                pub_counter = 0
                for pub in pubs_on_crawl: # Reorder pubs to fix the broken pub position order
                    pub_position = pub.position
                    pub_counter = pub_counter + 1
                    if pub_position != pub_counter:
                        pub.position = (pub_position - 1)
                        pub.save()
    return redirect('/crawl/' + crawl_id + '/')


@login_required
def clear_pubs(request, crawl_id):
    """
    Handles the clear pubs request and deletes all pubs from the specified crawl in the database

    Parameters
    ----------
    request : HttpRequest
        HttpRequest object retrieved from the url with the form data
    crawl_id : String
        String referencing the crawl to be rendered within the page

    Returns
    -------
    HttpRequest
        Redirects to the crawl page for the specified crawl

    """
    crawl = Crawl.objects.get(id=crawl_id)
    if crawl.user == request.user:
        pubs_on_crawl = PubOnCrawl.objects.filter(crawl=crawl).order_by('position')
        for pub in pubs_on_crawl:
            pub.delete()
    return redirect('/crawl/' + crawl_id + '/')


@login_required
def order_by_start_date(request):
    """
    Handles the order crawl by start date request and orders all crawls from the current user in the database

    Parameters
    ----------
    request : HttpRequest
        HttpRequest object retrieved from the url with the form data

    Returns
    -------
    HttpRequest
        Renders the home.html page with the ordered crawls

    """
    crawls = Crawl.objects.filter(user=request.user)
    ordered_crawls = crawls.order_by('start_date')
    if crawls.exists():
        return render(request, 'home.html', {'crawls': ordered_crawls, 'status': ''})
    else:
        return render(request, 'home.html', {'crawls': [], 'status': 'No crawls'})


@login_required
def order_by_crawl_name(request):
    """
    Handles the order crawl by name request and orders all crawls from the current user in the database

    Parameters
    ----------
    request : HttpRequest
        HttpRequest object retrieved from the url with the form data

    Returns
    -------
    HttpRequest
        Renders the home.html page with the ordered crawls

    """
    crawls = Crawl.objects.filter(user=request.user)
    ordered_crawls = crawls.order_by('crawl_name')
    if crawls.exists():
        return render(request, 'home.html', {'crawls': ordered_crawls, 'status': ''})
    else:
        return render(request, 'home.html', {'crawls': [], 'status': 'No crawls'})


def search_pubs(request, lat, lon):
    """
    Handles the search pubs request and returns JSON containing the results of the pub search based
    on the latitude and longitude passed to the view

    Parameters
    ----------
    request : HttpRequest
        HttpRequest object retrieved from the url with the form data
    lat : String
        String representing the latitude of the search location
    lon : String
        String representing the longitude of the search location

    Returns
    -------
    HttpRequest
        Returns the JSON repsonse containing the search result

    """
    search_radius = str(2000)
    search_type = 'Pub'
    search_result = requests.get(
        'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + lat + ',' + lon + '&radius=' + search_radius + '&type=' + search_type + '&keyword=pub&key=' + GOOGLE_API_KEY)
    search_details = json.loads(search_result.content)
    return JsonResponse(search_details, safe=False)


def get_pub_details(request, pub_id):
    """
    Handles the pub details request and returns JSON containing the pub details obtained
    from the google places api

    Parameters
    ----------
    pub_id : String
        String representing the google places id for the pub

    Returns
    -------
    HttpRequest
        Returns the JSON repsonse containing the pub's google places details

    """
    pub_details_url = get_places_details(pub_id)
    pub_details = requests.get(pub_details_url)
    pub_details = json.loads(pub_details.content)
    return JsonResponse(pub_details, safe=False)


def get_pubs(request, crawl_id):
    """
    Handles the get pubs request and returns JSON containing pub details for each of the pubs within
    the specified crawl

    Parameters
    ----------
    crawl_id : String
        String representing the google places id for the pub

    Returns
    -------
    HttpRequest
        Returns the JSON repsonse containing details for each of the pubs within the specified crawl

    """
    crawl = Crawl.objects.get(id=crawl_id)
    pubs_json_list = []
    pubs_on_crawl = PubOnCrawl.objects.filter(crawl=crawl).order_by('position')
    for pub in pubs_on_crawl:
        place_id = pub.pub.place_id
        pub_json = get_pub_location_json(place_id)
        pubs_json_list.append(pub_json)
    return JsonResponse(pubs_json_list, safe=False)
