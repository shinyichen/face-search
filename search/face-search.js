(function() {

    angular.module('facesearch', ['ui.bootstrap', 'ngFileUpload', 'plotModule'])
        .constant("URL", {
            upload: "http://localhost:8000/search/upload",
            search: "http://localhost:8000/search/hello"
        })

        .controller('faceSearchController', ['$scope', '$http', 'URL', 'Upload', function($scope, $http, URL, Upload) {

            $scope.images = {};

            $scope.currentImagePath = null;

            $scope.isUploading = false;

            $scope.formModel = {
                "title": null,
                "file": null
            };

            $scope.upload = function() {
                $scope.isUploading = true;
                Upload.upload({
                    url: URL.upload,
                    data: {"file": $scope.formModel.file}
                }).then(function(response) {
                    $scope.isUploading  = false;
                    console.log(response.data);

                    $scope.currentImagePath = "../images/" + response.data;

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
                    $scope.images[$scope.currentImagePath] = {
                        "x": x,
                        "y": y,
                        "width": w,
                        "height": h
                    };
                    $scope.currentImagePath = null;
                    console.log(x + ", " + y + ", " + w + ", " + h);
                } else {

                }
            };

            $scope.removeImage = function(path) {
                delete $scope.images[path];
            };

            $scope.search = function() {
                $http.get(URL.search).then(function(response) {
                    console.log(response.data);
                }, function(error) {
                    console.log(error);
                })
            };

        }])


})();
