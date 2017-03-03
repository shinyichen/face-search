(function() {

    angular.module('facesearch', ['ui.bootstrap', 'ngUpload'])
        .constant("searchURL", "http://localhost:8000/search")

        .controller('faceSearchController', ['$scope', '$rootScope', '$http', 'searchURL', function($scope, $rootScope, $http, searchURL) {

            $scope.isUploading = false;

            $scope.formModel = {
                "title": ""
            };

            $scope.message = "";

            $scope.upload = function() {
                $scope.isUploading = true;
                $http.post(searchURL, $scope.formModel).then(function(response) {
                    $scope.message = response.data;
                    $scope.isUploading  = false;
                }, function(error) {
                    console.log(error);
                });
            };

        }])


})();
