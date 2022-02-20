const app = angular.module("myApp", []);
app.controller("homeCtrl", ($scope, $http) => {
    $scope.hostname = "http://localhost/web/School_project/pages/index.html";
    $scope.api = "http://cs102.nihs.tp.edu.tw:5000";
    $scope.restaurants = [];
    $scope.current_restaurant = {
        logo: "",
        name: "",
        rating: 0,
        cuisines: [],
        code: "",
    };
    $scope.categories = [];
    $scope.meal = "";
    $scope.products_selected = [];
    $scope.amount = 0;
    $scope.canOrder = false;
    $scope.sortedMeals = [];
    $http
        .get(`${$scope.api}/search?key`)
        .then((res) => {
            $scope.restaurants = res.data;
        })
        .catch((err) => {
            console.error(err);
        });
    $scope.handleOrder = (order) => {
        console.log(order);
        switch (order) {
            case "default":
            default:
                $scope.restaurants.sort((a, b) => a.id - b.id);
                break;
            case "fee":
                $scope.restaurants.sort(
                    (a, b) => a.minimum_delivery_fee - b.minimum_delivery_fee
                );
                break;
            case "rating":
                $scope.restaurants.sort((a, b) => b.rating - a.rating);
                break;
            case "time":
                $scope.restaurants.sort(
                    (a, b) => a.minimum_delivery_time - b.minimum_delivery_time
                );
                break;
        }
    };
    $scope.handleSearch = () => {
        $scope.meal = "";
        $http
            .get(`${$scope.api}/search?key=${$scope.meal}`)
            .then((res) => {
                $scope.restaurants = res.data;
            })
            .catch((err) => {
                console.error(err);
            });
    };
    $scope.chooseRestaurant = (restaurant) => {
        $http
            .get(`${$scope.api}/restaurant?code=${restaurant.code}`)
            .then((res) => {
                $scope.restaurants = [];
                $scope.current_restaurant = {
                    logo: restaurant.hero_image,
                    name: restaurant.name,
                    rating: restaurant.rating,
                    cuisines: restaurant.cuisines,
                    code: restaurant.code,
                };
                $scope.categories = res.data.menus[0].menu_categories;
                $scope.amount = restaurant.minimum_delivery_fee;
                $scope.canOrder = true;
                for (let i = 0; i < $scope.categories.length; i++) {
                    for (
                        let j = 0;
                        j < $scope.categories[i].products.length;
                        j++
                    ) {
                        $scope.categories[i].products[j].selected = false;
                        $scope.categories[i].products[j].count = 0;
                    }
                }
            });
    };
    $scope.SearchFilter = (e) => {
        $scope.meal = e.meal;
        if ($scope.meal.length > 0) {
            $scope.sortedMeals = $scope.categories.filter((categorie) =>
                categorie.products
                    .map((product) => product.name)
                    .includes($scope.meal)
            );
            console.log($scope.meal);
        } else {
            console.log("none of the above.");
        }
    };
    $scope.chooseProduct = (product) => {
        $scope.products_selected.push(product.name);
        $scope.amount += product.product_variations[0].price;
        console.log(
            `餐點：${product.name}，價格：${product.product_variations[0].price}`
        );
        console.log(`合計：${$scope.amount}(含外送服務費)`);
        product.selected = true;
        product.count++;
        // $http
        //     .get(
        //         `${$scope.api}/search_box?code=${$scope.restaurant_code}&box="${$scope.products}"`
        //     )
        //     .then((res) => {
        //         console.log(res.data.answer);
        //     });
    };
});
