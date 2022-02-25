const app = angular.module("myApp", []);
app.controller("myCtrl", [
    "$scope",
    "$window",
    "$http",
    ($, $window, $http) => {
        $.hostname = "http://cs102.nihs.tp.edu.tw/School_project";
        $.api = "http://cs102.nihs.tp.edu.tw:5000";
        $.Restaurants = [];
        $.restaurants = [];
        $.current_restaurant = {
            logo: "",
            name: "",
            rating: 0,
            cuisines: [],
            code: "",
            labels: [],
        };
        $.categories = [];
        $.meal = "";
        $.products_selected = [];
        $.amount = 0;
        $.canOrder = false;
        $.canCompare = false;
        $.compared = false;
        $.sortedMeals = [];
        $.similar_restaurants = [];
        $.compare_restaurants = [];
        $.init = () => {
            $http
                .get(`${$.hostname}/data/restaurants.json`)
                .then((res) => {
                    $.Restaurants = res.data;
                })
                .catch((err) => {
                    console.error(err);
                });
            $http
                .get(`${$.api}/search?key`)
                .then((res) => {
                    $.restaurants = res.data;
                })
                .catch((err) => {
                    console.error(err);
                });
        };
        $.handleOrder = (order) => {
            switch (order) {
                case "default":
                default:
                    $.restaurants.sort((a, b) => a.id - b.id);
                    break;
                case "fee":
                    $.restaurants.sort(
                        (a, b) =>
                            a.minimum_delivery_fee - b.minimum_delivery_fee
                    );
                    break;
                case "rating":
                    $.restaurants.sort((a, b) => b.rating - a.rating);
                    break;
                case "time":
                    $.restaurants.sort(
                        (a, b) =>
                            a.minimum_delivery_time - b.minimum_delivery_time
                    );
                    break;
            }
        };
        $.handleSearch = () => {
            $http
                .get(`${$.api}/search?key=${$.meal}`)
                .then((res) => {
                    $.meal = "";
                    $.restaurants = res.data;
                    $window.scrollTo({ top: 0, behavior: "instant" });
                })
                .catch((err) => {
                    console.error(err);
                });
        };
        $.labels = () => {
            let labels = [];
            return labels
                .concat(
                    ...$.Restaurants.map((restaurant) =>
                        restaurant.cuisines.map((cuisine) => cuisine.name)
                    )
                )
                .filter((val, idx, arr) => arr.indexOf(val) === idx);
        };
        $.filterRestaurants = (label) => {
            $.restaurants = $.Restaurants.filter((restaurant) =>
                restaurant.cuisines
                    .map((cuisine) => cuisine.name)
                    .includes(label)
            );
        };
        $.chooseRestaurant = (restaurant) => {
            $http
                .get(`${$.api}/restaurant?code=${restaurant.code}`)
                .then((res) => {
                    $.current_restaurant = {
                        logo: restaurant.hero_image,
                        name: restaurant.name,
                        rating: restaurant.rating,
                        cuisines: restaurant.cuisines,
                        code: restaurant.code,
                    };
                    $.categories = res.data.menus[0].menu_categories;
                    $.similar_restaurants = $.restaurants.filter((restaurant) =>
                        restaurant.cuisines
                            .map((cuisine) => cuisine.name)
                            .includes(
                                ...$.current_restaurant.cuisines.map(
                                    (cuisine) => cuisine.name
                                )
                            )
                    );
                    $.amount = restaurant.minimum_delivery_fee;
                    $.canOrder = true;
                    for (let i = 0; i < $.categories.length; i++) {
                        for (
                            let j = 0;
                            j < $.categories[i].products.length;
                            j++
                        ) {
                            $.categories[i].products[j].selected = false;
                        }
                    }
                    $window.scrollTo({ top: 210, behavior: "instant" });
                });
        };
        $.SearchFilter = (e) => {
            $.meal = e.meal;
            if ($.meal.length > 0) {
                $window.scrollTo({ top: 410, behavior: "smooth" });
                let all_products = [];
                for (let i = 0; i < $.categories.length; i++) {
                    for (let j = 0; j < $.categories[i].products.length; j++) {
                        all_products.push($.categories[i].products[j]);
                    }
                }
                $.sortedMeals = all_products.filter((product) =>
                    product.name.includes($.meal)
                );
            }
        };
        $.chooseProduct = (product) => {
            document.querySelector(".compare").style.display = "block";
            $.amount += product.product_variations[0].price;
            product.selected = !product.selected;
            if (product.selected) {
                $.products_selected.push(product.name);
            } else {
                $.products_selected = $.products_selected.filter((value) => {
                    value != product.name;
                });
            }
        };
        $window.onscroll = () => {
            if (document.documentElement.scrollTop > 100) {
                document.querySelector(".scrollTop").style.display = "flex";
            } else {
                document.querySelector(".scrollTop").style.display = "none";
            }
        };
        $.scrollTop = () => {
            $window.scrollTo({ top: 0, behavior: "smooth" });
        };
        $.compare = () => {
            $.canOrder = false;
            $.canCompare = true;
            $.compared = true;
            $window.scrollTo({ top: 0, behavior: "smooth" });
            document.querySelector(".compare").style.display = "none";
            let queryString = $.products_selected;
            for (let i = 0; i < $.similar_restaurants.length; i++) {
                $http
                    .get(
                        `${$.api}/search_box?code=${$.similar_restaurants[i].code}&box=${queryString}`
                    )
                    .then((res) => {
                        let count = 0;
                        for (let j = 0; j < res.data.answer.length; j++) {
                            if (res.data.answer[j].length > 0) {
                                count++;
                            }
                        }
                        let amount = 0;
                        if (count === $.products_selected.length) {
                            $.compare_restaurants.push(
                                $.similar_restaurants[i]
                            );
                            $.compare_restaurants[
                                $.compare_restaurants.length - 1
                            ]["answer"] = res.data.answer;
                            for (let j = 0; j < res.data.answer.length; j++) {
                                amount += res.data.answer[j][0][1];
                            }
                            $.compare_restaurants[
                                $.compare_restaurants.length - 1
                            ]["fee"] =
                                $.compare_restaurants[
                                    $.compare_restaurants.length - 1
                                ].minimum_delivery_fee;
                            $.compare_restaurants[
                                $.compare_restaurants.length - 1
                            ]["amount"] =
                                amount +
                                $.compare_restaurants[
                                    $.compare_restaurants.length - 1
                                ]["fee"];
                        }
                    });
            }
        };
        $.compareAmount = (order) => {
            switch (order) {
                case "lowToHigh":
                    $.compare_restaurants.sort((a, b) => a.amount - b.amount);
                    break;
                case "highToLow":
                    $.compare_restaurants.sort((a, b) => b.amount - a.amount);
                    break;
            }
        };
    },
]);
