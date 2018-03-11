# Standard library imports
import requests
import json

# Local app imports
from .forms import *
from .models import *
from .functions import *

GOOGLE_API_KEY = 'AIzaSyC3v_pZbmLZNkIasBzu_U2M9wqyO3O1rf8'
GOOGLE_PLACES_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json?placeid='
GOOGLE_PLACES_PHOTO_URL = 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference='


def get_places_photo_url(photo_ref):
    """
    Creates the google places photo api url for the required for photo

    Parameters
    ----------
    photo_ref : String
        Photo reference for the required photo

    Returns
    -------
    String
        Complete google places photo url for the specified photo

    """
    photo_url = GOOGLE_PLACES_PHOTO_URL + photo_ref + '&key=' + GOOGLE_API_KEY
    print(photo_url)
    return photo_url


def get_places_details(place_id):
    """
    Creates the google places details api url for the required for place

    Parameters
    ----------
    place_id : String
        Place reference for the required place

    Returns
    -------
    String
        Complete google places details url for the specified place

    """
    details_url = GOOGLE_PLACES_DETAILS_URL + place_id + '&key=' + GOOGLE_API_KEY
    return details_url


def format_crawl_date(crawl):
    """
    Creates the formatted crawl start date based on the crawl's day, month and year

    Parameters
    ----------
    crawl : Crawl
        Crawl that the date will be generated from

    Returns
    -------
    String
        String represented the formatted date

    """
    crawl_start_day = str(crawl.start_date.day)
    crawl_start_month = str(crawl.start_date.month)
    crawl_start_year = str(crawl.start_date.year)
    crawl_start_date = crawl_start_day + '/' + crawl_start_month + '/' + crawl_start_year
    return crawl_start_date


def get_pub_location_json(pub_id):
    """
    Retrieves the pub details and location information from the google places api
    and formats the JSON data to work with google maps

    Parameters
    ----------
    pub_id : String
        String representing the google places id for the pub

    Returns
    -------
    String
        String represented the formatted date

    """
    raw_pub_data = requests.get(get_places_details(pub_id))
    pub_data = json.loads(raw_pub_data.content)
    pub_data = pub_data['result']
    pub_name = pub_data['name']
    pub_address = pub_data['formatted_address']
    pub_location = pub_data['geometry']['location']
    pub_lat = pub_location['lat']
    pub_long = pub_location['lng']

    pub_json = {'name': pub_name, 'address': pub_address,
                'lat': pub_lat, 'lng': pub_long}
    return pub_json
