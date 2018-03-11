# Django imports
from django.conf.urls import url, include
from django.contrib.auth import views as auth_views
from django.contrib import admin

# Local app imports
from crawlspace.core import views as core_views

# URL patterns for matching the user's requests its corresponding view
urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^$', core_views.home, name='home'),
    url(r'^login/$', auth_views.login, {'template_name': 'login.html'}, name='login'),
    url(r'^logout/$', auth_views.logout, {'next_page': 'login'}, name='logout'),
    url(r'^signup/$', core_views.signup, name='signup'),
    url(r'^newcrawl/$', core_views.new_crawl, name='new_crawl'),
    url(r'^editcrawl/$', core_views.edit_crawl, name='edit_crawl'),
    url(r'^deletecrawl/(?P<crawl_id>\d+)/$', core_views.delete_crawl, name='delete_crawl'),
    url(r'^crawl/(?P<crawl_id>\d+)/$', core_views.view_crawl, name='view_crawl'),
    url(r'^crawl/(?P<crawl_id>\d+)/addpub/', core_views.add_pub, name='add_pub'),
    url(r'^crawl/(?P<crawl_id>\d+)/map/', core_views.view_map, name='view_map'),
    url(r'^crawl/(?P<crawl_id>\d+)/clearpubs/', core_views.clear_pubs, name='clear_pubs'),
    url(r'^crawl/(?P<crawl_id>\d+)/deletepub/', core_views.delete_pub, name='delete_pub'),
    url(r'^crawl/(?P<crawl_id>\d+)/getpubs/', core_views.get_pubs, name='get_pubs'),
    url(r'^crawl/(?P<crawl_id>\d+)/reorder/', core_views.reorder_pub, name='reorder_pub'),
    url(r'^orderdate/', core_views.order_by_start_date, name='order_by_start_date'),
    url(r'^ordername/', core_views.order_by_crawl_name, name='order_by_crawl_name'),
    url(r'^searchpubs/lat=(?P<lat>-?\d+\.\d+)&lon=(?P<lon>-?\d+\.\d+)$', core_views.search_pubs, name='search_pubs'),
    url(r'^pubdetails/(?P<pub_id>[\w\-]+)', core_views.get_pub_details, name='get_pub_details'),
]
