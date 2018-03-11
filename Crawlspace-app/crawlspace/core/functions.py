# Local app imports
from .forms import *
from .models import *
from .functions import *

GOOGLE_API_KEY = 'AIzaSyC3v_pZbmLZNkIasBzu_U2M9wqyO3O1rf8'
GOOGLE_PLACES_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json?placeid='
GOOGLE_PLACES_PHOTO_URL = 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference='


def get_places_photo_url(photo_ref):
    photo_url = GOOGLE_PLACES_PHOTO_URL + photo_ref + '&key=' + GOOGLE_API_KEY
    return photo_url


def get_places_details(place_id):
    details_url = GOOGLE_PLACES_DETAILS_URL + str(place_id) + '&key=' + GOOGLE_API_KEY
    return details_url


def format_crawl_date(crawl):
    crawl_start_day = str(crawl.start_date.day)
    crawl_start_month = str(crawl.start_date.month)
    crawl_start_year = str(crawl.start_date.year )
    crawl_start_date = crawl_start_day + '/' + crawl_start_month + '/' + crawl_start_year
    return crawl_start_date
