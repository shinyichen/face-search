from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^upload$', views.upload, name='upload'),
    url(r'^initialize$', views.initialize, name='initialize'),
    url(r'^finalize$', views.finalize, name='finalize'),
    url(r'^search$', views.search, name='search'),
    url(r'^hello$', views.hello, name='hello'),
]
