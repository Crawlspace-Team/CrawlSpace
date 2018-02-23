from __future__ import unicode_literals
from django.conf import settings
from django.db import models
from django.contrib.auth.models import User
import datetime

class Crawl(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    Crawl_Name = models.CharField(max_length=50)
    created = models.DateTimeField(auto_now_add=True)
    startdate = models.DateTimeField()

class Pub(models.Model):
    Pub_Name = models.CharField(max_length=255)
    Places_ID = models.TextField(default=1,max_length=50)


class Pub_On_Crawl(models.Model):
    pub = models.ForeignKey(Pub, on_delete=models.CASCADE)
    crawl = models.ForeignKey(Crawl, on_delete=models.CASCADE)
    position = models.IntegerField()
