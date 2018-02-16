from django.conf.urls import url, include
from django.contrib.auth import views as auth_views

from crawlspace.core import views as core_views


urlpatterns = [
    url(r'^$', core_views.home, name='home'),
    url(r'^login/$', auth_views.login, {'template_name': 'login.html'}, name='login'),
    url(r'^logout/$', auth_views.logout, {'next_page': 'login'}, name='logout'),
    url(r'^signup/$', core_views.signup, name='signup'),
    url(r'^newcrawl/$', core_views.newCrawl, name='newCrawl'),
    url(r'^deletecrawl/(?P<pk>\d+)/$', core_views.deleteCrawl, name='deleteCrawl'),
]
