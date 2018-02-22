from django.contrib import admin
from .models import Crawl
from .models import Pub
from .models import Pub_On_Crawl

admin.site.register(Crawl)
admin.site.register(Pub)
admin.site.register(Pub_On_Crawl)
