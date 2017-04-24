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

            $scope.imageFilename = null;

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

            $scope.upload = function() {
                if ($scope.isBusy) {
                    $scope.alerts.push({"msg": "App is busy. Try again later!"});
                    return;
                }

                if ($scope.formModel.file) { // upload local file

                    $scope.isBusy = true;
                    Upload.upload({
                        url: URL.upload,
                        data: {"file": $scope.formModel.file}
                    }).then(function (response) {
                        $scope.isBusy = false;
                        console.log(response.data);

                        $scope.imageFilename = response.data;
                        $scope.formModel.file = null;

                    }, function (error) {
                        console.log(error);
                        $scope.formModel.file = null;
                        $scope.isBusy = false;

                        $scope.alerts.push({"msg": "Upload failed: " + error.statusText});
                    });
                } else if ($scope.formModel.imageURL) { // upload by url

                    $scope.isBusy = true;
                    $http.post(URL.uploadByLink, {"imageURL": $scope.formModel.imageURL}).then(function (response) {
                        $scope.isBusy = false;
                        console.log(response.data);

                        $scope.imageFilename = response.data;
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

                    $q.all(promises).then(function(responses) {
                        responses.forEach(function(response) {
                            var imageFileName = response.data;
                            $http.post(URL.autodetect, {"filename": imageFileName}).then(function(response) {
                                console.log(response);
                                if (response.data.length > 1) {
                                    var modalInstance = $uibModal.open({
                                        animation: true,
                                        backdrop: true,
                                        keyboard: true,
                                        size: 'lg',
                                        component: 'selectModalComponent',
                                        resolve: {
                                            params: function () {
                                                return {
                                                    "file": $scope.uploadImageDir + imageFileName,
                                                    "data": response.data
                                                }
                                            }
                                        }
                                    });
                                    modalInstance.result.then(function (selectedItem) {
                                        if (!selectedItem)
                                            selectedItem = 0;
                                        $scope.images[imageFileName] = {
                                            "face_x": response.data[selectedItem].face_x,
                                            "face_y": response.data[selectedItem].face_y,
                                            "face_width": response.data[selectedItem].face_width,
                                            "face_height": response.data[selectedItem].face_height
                                        };
                                    }, function () {
                                        // dialog dismissed without selecting
                                        // automatically select the first one
                                        $scope.images[imageFileName] = {
                                            "face_x": response.data[0].face_x,
                                            "face_y": response.data[0].face_y,
                                            "face_width": response.data[0].face_width,
                                            "face_height": response.data[0].face_height
                                        };
                                    });
                                } else {
                                    $scope.images[imageFileName] = {
                                        "face_x": response.data[0].face_x,
                                        "face_y": response.data[0].face_y,
                                        "face_width": response.data[0].face_width,
                                        "face_height": response.data[0].face_height
                                    };
                                }
                                $scope.imageCount += 1;
                            }, function(error) {
                                $scope.alerts.push({"msg": "Face auto detect failed: " + error.statusText});
                                $scope.isBusy =false;
                                return;
                            });

                        });
                        $scope.isBusy =false;
                    }, function(error) {
                        $scope.alerts.push({"msg": "Upload failed: " + error.statusText});
                        $scope.isBusy =false;
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

                    $scope.imageFilename = null;
                    $scope.imageCount += 1;

                } else {
                    // boundaries not drawn, auto detect

                    if ($scope.isBusy) {
                        $scope.alerts.push({"msg": "Unable to auto detect boundaries while app is busy. Try again later!"});
                        return;
                    }

                    $scope.isBusy = true;
                    $http.post(URL.autodetect, {"filename": $scope.imageFilename}).then(function(response) {
                        console.log(response);
                        if (response.data.length > 1) {
                            var modalInstance = $uibModal.open({
                                animation: true,
                                backdrop: true,
                                keyboard: true,
                                size: 'lg',
                                component: 'selectModalComponent',
                                resolve: {
                                    params: function () {
                                        return {
                                            "file": $scope.uploadImageDir + $scope.imageFilename,
                                            "data": response.data
                                        }
                                    }
                                }
                            });
                            modalInstance.result.then(function (selectedItem) {
                                if (!selectedItem)
                                    selectedItem = 0;
                                $scope.images[$scope.imageFilename] = {
                                    "face_x": response.data[selectedItem].face_x,
                                    "face_y": response.data[selectedItem].face_y,
                                    "face_width": response.data[selectedItem].face_width,
                                    "face_height": response.data[selectedItem].face_height
                                };
                                $scope.imageFilename = null;
                                $scope.imageCount += 1;
                                $scope.isBusy = false;
                            }, function () {
                                // dialog dismissed without selecting
                                // automatically select the first one
                                $scope.images[$scope.imageFilename] = {
                                    "face_x": response.data[0].face_x,
                                    "face_y": response.data[0].face_y,
                                    "face_width": response.data[0].face_width,
                                    "face_height": response.data[0].face_height
                                };
                                $scope.imageFilename = null;
                                $scope.imageCount += 1;
                                $scope.isBusy = false;
                            });
                        } else {
                            $scope.images[$scope.imageFilename] = {
                                "face_x": response.data[0].face_x,
                                "face_y": response.data[0].face_y,
                                "face_width": response.data[0].face_width,
                                "face_height": response.data[0].face_height
                            };
                            $scope.imageFilename = null;
                            $scope.imageCount += 1;
                            $scope.isBusy = false;
                        }

                    }, function(error) {
                        $scope.alerts.push({"msg": "Face auto detect failed: " + error.statusText});
                        $scope.isBusy = false;
                    });
                }
            };

            $scope.removeImage = function(path) {
                delete $scope.images[path];
                delete $scope.debugData[path];
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

                    // remove debug data
                    delete $scope.debugData[$scope.imageFilename];

                    $scope.imageFilename = null;
                    $scope.editing = false;

                } else {
                    // boundaries not drawn, auto detect
                    if ($scope.isBusy) {
                        $scope.alerts.push({"msg": "Unable to auto detect boundaries while app is busy. Try again later!"});
                        return;
                    }

                    $scope.isBusy = true;
                    $http.post(URL.autodetect, {"filename": $scope.imageFilename}).then(function(response) {
                        console.log(response);
                        if (response.data.length > 1) {
                            var modalInstance = $uibModal.open({
                                animation: true,
                                backdrop: true,
                                keyboard: true,
                                size: 'lg',
                                component: 'selectModalComponent',
                                resolve: {
                                    params: function () {
                                        return {
                                            "file": $scope.uploadImageDir + $scope.imageFilename,
                                            "data": response.data
                                        }
                                    }
                                }
                            });
                            modalInstance.result.then(function (selectedItem) {
                                $scope.images[$scope.imageFilename] = {
                                    "face_x": response.data[selectedItem].face_x,
                                    "face_y": response.data[selectedItem].face_y,
                                    "face_width": response.data[selectedItem].face_width,
                                    "face_height": response.data[selectedItem].face_height
                                };
                                $scope.imageFilename = null;
                                $scope.editing = false;
                                $scope.isBusy = false;
                            }, function () {
                                // dialog dismissed without selecting
                                // automatically select the first one
                                $scope.images[$scope.imageFilename] = {
                                    "face_x": response.data[0].face_x,
                                    "face_y": response.data[0].face_y,
                                    "face_width": response.data[0].face_width,
                                    "face_height": response.data[0].face_height
                                };
                                $scope.imageFilename = null;
                                $scope.editing = false;
                                $scope.isBusy = false;
                            });
                        } else {
                            $scope.images[$scope.imageFilename] = {
                                "face_x": response.data[0].face_x,
                                "face_y": response.data[0].face_y,
                                "face_width": response.data[0].face_width,
                                "face_height": response.data[0].face_height
                            };
                            $scope.imageFilename = null;
                            $scope.editing = false;
                            $scope.isBusy = false;
                        }

                        // remove debug data
                        delete $scope.debugData[$scope.imageFilename];

                    }, function(error) {
                        $scope.alerts.push({"msg": "Face auto detect failed: " + error.statusText});
                        $scope.isBusy = false;
                    });
                }

            };

            $scope.cancelEdit = function() {
                $scope.imageFilename = null;
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
                                    "confidence": data.confidence
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
                                        "confidence": data.confidence
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
