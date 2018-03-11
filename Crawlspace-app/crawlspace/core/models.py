# Future imports
from __future__ import unicode_literals

# Django imports
from django.conf import settings
from django.db import models
from django.contrib.auth.models import User

import datetime


class Crawl(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    crawl_name = models.CharField(max_length=50)
    created = models.DateTimeField(auto_now_add=True)
    start_date = models.DateTimeField()


class Pub(models.Model):
    pub_name = models.CharField(max_length=255)
    places_id = models.TextField(default=1, max_length=100)


class PubOnCrawl(models.Model):
    pub = models.ForeignKey(Pub, on_delete=models.CASCADE)
    crawl = models.ForeignKey(Crawl, on_delete=models.CASCADE)
    position = models.IntegerField()
