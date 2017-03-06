(function() {

    angular.module('facesearch', ['ui.bootstrap', 'ngFileUpload'])
        .constant("searchURL", "http://localhost:8000/search")

        .controller('faceSearchController', ['$scope', '$http', 'searchURL', 'Upload', function($scope, $http, searchURL, Upload) {

            $scope.isUploading = false;

            $scope.formModel = {
                "title": null,
                "file": null
            };

            $scope.upload = function() {
                $scope.isUploading = true;
                Upload.upload({
                    url: searchURL,
                    data: {"title": $scope.formModel.title, "file": $scope.formModel.file}
                }).then(function(response) {
                    $scope.isUploading  = false;
                    console.log(response.data);
                }, function(error) {
                    console.log(error);
                });

            };

        }])


})();
