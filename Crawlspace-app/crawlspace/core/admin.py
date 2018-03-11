# Django imports
from django.contrib import admin

# Local app imports
from .models import *

# Register models to the admin page
admin.site.register(Crawl)
admin.site.register(Pub)
admin.site.register(PubOnCrawl)
