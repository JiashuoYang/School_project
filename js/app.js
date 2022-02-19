const app = angular.module("myApp", []);
app.controller("myCtrl", ($scope, $http) => {
    $scope.hostname = "http://cs102.nihs.tp.edu.tw:5000";
    $scope.restaurants = [];
    $scope.restaurant_logo = "";
    $scope.restaurant_name = "";
    $scope.categories = [];
    $scope.product = "";
    $http
        .get(`${$scope.hostname}/search?key`)
        .then((res) => {
            $scope.restaurants = res.data;
        })
        .catch((err) => {
            console.error(err);
        });
    $scope.handleSearch = () => {
        $scope.product = "";
        $http
            .get(`${$scope.hostname}/search?key=${$scope.prodefct}`)
            .then((res) => {
                $scope.restaurants = res.data;
            })
            .catch((err) => {
                console.error(err);
            });
    };
    $scope.chooseRestaurant = (restaurant) => {
        $http
            .get(`${$scope.hostname}/restaurant?code=${restaurant.code}`)
            .then((res) => {
                $scope.restaurant_logo = restaurant.hero_image;
                $scope.restaurant_name = restaurant.name;
                $scope.restaurants = [];
                $scope.categories = res.data.menus[0].menu_categories;
                console.log(res.data.menus[0].menu_categories);
            });
    };
});
