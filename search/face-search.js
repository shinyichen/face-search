(function() {

    angular.module('facesearch', ['ui.bootstrap'])
        .constant("ServerPort", "8000")

        .controller('faceSearchController', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {


        }])

        .run(['$http', '$rootScope', 'ServerPort', function($http, $rootScope, ServerPort) {

            var clientHost = window.location.host;
            var clientHostName = window.location.hostname;
            var clientOrigin = window.location.origin;
            var searchURL = clientOrigin.replace(clientHost, clientHostName + ":" + ServerPort) + "/search";

            $rootScope.test = "";

            console.log(searchURL);
            $http.get(searchURL).then(function(response) {
                $rootScope.test= response.data;
            }, function(error) {
                console.log(error);
            });

        }]);


})();
