#python
import os
import json
import time
import requests
import urllib2

# temporary, for uploading images to my isi home directory so c server can access them
# don't need these for deployment
# --------------------
import base64
import getpass
import os
import socket
import sys
import traceback
import paramiko
#-------------------

#Django Core
from django.http import HttpResponse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q

#Rest Framework
from rest_framework.parsers import FileUploadParser, FormParser, MultiPartParser, JSONParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes


@api_view(['GET'])
def initialize(request):
    print("initialize...")
    res = urllib2.urlopen("http://isicvl01:8081/initialize").read()
    return HttpResponse(res)

@api_view(['GET'])
def finalize(request):
    print("finalize...")
    res = urllib2.urlopen("http://isicvl01:8081/finalize").read()
    return HttpResponse(res)

@api_view(['POST'])
@parser_classes((FormParser, MultiPartParser))
def upload(request):
    if request.method == 'POST':
        parser_classes = (MultiPartParser, FormParser,)
        image = request.FILES['file']
        t = time.time()
        # fileDir = os.path.abspath(__file__ + "/../../../images/")
        fileDir = os.path.abspath("/nfs/div2/jchen/face-search/uploads/")
        filename = str(t)
        filepath = os.path.join(fileDir, filename)
        with open(filepath, 'wb+') as temp_file:
            for chunk in image.chunks():
                temp_file.write(chunk)

        my_saved_file = open(filepath)
        print("uploaded to " + filepath)

        # temporary, for ftp images to my isi home directory for c server to access
        # don't need this for deployment
        # ---------------------------------------
        # hostname = "isicvl03"
        # port = 22
        # username = "jchen"
        #
        # try:
        #     privatekeyfile = '/Users/jenniferchen/.ssh/id_rsa'
        #     mykey = paramiko.RSAKey.from_private_key_file(privatekeyfile)
        #     transport = paramiko.Transport((hostname, port))
        #     transport.connect(username = username, pkey = mykey)
        #     sftp = paramiko.SFTPClient.from_transport(transport)
        #
        #     dirlist = sftp.listdir('.')
        #     sftp.put(filepath, 'test/uploads/' + filename)
        #
        #     transport.close()
        #
        # except Exception as e:
        #     print('*** Caught exception: %s: %s' % (e.__class__, e))
        #     traceback.print_exc()
        #     try:
        #         t.close()
        #     except:
        #         pass
        #-------------------------------------

        return Response(filename)

@api_view(['POST'])
def uploadByLink(request):
    if request.method == 'POST':
        imageURL = request.data.get('imageURL')
        t = time.time()
        # fileDir = os.path.abspath(__file__ + "/../../../images/")
        fileDir = os.path.abspath("/nfs/div2/jchen/face-search/uploads/")
        filename = str(t)
        filepath = os.path.join(fileDir, filename)

        # save image from url
        f = open(filepath,'wb')
        f.write(urllib2.urlopen(imageURL).read())
        f.close()

        print("uploaded to " + filepath)

        # temporary, for ftp images to my isi home directory for c server to access
        # don't need this for deployment
        # ---------------------------------------
        # hostname = "isicvl03"
        # port = 22
        # username = "jchen"
        #
        # try:
        #     privatekeyfile = '/Users/jenniferchen/.ssh/id_rsa'
        #     mykey = paramiko.RSAKey.from_private_key_file(privatekeyfile)
        #     transport = paramiko.Transport((hostname, port))
        #     transport.connect(username = username, pkey = mykey)
        #     sftp = paramiko.SFTPClient.from_transport(transport)
        #
        #     dirlist = sftp.listdir('.')
        #     sftp.put(filepath, 'test/uploads/' + filename)
        #
        #     transport.close()
        #
        # except Exception as e:
        #     print('*** Caught exception: %s: %s' % (e.__class__, e))
        #     traceback.print_exc()
        #     try:
        #         t.close()
        #     except:
        #         pass
        #-------------------------------------

        return Response(filename)

@api_view(['POST'])
def autodetect(request):
    filename = request.data["filename"]
    uploadDir = "/nfs/div2/jchen/face-search/uploads/"
    image_path = os.path.join(uploadDir, filename)

    payload = {"image_path": image_path}
    r = requests.post("http://isicvl01:8081/autodetect", json=payload)
    return JsonResponse(json.loads(r.text), safe=False)


@api_view(['POST'])
def debug(request):
    filename = request.data["filename"]
    uploadDir = "/nfs/div2/jchen/face-search/uploads/"
    image_path = os.path.join(uploadDir, filename)

    payload = {"image_path": image_path, "face_x": request.data["face_x"], "face_y": request.data["face_y"], "face_width": request.data["face_width"], "face_height": request.data["face_height"]}
    r = requests.post("http://isicvl01:8081/debug", json=payload)
    return JsonResponse(json.loads(r.text), safe=False)

@api_view(['POST'])
@parser_classes((JSONParser,))
def search(request):
    # uploadDir = os.path.abspath(__file__ + "/../../../images/")
    uploadDir = "/nfs/div2/jchen/face-search/uploads/"
    # TODO temporary uploadDir, change to the above at deployment
    # -----------------------------------
    # uploadDir = "/nfs/div2/jchen/test/uploads/"
    # -----------------------------------

    parser_classes = (JSONParser,)
    data = request.data
    payload = []

    # get settings
    maxResults = data['settings']['maxResults']
    # append settings as the first item in payload array
    payload.append({'maxResults': maxResults})

    # get images
    filenames = data.keys()
    for filename in filenames:
        if filename != 'settings':
            if 'face_x' in data[filename]:
                face_x = data[filename]['face_x']
                face_y = data[filename]['face_y']
                face_width = data[filename]['face_width']
                face_height = data[filename]['face_height']
                image_path = os.path.join(uploadDir, filename)
                print("search got " + image_path)
                print("Has bounding box")
                payload.append({'image_path':image_path, 'face_x': face_x, 'face_y': face_y, 'face_width': face_width, 'face_height': face_height})
            else:
                image_path = os.path.join(uploadDir, filename)
                print("search got " + image_path)
                print("no bounding box")
                payload.append({'image_path':image_path})

    # search
    print("Searching ...")
    r = requests.post("http://isicvl01:8081/search", json=payload)
    return JsonResponse(json.loads(r.text), safe=False)
