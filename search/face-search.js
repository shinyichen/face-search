(function() {


    angular.module('facesearch', ['ui.bootstrap', 'ngFileUpload', 'plotModule', 'facesearch.thumbnail', 'angular-bootbox'])
        .constant("URL", {
            upload: "http://isicvl03:8001/search/upload",
            uploadByLink: "http://isicvl03:8001/search/uploadByLink",
            autodetect: "http://isicvl03:8001/search/autodetect",
            search: "http://isicvl03:8001/search/search"
        })

        .controller('faceSearchController', ['$scope', '$http', 'URL', 'Upload', '$q', function($scope, $http, URL, Upload, $q) {

            $scope.uploadImageDir = "../uploads/";

            $scope.galleryImageDir = "../gallery/"; // use this at deployment for linking gallery images
            //$scope.galleryImageDir = "http://isicvl03:8001/gallery/";

            $scope.images = {};

            $scope.imageCount = 0;

            $scope.imageFilename = null;

            $scope.isUploading = false;

            $scope.isSearching = false;

            $scope.formModel = {
                "title": null,
                "file": null,
                "imageURL": null,
                "maxResults": 20
            };

            $scope.result = null;

            $scope.plotAPI = {};

            $scope.editing = false;

            $scope.alerts = [];

            $scope.closeAlert = function(index) {
                $scope.alerts.splice(index, 1);
            };

            $scope.upload = function() {
                if ($scope.formModel.file) {

                    $scope.isUploading = true;
                    Upload.upload({
                        url: URL.upload,
                        data: {"file": $scope.formModel.file}
                    }).then(function (response) {
                        $scope.isUploading = false;
                        console.log(response.data);

                        $scope.imageFilename = response.data;
                        $scope.formModel.file = null;

                    }, function (error) {
                        console.log(error);
                        $scope.formModel.file = null;
                        $scope.isUploading = false;

                        $scope.alerts.push({"msg": "Upload failed: " + error.statusText});
                    });
                } else if ($scope.formModel.imageURL) {

                    $scope.isUploading = true;
                    $http.post(URL.uploadByLink, {"imageURL": $scope.formModel.imageURL}).then(function (response) {
                        $scope.isUploading = false;
                        console.log(response.data);

                        $scope.imageFilename = response.data;
                        $scope.formModel.imageURL = null;
                    }, function (error) {
                        console.log(error);
                        $scope.formModel.imageURL = null;
                        $scope.isUploading = false;

                        $scope.alerts.push({"msg": "Upload failed: " + error.statusText});
                    });
                }
            };

            // upload multiple files using drag and drop
            $scope.uploadFiles = function (files) {
                if (files && files.length) {
                    $scope.isUploading = true;
                    var promises = [];
                    for (var i = 0; i < files.length; i++) {
                        promises.push(Upload.upload({
                            url: URL.upload,
                            data: {"file": files[i]}
                        }));
                    }

                    $q.all(promises).then(function(responses) {
                        responses.forEach(function(response) {
                            var imageFileName = response.data;
                            $http.post(URL.autodetect, {"filename": imageFileName}).then(function(response) {
                                console.log(response);
                                $scope.images[imageFileName] = {
                                    "face_x": response.data.face_x,
                                    "face_y": response.data.face_y,
                                    "face_width": response.data.face_width,
                                    "face_height": response.data.face_height
                                };
                                $scope.imageCount += 1;
                            });

                        });
                        $scope.isUploading =false;
                    }, function(error) {
                        $scope.alerts.push({"msg": "Upload failed: " + error.statusText});
                        $scope.isUploading =false;
                    })
                }
            };

            $scope.resetImage = function() {
                $scope.plotAPI.reset();
            };

            $scope.cancelImage = function() {
                $scope.imageFilename = null;
            };

            $scope.addImage = function() {
                if ($scope.plotAPI.isDrawn()) {
                    var x=  $scope.plotAPI.getFaceX();
                    var y=  $scope.plotAPI.getFaceY();
                    var w=  $scope.plotAPI.getFaceWidth();
                    var h=  $scope.plotAPI.getFaceHeight();
                    $scope.images[$scope.imageFilename] = {
                        "face_x": x,
                        "face_y": y,
                        "face_width": w,
                        "face_height": h
                    };
                    console.log(x + ", " + y + ", " + w + ", " + h);
                } else {
                    $scope.images[$scope.imageFilename] = {};
                }

                $scope.imageFilename = null;
                $scope.imageCount += 1;
            };

            $scope.removeImage = function(path) {
                delete $scope.images[path];
                $scope.imageCount -= 1;
            };

            $scope.editImage = function(path) {
                $scope.imageFilename = path;
                $scope.editing = true;
            };

            $scope.applyEdit = function() {
                var img = $scope.images[$scope.imageFilename];
                if ($scope.plotAPI.isDrawn()) {
                    var x = $scope.plotAPI.getFaceX();
                    var y = $scope.plotAPI.getFaceY();
                    var w = $scope.plotAPI.getFaceWidth();
                    var h = $scope.plotAPI.getFaceHeight();

                    img.face_x = x;
                    img.face_y = y;
                    img.face_width = w;
                    img.face_height = h;
                    console.log(x + ", " + y + ", " + w + ", " + h);
                } else {
                    delete img.face_x;
                    delete img.face_y;
                    delete img.face_width;
                    delete img.face_height;
                }

                $scope.imageFilename = null;
                $scope.editing = false;
            };

            $scope.cancelEdit = function() {
                $scope.imageFilename = null;
                $scope.editing = false;
            };

            $scope.search = function() {
                $scope.result = null;
                $scope.isSearching = true;
                if (!$scope.formModel.maxResults || $scope.formModel.maxResults > 50 || $scope.formModel.maxResults < 1)
                    $scope.formModel.maxResults = 20;

                // adding setting to payload then images
                var payload = {};
                payload["settings"] = {"maxResults": $scope.formModel.maxResults};
                for (var key in $scope.images) {
                    payload[key] = $scope.images[key];
                }
                $http.post(URL.search, payload).then(function(response) {
                    console.log(response.data);
                    $scope.result = response.data;
                    $scope.isSearching = false;
                }, function(error) {
                    console.log(error);
                    $scope.isSearching = false;
                    $scope.alerts.push({"msg": "Search failed: " + error.statusText});
                })
            };

            $scope.clear = function() {
                $scope.result = null;
                $scope.images = {};
                $scope.imageCount = 0;
            };

        }])

        .run(['$http', '$rootScope', 'bootbox', function($http, $rootScope, bootbox) {

            var gallery_file = "gallery.csv";

            // load gallery
            $http.get(gallery_file).then(function(response) {
                $rootScope.gallery = parseGallery(response.data);
            }, function(error) {
                bootbox.alert({
                    title: "Error loading gallery",
                    message: error.statusText,
                    size: "small"
                })
            });

            /**
             * returns {template_id: [ {template_id, subject_id, filename, .....}, ... ], ... }
             * @param csv
             */
            function parseGallery(csv) {

                var gallery = {};

                var lines=csv.split("\n");
                var headers=lines[0].split(",");
                var id_col = -1;

                headers.forEach(function(value, index, array) {
                    var col = value.trim();
                    array[index] = col;
                    if (col === "TEMPLATE_ID")
                        id_col = index;
                });

                for(var i = 1; i < lines.length; i++){ // skip header

                    if (lines[i] === "")
                        continue;

                    var currentline = lines[i].split(",");
                    var template_id = currentline[id_col].trim();
                    if (!gallery[template_id])
                        gallery[template_id] = [];

                    var line = {};
                    for (var j = 0; j < currentline.length; j++) {
                        line[headers[j]] = currentline[j]; // keep as string
                    }
                    gallery[template_id].push(line);
                }

                return gallery;
            }
        }])



})();
