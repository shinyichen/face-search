(function() {


    angular.module('facesearch', ['ui.bootstrap', 'ngFileUpload', 'plotModule', 'facesearch.thumbnail', 'angular-bootbox', 'modals'])
        .constant("URL", {
            upload: "http://isicvl03:8001/search/upload",
            uploadByLink: "http://isicvl03:8001/search/uploadByLink",
            autodetect: "http://isicvl03:8001/search/autodetect",
            search: "http://isicvl03:8001/search/search",
            debug: "http://isicvl03:8001/search/debug"
        })

        .controller('faceSearchController', ['$scope', '$http', 'URL', 'Upload', '$q', '$uibModal', function($scope, $http, URL, Upload, $q, $uibModal) {

            $scope.uploadImageDir = "../uploads/";

            $scope.galleryImageDir = "../gallery/"; // use this at deployment for linking gallery images
            //$scope.galleryImageDir = "http://isicvl03:8001/gallery/";

            $scope.images = {};

            $scope.imageCount = 0;

            $scope.isBusy = false;

            $scope.isSearching = false;

            $scope.formModel = {
                "title": null,
                "file": null,
                "imageURL": null,
                "maxResults": 50
            };

            $scope.result = null;

            $scope.plotAPI = {};

            $scope.editing = false;

            $scope.alerts = [];

            $scope.debugData = {};

            $scope.closeAlert = function(index) {
                $scope.alerts.splice(index, 1);
            };

            $scope.uploadByURL = function() {
                if ($scope.isBusy) {
                    $scope.alerts.push({"msg": "App is busy. Try again later!"});
                    return;
                }

                if ($scope.formModel.imageURL) { // upload by url

                    $scope.isBusy = true;
                    $http.post(URL.uploadByLink, {"imageURL": $scope.formModel.imageURL}).then(function (response) {
                        $scope.isBusy = false;
                        console.log(response.data);

                        // face detect
                        faceDetect([response.data]);

                        $scope.formModel.imageURL = null;
                    }, function (error) {
                        console.log(error);
                        $scope.formModel.imageURL = null;
                        $scope.isBusy = false;

                        $scope.alerts.push({"msg": "Upload failed: " + error.statusText});
                    });
                }
            };

            // upload multiple files using drag and drop
            $scope.uploadFiles = function (files) {
                if ($scope.isBusy) {
                    $scope.alerts.push({"msg": "App is busy. Try again later!"});
                    return;
                }

                if (files && files.length) {
                    $scope.isBusy = true;
                    var promises = [];
                    for (var i = 0; i < files.length; i++) {
                        promises.push(Upload.upload({
                            url: URL.upload,
                            data: {"file": files[i]}
                        }));
                    }
                    $q.all(promises).then(function (responses) {

                        // get a list of filenames of images uploaded
                        var imageFileNames = [];
                        responses.forEach(function(response) {
                            imageFileNames.push(response.data);
                        });

                        // face detect
                        faceDetect(imageFileNames);

                        $scope.isBusy = false;
                    }, function (error) {
                        $scope.alerts.push({"msg": "Upload failed: " + error.statusText});
                        $scope.isBusy = false;
                    });
                }
            };

            $scope.removeImage = function(path) {
                delete $scope.images[path];
                delete $scope.debugData[path];
                $scope.imageCount -= 1;
            };

            // in editing, call this to auto detect face boundary
            $scope.editImage = function(filename) {
                // boundaries not drawn, auto detect
                if ($scope.isBusy) {
                    $scope.alerts.push({"msg": "Unable to auto detect boundaries while app is busy. Try again later!"});
                    return;
                }

                $scope.isBusy = true;
                $http.post(URL.autodetect, {"filenames": [filename]}).then(function(response) {
                    console.log(response);
                    var data = (response.data? response.data : []);
                    var modalInstance = $uibModal.open({
                        animation: true,
                        backdrop: true,
                        keyboard: true,
                        size: 'lg',
                        component: 'selectModalComponent',
                        resolve: {
                            params: function () {
                                return {
                                    "uploadDir": $scope.uploadImageDir,
                                    "files": [filename],
                                    "data": data
                                }
                            }
                        }
                    });
                    modalInstance.result.then(function (selections) {
                        $scope.images[filename] = {
                            "face_x": selections[filename].face_x,
                            "face_y": selections[filename].face_y,
                            "face_width": selections[filename].face_width,
                            "face_height": selections[filename].face_height
                        };
                        $scope.editing = false;
                        $scope.isBusy = false;
                    }, function() {
                        $scope.editing = false;
                        $scope.isBusy = false;
                    });

                    // remove debug data
                    delete $scope.debugData[filename];

                }, function(error) {
                    $scope.alerts.push({"msg": "Face auto detect failed: " + error.statusText});
                    $scope.isBusy = false;
                });
            };

            $scope.cancelEdit = function() {
                $scope.editing = false;
            };

            $scope.search = function() {
                if ($scope.isBusy) {
                    $scope.alerts.push({"msg": "App is busy. Try again later!"});
                    return;
                }

                $scope.isSearching = true;
                $scope.result = null;
                $scope.isBusy = true;
                if (!$scope.formModel.maxResults || $scope.formModel.maxResults > 50 || $scope.formModel.maxResults < 1)
                    $scope.formModel.maxResults = 50;

                // adding setting to payload then images
                var payload = {};
                payload["settings"] = {"maxResults": $scope.formModel.maxResults};
                for (var key in $scope.images) {
                    payload[key] = $scope.images[key];
                }
                $http.post(URL.search, payload).then(function(response) {
                    console.log(response.data);
                    $scope.result = response.data.results;
                    for (var filename in $scope.images) {
                        $scope.debugData[filename] = response.data[filename];
                    }

                    $scope.isBusy = false;
                    $scope.isSearching = false;
                }, function(error) {
                    console.log(error);
                    $scope.isBusy = false;
                    $scope.isSearching = false;
                    $scope.alerts.push({"msg": "Search failed: " + error.statusText});
                })
            };

            $scope.clear = function() {
                $scope.result = null;
                $scope.images = {};
                $scope.imageCount = 0;
            };

            $scope.debug = function(filename) {
                var img = $scope.images[filename];
                var data = $scope.debugData[filename];
                if ($scope.debugData[filename]) {
                    $uibModal.open({
                        animation: true,
                        backdrop: true,
                        keyboard: true,
                        size: 'lg',
                        component: 'debugModalComponent',
                        resolve: {
                            params: function () {
                                return {
                                    "yaw": data.yaw,
                                    "original": $scope.uploadImageDir + filename,
                                    "face_x":img.face_x,
                                    "face_y": img.face_y,
                                    "face_width": img.face_width,
                                    "face_height": img.face_height,
                                    "cropped": (data.cropped? $scope.uploadImageDir + data.cropped : null),
                                    "renderedFr": (data.rend_fr? $scope.uploadImageDir + data.rend_fr : null),
                                    "renderedHp": (data.rend_hp? $scope.uploadImageDir + data.rend_hp : null),
                                    "renderedFp": (data.rend_fp? $scope.uploadImageDir + data.rend_fp : null),
                                    "aligned": (data.aligned? $scope.uploadImageDir + data.aligned : null),
                                    "landmarks": data.landmarks,
                                    "confidence": data.confidence,
                                    "landmark_dur": data.landmark_dur,
                                    "pose_dur": data.pose_dur,
                                    "render_dur": data.render_dur,
                                    "align_dur": data.align_dur,
                                    "featex_dur": data.featex_dur,
                                    "featex_batch_dur": data.featex_batch_dur
                                }
                            }
                        }
                    });
                } else {
                    if ($scope.isBusy) {
                        $scope.alerts.push({"msg": "App is busy. Try again later!"});
                        return;
                    }

                    $scope.isBusy = true;
                    $http.post(URL.debug, {"filename": filename, face_x: img.face_x, face_y: img.face_y, face_width: img.face_width, face_height: img.face_height}).then(function(response) {
                        $scope.debugData[filename] = response.data;
                        var data = $scope.debugData[filename];
                        console.log(data);
                        $uibModal.open({
                            animation: true,
                            backdrop: true,
                            keyboard: true,
                            size: 'lg',
                            component: 'debugModalComponent',
                            resolve: {
                                params: function () {
                                    return {
                                        "yaw": data.yaw,
                                        "original": $scope.uploadImageDir + filename,
                                        "face_x":img.face_x,
                                        "face_y": img.face_y,
                                        "face_width": img.face_width,
                                        "face_height": img.face_height,
                                        "cropped": (data.cropped? $scope.uploadImageDir + data.cropped : null),
                                        "renderedFr": (data.rend_fr? $scope.uploadImageDir + data.rend_fr : null),
                                        "renderedHp": (data.rend_hp? $scope.uploadImageDir + data.rend_hp : null),
                                        "renderedFp": (data.rend_fp? $scope.uploadImageDir + data.rend_fp : null),
                                        "aligned": (data.aligned? $scope.uploadImageDir + data.aligned : null),
                                        "landmarks": data.landmarks,
                                        "confidence": data.confidence,
                                        "landmark_dur": data.landmark_dur,
                                        "pose_dur": data.pose_dur,
                                        "render_dur": data.render_dur,
                                        "align_dur": data.align_dur,
                                        "featex_dur": data.featex_dur,
                                        "featex_batch_dur": data.featex_batch_dur
                                    }
                                }
                            }
                        });
                        $scope.isBusy = false;
                    }, function(error) {
                        $scope.alerts.push({"msg": "Debug failed: " + error.statusText});
                        $scope.isBusy = false;
                    });
                }
            };

            var faceDetect = function(imageFileNames) {

                // do face detect
                $http.post(URL.autodetect, {"filenames": imageFileNames}).then(function (res) {
                    console.log(res);

                    var s_data = [];
                    var i;

                    // if no face detected for any images
                    if (!res.data) {
                        for (i = 0; i < imageFileNames.length; i++) {
                            s_data.push({});
                            $scope.imageCount += 1;
                        }
                    } else {

                        for (i = 0; i < res.data.length; i++) {
                            var data = res.data[i];
                            if (!data) { // no face detected
                                s_data.push([]);
                            } else
                                s_data.push(data);

                            $scope.imageCount += 1;
                        }
                    }

                    var modalInstance = $uibModal.open({
                        animation: true,
                        backdrop: 'static',
                        keyboard: false,
                        size: 'lg',
                        component: 'selectModalComponent',
                        resolve: {
                            params: function () {
                                return {
                                    "uploadDir": $scope.uploadImageDir,
                                    "files": imageFileNames,
                                    "data": s_data
                                }
                            }
                        }
                    });
                    modalInstance.result.then(function (selections) {
                        for (var i = 0; i < imageFileNames.length; i++) {
                            $scope.images[imageFileNames[i]] = {
                                "face_x": selections[imageFileNames[i]].face_x,
                                "face_y": selections[imageFileNames[i]].face_y,
                                "face_width": selections[imageFileNames[i]].face_width,
                                "face_height": selections[imageFileNames[i]].face_height
                            };
                            $scope.imageCount += 1;
                        }
                    });

                }, function (error) {
                    $scope.alerts.push({"msg": "Face auto detect failed: " + error.statusText});
                });
            }

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
