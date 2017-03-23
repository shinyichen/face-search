#python
import os
import json
import time
import requests
import urllib2

#Django Core
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q

#Rest Framework
from rest_framework.parsers import FileUploadParser, FormParser, MultiPartParser, JSONParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes

#clib
import hello as h

@api_view(['GET'])
def initialize(request):
    print("initialize...")
    res = urllib2.urlopen("http://isicvl04:8080/initialize").read()
    return HttpResponse(res)

@api_view(['GET'])
def finalize(request):
    print("finalize...")
    res = urllib2.urlopen("http://isicvl04:8080/finalize").read()
    return HttpResponse(res)

@api_view(['POST'])
@parser_classes((FormParser, MultiPartParser))
def upload(request):
    if request.method == 'POST':
        parser_classes = (MultiPartParser, FormParser,)
        title = request.data.get('title')
        image = request.FILES['file']
        t = time.time()
        fileDir = os.path.abspath(__file__ + "/../../../images/")
        filepath = os.path.join(fileDir, str(t))
        with open(filepath, 'wb+') as temp_file:
            for chunk in image.chunks():
                temp_file.write(chunk)

        my_saved_file = open(filepath)
        print("uploaded to " + filepath)
        return Response(str(t))

@api_view(['POST'])
@parser_classes((JSONParser,))
def search(request):
    uploadDir = os.path.abspath(__file__ + "/../../../images/")
    parser_classes = (JSONParser,)
    data = request.data
    filenames = data.keys()
    payload = []
    for filename in filenames:
        face_x = data[filename]['face_x']
        face_y = data[filename]['face_y']
        face_width = data[filename]['face_width']
        face_height = data[filename]['face_height']
        image_path = os.path.join(uploadDir, filename)
        print("search got " + image_path)
        payload.append({'image_path':image_path, 'face_x': face_x, 'face_y': face_y, 'face_width': face_width, 'face_height': face_height})

    # search
    print("Searching ...")
    r = requests.post("http://isicvl04:8080/search", json=payload)
    result = r.json
    return Response(r.text)

@api_view(['GET'])
def hello(request):
    if request.method == 'GET':
        msg = h.greet()
        return HttpResponse(msg)
