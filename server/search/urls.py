from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^upload$', views.upload, name='upload'),
    url(r'^uploadByLink$', views.uploadByLink, name='uploadByLink'),
    url(r'^initialize$', views.initialize, name='initialize'),
    url(r'^finalize$', views.finalize, name='finalize'),
    url(r'^search$', views.search, name='search'),
]
