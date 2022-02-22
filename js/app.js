const app = angular.module("myApp", []);
app.controller("myCtrl", ($scope, $window, $http) => {
    $scope.hostname = "http://localhost/web/School_project";
    $scope.api = "http://cs102.nihs.tp.edu.tw:5000";
    $scope.Restaurants = [];
    $scope.restaurants = [];
    $scope.current_restaurant = {
        logo: "",
        name: "",
        rating: 0,
        cuisines: [],
        code: "",
        labels: [],
    };
    $scope.codes = [];
    $scope.random_codes = [];
    $scope.categories = [];
    $scope.meal = "";
    $scope.products_selected = [];
    $scope.amount = 0;
    $scope.canOrder = false;
    $scope.canCompare = false;
    $scope.compared = false;
    $scope.sortedMeals = [];
    $scope.similar_restaurants = [];
    $scope.compare_restaurants = [];
    $scope.compare_restaurant_products = [];
    $http
        .get(`${$scope.hostname}/data/restaurants.json`)
        .then((res) => {
            $scope.Restaurants = res.data;
        })
        .catch((err) => {
            console.error(err);
        });
    $http
        .get(`${$scope.api}/search?key`)
        .then((res) => {
            $scope.restaurants = res.data;
            for (let i = 0; i < $scope.restaurants.length; i++) {
                $scope.codes.push($scope.restaurants[i].code);
                // console.log($scope.restaurants[i].code);
            }
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
    $scope.labels = () => {
        let labels = [];
        return labels
            .concat(
                ...$scope.Restaurants.map((restaurant) =>
                    restaurant.cuisines.map((cuisine) => cuisine.name)
                )
            )
            .filter((val, idx, arr) => arr.indexOf(val) === idx);
    };
    $scope.filterRestaurants = (label) => {
        $scope.restaurants = $scope.Restaurants.filter((restaurant) =>
            restaurant.cuisines.map((cuisine) => cuisine.name).includes(label)
        );
    };
    $scope.chooseRestaurant = (restaurant) => {
        $http
            .get(`${$scope.api}/restaurant?code=${restaurant.code}`)
            .then((res) => {
                $scope.current_restaurant = {
                    logo: restaurant.hero_image,
                    name: restaurant.name,
                    rating: restaurant.rating,
                    cuisines: restaurant.cuisines,
                    code: restaurant.code,
                };
                $scope.categories = res.data.menus[0].menu_categories;
                $scope.similar_restaurants = $scope.restaurants.filter(
                    (restaurant) =>
                        restaurant.cuisines
                            .map((cuisine) => cuisine.name)
                            .includes(
                                ...$scope.current_restaurant.cuisines.map(
                                    (cuisine) => cuisine.name
                                )
                            )
                );
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
                window.scrollTo({ top: 210, behavior: "instant" });
            });
    };
    $scope.SearchFilter = (e) => {
        $scope.meal = e.meal;
        if ($scope.meal.length > 0) {
            window.scrollTo({ top: 410, behavior: "smooth" });
            let all_products = [];
            for (let i = 0; i < $scope.categories.length; i++) {
                for (let j = 0; j < $scope.categories[i].products.length; j++) {
                    all_products.push($scope.categories[i].products[j]);
                }
            }
            console.log(all_products);

            $scope.sortedMeals = all_products.filter((product) =>
                product.name.includes($scope.meal)
            );
        }
    };
    $scope.chooseProduct = (product) => {
        document.querySelector("#compare").style.display = "block";
        $scope.products_selected.push(product.name);
        $scope.amount += product.product_variations[0].price;
        console.log(
            `餐廳：${$scope.current_restaurant.name}，餐點：${product.name}，價格：${product.product_variations[0].price}`
        );
        console.log(`合計：${$scope.amount}(含外送服務費)`);
        product.selected = true;
        product.count++;
        // let queryString = encodeURIComponent(
        //     JSON.stringify(...$scope.products_selected)
        // );
        let queryString = $scope.products_selected;

        for (let i = 0; i < $scope.similar_restaurants.length; i++) {
            $http
                .get(
                    `${$scope.api}/search_box?code=${$scope.similar_restaurants[i].code}&box=${queryString}`
                )
                .then((res) => {
                    console.log(
                        `${$scope.api}/search_box?code=${$scope.similar_restaurants[i].code}&box=${queryString}`
                    );
                    // let answer = [];
                    // console.log(res.data.answer);
                    // for (let j = 0; j < res.data.answer.length; j++) {
                    //     if (res.data.answer[j] !== "") {
                    //         answer.push(res.data.answer[j]);
                    //     }
                    // }
                    console.log(res.data.answer);
                    let pass = false;
                    for (let k = 0; k < res.data.answer.length; k++) {
                        for (let j = 0; j < res.data.answer[k].length; j++) {
                            if (
                                res.data.answer[k][j].length > 0 &&
                                res.data.answer.length ===
                                    $scope.products_selected.length
                            ) {
                                pass = true;
                            }
                        }
                    }
                    if (pass) {
                        $scope.compare_restaurants.push({
                            ...$scope.similar_restaurants[i],
                            answer: res.data.answer,
                        });
                    }

                    // if (res.data.answer[0].length > 0) {
                    //     $scope.compare_restaurants.push({
                    //         ...$scope.similar_restaurants[i],
                    //         answer: res.data.answer,
                    //     });

                    // }
                    // console.log(res.data.answer.length);
                    // console.log($scope.products_selected.length);
                    // if (
                    //     res.data.answer.length ===
                    //     $scope.products_selected.length
                    // ) {
                    //     $scope.compare_restaurants.push({
                    //         ...$scope.similar_restaurants[i],
                    //         answer: res.data.answer,
                    //     });
                    // }
                    console.log(
                        $scope.compare_restaurants.map((res) => res.answer)
                    );
                });
        }
    };
    window.onscroll = () => {
        if (document.documentElement.scrollTop > 100) {
            document.querySelector("#scrollTop").style.display = "flex";
        } else {
            document.querySelector("#scrollTop").style.display = "none";
        }
    };
    $scope.scrollTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    $scope.compare = () => {
        $scope.canOrder = false;
        $scope.canCompare = true;
        $scope.compared = true;
        window.scrollTo({ top: 0, behavior: "smooth" });
        document.querySelector("#compare").style.display = "none";
    };
});
