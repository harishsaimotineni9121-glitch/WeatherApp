let city=document.querySelector("#inputcity");
let button=document.querySelector("#button");
let cities=document.querySelectorAll(".city > div");
cities.forEach(function(cityButton){
    cityButton.addEventListener("click",function(){
        let cityName=cityButton.textContent.trim();
        city.value=cityName;
        getweather(cityName);
    });
});

function searchCity() {
    let cityName=city.value.trim();
    if (cityName === "") {
        console.log("Please enter a city name");
        return;
    }
    getweather(cityName);
}

button.addEventListener("click", searchCity);

city.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        searchCity();
    }
});

async function getweather(city){
    let apiKey = "ba1c111fafce7cc3d64136543bcfdf1c";
    let url =`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    try{
        let response=await fetch(url);
        if(!response.ok){
            throw new Error("City not found or API request failed");
        }
        let data=await response.json();
        currentCelsius = data.main.temp;
        feelsLikeCelsius = data.main.feels_like;
        updateTemperature();
        await getForecast(city);
        console.log(data);
        document.getElementById("1").textContent=data.name;
        document.getElementById("2").textContent=data.sys.country;
        document.getElementById("4").textContent =
            data.weather[0].description;
        document.getElementById("6").textContent =
            "Humidity: " + data.main.humidity + "%";
        document.getElementById("7").textContent =
            "Wind Speed: " + (data.wind.speed * 3.6).toFixed(1) + " km/h";
        document.getElementById("8").textContent =
            "Pressure: " + data.main.pressure + " hPa";
        document.getElementById("9").textContent =
            "Visibility: " + (data.visibility / 1000) + " km";
        console.log(data);
    }catch(error){
        console.log(error.message);
    }
}

let celsiusButton=document.querySelector(".centi");
let fahrenheiButton=document.querySelector(".farhen");

let currentCelsius = null;
let feelsLikeCelsius = null;
let currentUnit = "C";

function updateTemperature(){
    if (currentCelsius === null) return;
    let temperature = currentCelsius;
    let feelsLike = feelsLikeCelsius;
    let unit = "°C";

    if (currentUnit === "F") {
        temperature = (currentCelsius * 9 / 5) + 32;
        feelsLike = (feelsLikeCelsius * 9 / 5) + 32;
        unit = "°F";
    }

    document.getElementById("3").textContent =
        Math.round(temperature) + unit;

    document.getElementById("5").textContent =
        "Feels like " + Math.round(feelsLike) + unit;
}

celsiusButton.addEventListener("click",function(){
    currentUnit="C";
    updateTemperature();
});

fahrenheiButton.addEventListener("click",function(){
    currentUnit="F";
    updateTemperature();
});


let locationButton = document.querySelector(".location");

locationButton.addEventListener("click", function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                let latitude = position.coords.latitude;
                let longitude = position.coords.longitude;

                getWeatherByLocation(latitude, longitude);
            },
            function (error) {
                console.log("Location error:", error.message);
                alert("Please allow location access and try again.");
            }
        );
    } else {
        alert("Geolocation is not supported by your browser.");
    }
});


async function getWeatherByLocation(latitude, longitude) {
    let apiKey = "ba1c111fafce7cc3d64136543bcfdf1c";
    let url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
    try {
        let response = await fetch(url);
        if (!response.ok) {
            throw new Error("Unable to fetch local weather");
        }
        let data = await response.json();
        city.value = data.name;
        document.getElementById("1").textContent = data.name;
        document.getElementById("2").textContent = data.sys.country;
        currentCelsius = data.main.temp;
        feelsLikeCelsius = data.main.feels_like;
        updateTemperature();
        await getForecast(data.name);
        document.getElementById("4").textContent =
            data.weather[0].description;
        document.getElementById("6").textContent =
            "Humidity: " + data.main.humidity + "%";
        document.getElementById("7").textContent =
            "Wind Speed: " + (data.wind.speed * 3.6).toFixed(1) + " km/h";
        document.getElementById("8").textContent =
            "Pressure: " + data.main.pressure + " hPa";
        document.getElementById("9").textContent =
            "Visibility: " + (data.visibility / 1000) + " km";
    } catch (error) {
        console.error(error.message);
        alert(error.message);
    }
}



async function getForecast(cityName) {
    try {
        let geoUrl =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
        let geoResponse = await fetch(geoUrl);
        if (!geoResponse.ok) {
            throw new Error("Unable to find city");
        }
        let geoData = await geoResponse.json();
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found");
        }
        let latitude = geoData.results[0].latitude;
        let longitude = geoData.results[0].longitude;
        let forecastUrl =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`;
        let response = await fetch(forecastUrl);
        if (!response.ok) {
            throw new Error("Unable to fetch forecast");
        }
        let data = await response.json();
        let cards = document.querySelectorAll(".forecast-card");
        function getWeatherIcon(code) {
            if (code === 0) return "☀️";
            if (code === 1 || code === 2) return "🌤️";
            if (code === 3) return "☁️";
            if (code === 45 || code === 48) return "🌫️";
            if ([51, 53, 55, 56, 57].includes(code)) return "🌦️";
            if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "🌧️";
            if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
            if ([95, 96, 99].includes(code)) return "⛈️";
            return "🌡️";
        }
        data.daily.time.forEach(function (date, index) {
            let card = cards[index];
            if (!card) return;
            let forecastDate = new Date(date + "T12:00:00");
            let dayName = index === 0
                ? "Today"
                : forecastDate.toLocaleDateString("en-US", {
                    weekday: "short"
                });
            let formattedDate = forecastDate.toLocaleDateString("en-US", {
                day: "numeric",
                month: "short"
            });
            let high = Math.round(data.daily.temperature_2m_max[index]);
            let low = Math.round(data.daily.temperature_2m_min[index]);
            let icon = getWeatherIcon(data.daily.weather_code[index]);
            card.querySelector("h3").textContent = dayName;
            card.querySelector(".date").textContent = formattedDate;
            card.querySelector(".weather-icon").textContent = icon;
            card.querySelector("h2").textContent = high + "°C";
            card.querySelector(".low").textContent = "Low: " + low + "°C";
            card.style.display = "";
        });
        cards.forEach(function (card, index) {
            card.style.display = index < 7 ? "" : "none";
        });
        if (cards.length < 7) {
            console.warn("Add at least 7 forecast-card elements in your HTML.");
        }
    } catch (error) {
        console.error("Forecast error:", error.message);
    }
}
