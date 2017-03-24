(function() {


    angular.module('facesearch', ['ui.bootstrap', 'ngFileUpload', 'plotModule', 'facesearch.thumbnail'])
        .constant("URL", {
            upload: "http://localhost:8000/search/upload",
            initialize: "http://localhost:8000/search/initialize",
            search: "http://localhost:8000/search/search",
            finalize: "http://localhost:8000/search/finalize"
        })

        .controller('faceSearchController', ['$scope', '$http', 'URL', 'Upload', '$q', '$rootScope', function($scope, $http, URL, Upload, $q, $rootScope) {

            $scope.uploadImageDir = "../images/";

            //$scope.galleryImageDir = "/lfs2/glaive/data/CS3_2.0/"; // TODO use this at deployment for linking gallery images
            $scope.galleryImageDir = "http://isicvl03:8001/gallery/";

            $scope.images = {};

            $scope.imageFilename = null;

            $scope.isUploading = false;

            $scope.formModel = {
                "title": null,
                "file": null
            };

            $scope.result = null;

            $scope.upload = function() {
                $scope.isUploading = true;
                Upload.upload({
                    url: URL.upload,
                    data: {"file": $scope.formModel.file}
                }).then(function(response) {
                    $scope.isUploading  = false;
                    console.log(response.data);

                    $scope.imageFilename = response.data;

                }, function(error) {
                    console.log(error);
                });

            };

            $scope.plotAPI = {};

            $scope.resetImage = function() {
                $scope.plotAPI.reset();
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
                    console.log(x + ", " + y + ", " + w + ", " + h);
                } else {

                }
            };

            $scope.removeImage = function(path) {
                delete $scope.images[path];
            };

            $scope.search = function() {
                $http.post(URL.search, $scope.images).then(function(response) {
                    console.log(response.data);
                    $scope.result = response.data;
                }, function(error) {
                    console.log(error);
                })
            };

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
