from django.conf.urls import url, include
from django.contrib.auth import views as auth_views

from crawlspace.core import views as core_views
from django.contrib import admin
admin.autodiscover()

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^$', core_views.home, name='home'),
    url(r'^login/$', auth_views.login, {'template_name': 'login.html'}, name='login'),
    url(r'^logout/$', auth_views.logout, {'next_page': 'login'}, name='logout'),
    url(r'^signup/$', core_views.signup, name='signup'),
    url(r'^newcrawl/$', core_views.newCrawl, name='newCrawl'),
    url(r'^editcrawl/$', core_views.editCrawl, name='editCrawl'),
    url(r'^deletecrawl/(?P<pk>\d+)/$', core_views.deleteCrawl, name='deleteCrawl'),
    url(r'^crawl/(?P<pk>\d+)/$', core_views.viewCrawl, name='viewCrawl'),
    url(r'^crawl/(?P<pk>\d+)/addpub/', core_views.addPub, name='addPub'),
    url(r'^crawl/(?P<pk>\d+)/map/', core_views.viewMap, name='viewMap'),
    url(r'^crawl/(?P<pk>\d+)/clearpubs/', core_views.clearPubs, name='clearPubs'),
    url(r'^crawl/(?P<pk>\d+)/deletepub/', core_views.deletePub, name='deletePub'),
    url(r'^crawl/(?P<pk>\d+)/getpubs/', core_views.getPubs, name='getPubs'),
    url(r'^crawl/(?P<pk>\d+)/reorder/', core_views.reorderPub, name='reorderPub'),
    url(r'^orderdate/', core_views.orderStartDate, name='orderCrawlDate'),
    url(r'^ordername/', core_views.orderCrawlName, name='orderCrawlName'),
    url(r'^searchpubs/lat=(?P<lat>-?\d+\.\d+)&lon=(?P<lon>-?\d+\.\d+)$', core_views.searchPubs, name='searchPubs'),
    url(r'^pubdetails/(?P<id>[\w\-]+)', core_views.pubDetails, name='pubDetails'),
]
