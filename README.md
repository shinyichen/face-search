# face-search
## Running Demo
### Start http service and Django (on isicvl03)
Go to `/nfs/div2/jchen/face-search` and start http server to host static files 
~~~~
python -m SimpleHTTPServer 8000
~~~~

Go to `/nfs/div2/jchen/face-search/server` and start Django for the backend
~~~~
python manage.py runserver 0.0.0.0:8001
~~~~

### Start Janus Service (on isicvl05)
Go to `/nfs/div2/jchen/janus-dev/janus-api/build` and start Janus service
`src/cserver/c_example`. Important to stop this service when not running the demo.

### Now the demo is running at http://isicvl03:8000/search/

## Using different servers
If using a different server for Django service, update the URL's of `URL` object. 
In `/search/face-search.js`
~~~~
.constant("URL", {
            upload: "http://isicvl03:8001/search/upload",
            uploadByLink: "http://isicvl03:8001/search/uploadByLink",
            autodetect: "http://isicvl03:8001/search/autodetect",
            search: "http://isicvl03:8001/search/search",
            debug: "http://isicvl03:8001/search/debug"
        })
~~~~


If using a different server running Janus service, update these 5 URL's in `/server/search/views.py`.

`http://isicvl05:8081/initialize`

`http://isicvl05:8081/finalize`

`http://isicvl05:8081/autodetect`

`http://isicvl05:8081/debug`

`http://isicvl05:8081/search`
