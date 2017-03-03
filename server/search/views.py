from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse


def search(request):
    if request.method == 'GET':
        return HttpResponse("Hello from search")
    elif request.method == 'POST':
        return HttpResponse("Hello I got " + request.body)
