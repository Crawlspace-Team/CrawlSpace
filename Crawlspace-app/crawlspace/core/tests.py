from django.test import TestCase

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


# Test google places photo url generation
class PhotoUrlGenerationTestCase(TestCase):
    def test_url(self):
        photo_ref = 'ChIJ7XC9JKNddEgRr-gH3rstQfE'
        photo_url = get_places_photo_url(photo_ref)
        self.assertEqual(photo_url, 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=ChIJ7XC9JKNddEgRr-gH3rstQfE&key=AIzaSyC3v_pZbmLZNkIasBzu_U2M9wqyO3O1rf8')


# get places details

# format crawl date

# get pub location json