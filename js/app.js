const app = angular.module("myApp", []);
app.controller("myCtrl", ($scope, $http) => {
    $scope.hostname = "http://localhost/web/School_project";
    $scope.restaurants = [];
    $scope.product = "";
    $http
        .get(`${$scope.hostname}/data/restaurants.json`)
        .then((res) => {
            $scope.restaurants = res.data;
        })
        .catch((err) => {
            console.error(err);
        });
});
