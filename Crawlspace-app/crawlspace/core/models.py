# Future imports
from __future__ import unicode_literals

# Django imports
from django.conf import settings
from django.db import models


class Crawl(models.Model):
    """
     Crawl model that represents a pub crawl

     Attributes
     -------
     user
         User used as a foreign key to link the crawl to the user
     crawl_name
         Name used to describe the crawl
     created
         Current date automatically added on model creation
     start_date
         Date that the crawl will start on
     """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    crawl_name = models.CharField(max_length=50)
    created = models.DateTimeField(auto_now_add=True)
    start_date = models.DateTimeField()


class Pub(models.Model):
    """
     Pub model that represents a pub

     Attributes
     -------
     pub_name
         Name of the pub
     place_id
         Google places ID of the pub
     """
    pub_name = models.CharField(max_length=255)
    place_id = models.TextField(default=1, max_length=100)


class PubOnCrawl(models.Model):
    """
     Pub that has been assigned to a crawl

     Attributes
     -------
     pub
         Pub that the crawl will be linked to via the foreign key
     crawl
         Crawl that the pub will be linked to via the foreign key
     position
         Integer representing the position of the pub within the crawl
     """
    pub = models.ForeignKey(Pub, on_delete=models.CASCADE)
    crawl = models.ForeignKey(Crawl, on_delete=models.CASCADE)
    position = models.IntegerField()
