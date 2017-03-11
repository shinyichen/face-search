from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^upload$', views.search, name='upload'),
    url(r'^hello$', views.hello, name='hello'),
]
