(function() {


    angular.module('facesearch', ['ui.bootstrap', 'ngFileUpload', 'plotModule', 'facesearch.thumbnail'])
        //.constant("URL", {
        //    upload: "http://128.9.184.136:8000/search/upload",
        //    uploadByLink: "http://128.9.184.136:8000/search/uploadByLink",
        //    search: "http://128.9.184.136:8000/search/search"
        //})
        .constant("URL", {
            upload: "http://isicvl03:8001/search/upload",
            uploadByLink: "http://isicvl03:8001/search/uploadByLink",
            search: "http://isicvl03:8001/search/search"
        })

        .controller('faceSearchController', ['$scope', '$http', 'URL', 'Upload', '$q', '$rootScope', function($scope, $http, URL, Upload, $q, $rootScope) {

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
                "imageURL": null
            };

            $scope.result = null;

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
                    });
                }
            };

            $scope.plotAPI = {};

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
                    $scope.imageFilename = null;
                    $scope.imageCount += 1;
                    console.log(x + ", " + y + ", " + w + ", " + h);
                } else {

                }
            };

            $scope.removeImage = function(path) {
                delete $scope.images[path];
                $scope.imageCount -= 1;
            };

            $scope.search = function() {
                $scope.result = null;
                $scope.isSearching = true;
                $http.post(URL.search, $scope.images).then(function(response) {
                    console.log(response.data);
                    $scope.result = response.data;
                    $scope.isSearching = false;
                }, function(error) {
                    console.log(error);
                    $scope.isSearching = false;
                })
            };

            $scope.clear = function() {
                $scope.result = null;
                $scope.images = {};
                $scope.imageCount = 0;
            }

        }])

        .run(['$http', '$rootScope', function($http, $rootScope) {

            var gallery_file = "gallery.csv";

            // load gallery
            $http.get(gallery_file).then(function(response) {
                $rootScope.gallery = parseGallery(response.data);
            }, function(error) {
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
