from __future__ import unicode_literals
from django.conf import settings
from django.db import models
from django.contrib.auth.models import User
import datetime

# Create your models here.
class Crawls(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    description = models.CharField(max_length=20)
    details = models.CharField(max_length=50)
    created = models.DateTimeField(auto_now_add=True)
