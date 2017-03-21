#python
import os
import json
import time

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
    # res = urllib2.urlopen("http://localhost:18080/initialize").read()
    return HttpResponse(res)

@api_view(['GET'])
def initialize(request):
    print("finalize...")
    # res = urllib2.urlopen("http://localhost:18080/finalize").read()
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
        print(fileDir)
        filename = os.path.join(fileDir, str(t))
        with open(filename, 'wb+') as temp_file:
            for chunk in image.chunks():
                temp_file.write(chunk)

        my_saved_file = open(filename)
        return Response(str(t))

@api_view(['POST'])
@parser_classes((JSONParser,))
def search(request):
    parser_classes = (JSONParser,)
    data = request.data
    image_paths = data.keys()
    for image_path in image_paths:
        print(image_path)
        face_x = data[image_path]['face_x']
        face_y = data[image_path]['face_y']
        face_width = data[image_path]['face_width']
        face_height = data[image_path]['face_height']

        # searching
        print("create template...")
        payload = [{'image_path':'example.jpeg', 'face_x': 12, 'face_y': 23, 'face_width': 34, 'face_height': 45}]
        r = requests.post("http://localhost:18080/create-template", json=payload)

    return Response("Searching " + str(len(image_paths)) + " images")

@api_view(['GET'])
def hello(request):
    if request.method == 'GET':
        msg = h.greet()
        return HttpResponse(msg)
