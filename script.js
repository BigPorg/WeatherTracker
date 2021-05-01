var city = "";
var searchCity = $("#search-city");
var searchButton = $("#search-button");
var clearButton = $("#clear-history");
var currentCity = $("#current-city");
var currentTemperature = $("#temperature");
var currentHumidty = $("#humidity");
var currentWSpeed = $("#wind-speed");
var currentUvindex = $("#uv-index");
var cityArray = [];
// searches history for city
function find(c) {
    for (var i = 0; i < cityArray.length; i++) {
        if (c.toUpperCase() === cityArray[i]) {
            return -1;
        }
    }
    return 1;
}
// api
var apiKey = "4229b667271164cd1c7fcb5021e8b977";
// display weather
function displayWeather(event) {
    event.preventDefault();
    if (searchCity.val().trim() !== "") {
        city = searchCity.val().trim();
        currentWeather(city);
    }
}
function currentWeather(city) {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + apiKey;
    $.ajax({
        url: queryURL,
        method: "GET",
    }).then(function (response) {

        console.log(response);
        var weathericon = response.weather[0].icon;
        var iconurl = "https://openweathermap.org/img/wn/" + weathericon + "@2x.png";
        var date = new Date(response.dt * 1000).toLocaleDateString();
        $(currentCity).html(response.name + "(" + date + ")" + "<img src=" + iconurl + ">");
        // temp converter. TA said to use units = imperial but couldnt get it to work properly
        var tempF = (response.main.temp - 273.15) * 1.80 + 32;
        $(currentTemperature).html((tempF).toFixed(2) + "&#8457");
        // humidity
        $(currentHumidty).html(response.main.humidity + "%");
        // wind
        var ws = response.wind.speed;
        var windsmph = (ws * 2.237).toFixed(1);
        $(currentWSpeed).html(windsmph + "MPH");
        // uv
        UVIndex(response.coord.lon, response.coord.lat);
        forecast(response.id);
        if (response.cod == 200) {
            cityArray = JSON.parse(localStorage.getItem("cityname"));
            console.log(cityArray);
            if (cityArray == null) {
                cityArray = [];
                cityArray.push(city.toUpperCase()
                );
                localStorage.setItem("cityname", JSON.stringify(cityArray));
                addToList(city);
            }
            else {
                if (find(city) > 0) {
                    cityArray.push(city.toUpperCase());
                    localStorage.setItem("cityname", JSON.stringify(cityArray));
                    addToList(city);
                }
            }
        }
    });
}
// returns the uv
function UVIndex(ln, lt) {
    var uvqURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + apiKey + "&lat=" + lt + "&lon=" + ln;
    $.ajax({
        url: uvqURL,
        method: "GET"
    }).then(function (response) {
        $(currentUvindex).html(response.value);
    });
}

// five day forecast
function forecast(cityid) {
    var dayover = false;
    var queryforcastURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityid + "&appid=" + apiKey;
    $.ajax({
        url: queryforcastURL,
        method: "GET"
    }).then(function (response) {

        for (i = 0; i < 5; i++) {
            var date = new Date((response.list[((i + 1) * 8) - 1].dt) * 1000).toLocaleDateString();
            var iconcode = response.list[((i + 1) * 8) - 1].weather[0].icon;
            var iconurl = "https://openweathermap.org/img/wn/" + iconcode + ".png";
            var tempK = response.list[((i + 1) * 8) - 1].main.temp;
            var tempF = (((tempK - 273.5) * 1.80) + 32).toFixed(2);
            var humidity = response.list[((i + 1) * 8) - 1].main.humidity;

            $("#fDate" + i).html(date);
            $("#fImg" + i).html("<img src=" + iconurl + ">");
            $("#fTemp" + i).html(tempF + "&#8457");
            $("#fHumidity" + i).html(humidity + "%");
        }
    });
}

// add city to history
function addToList(c) {
    var listEl = $("<li>" + c.toUpperCase() + "</li>");
    $(listEl).attr("class", "list-group-item");
    $(listEl).attr("data-value", c.toUpperCase());
    $(".list-group").append(listEl);
}
// display history
function invokePastSearch(event) {
    var liEl = event.target;
    if (event.target.matches("li")) {
        city = liEl.textContent.trim();
        currentWeather(city);
    }
}

// render
function loadlastCity() {
    $("ul").empty();
    var cityArray = JSON.parse(localStorage.getItem("cityname"));
    if (cityArray !== null) {
        cityArray = JSON.parse(localStorage.getItem("cityname"));
        for (i = 0; i < cityArray.length; i++) {
            addToList(cityArray[i]);
        }
        city = cityArray[i - 1];
        currentWeather(city);
    }
}
// clear history
function clearHistory(event) {
    event.preventDefault();
    cityArray = [];
    localStorage.removeItem("cityname");
    document.location.reload();

}
// click handlers
$("#search-button").on("click", displayWeather);
$(document).on("click", invokePastSearch);
$(window).on("load", loadlastCity);
$("#clear-history").on("click", clearHistory);