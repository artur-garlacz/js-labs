//LAB 7
const API_KEY = "d7818ca22a941ac71e9f35b02762b407"; //

document.addEventListener("DOMContentLoaded", () => {
  _viewModel.setView();
});

const uuidv4 = () => {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
};

class Place {
  name;
  country;

  constructor(name, country) {
    this.name = name;
    this.country = country;
  }
}

const _viewModel = {
  addressValue: document.getElementById("title-location"),
  tempValue: document.querySelector(".temp"),
  temp_maxValue: document.querySelector(".high"),
  temp_minValue: document.querySelector(".low"),
  humidityValue: document.querySelector(".humidity-value"),
  pressureValue: document.querySelector(".pressure-value"),
  conditionsValue: document.querySelector(".conditions"),
  currentPosition: null,
  favPlaces: JSON.parse(localStorage.getItem("favPlaces")) || [],
  historicalWeathers: localStorage.getItem("favPlaces") || [],
  setView() {
    // let titleDate = document.getElementById("title-date");
    // titleDate.innerHTML = this.getCurrentTime();
    document
      .querySelector(".form-search-btn")
      .addEventListener("click", () => this.fetchWeatherDataFromUser());

    // this.loadWeatherList();
    setInterval(() => {
      this.getWeatherForFavPlaces(this.renderFavPlacesWeather);
    }, 5000);
  },
  renderFavPlaceWeather(weather) {
    const { humidity, pressure, temp, temp_max, temp_min } = weather.main;
    const { main, icon } = data.weather[0];
    const {
      tempValue,
      temp_maxValue,
      temp_minValue,
      humidityValue,
      pressureValue,
      conditionsValue,
    } = _viewModel;

    // tempValue.innerHTML = temp;
    // temp_maxValue.innerHTML = temp_max;
    // temp_minValue.innerHTML = temp_min;
    // humidityValue.innerHTML = humidity;
    // pressureValue.innerHTML = pressure;
    // conditionsValue.innerHTML = main;

    `<h1 class="location" id="title-location"></h1>
    <h2 class="date" id="title-date"></h2>
    <div class="weatherIcon">
      <div class="sunny">
        <div class="inner"></div>
      </div>
    </div>
    <p class="temp"></p>
    <p class="conditions">Sunny</p>
    <p class="tempRange">
      <span class="high"></span> | <span class="low"></span>
    </p>
    <p class="humidity">
      <span class="humidity-label">Humidity:</span>
      <span class="humidity-value"></span>
    </p>
    <p class="pressure">
      <span class="pressure-label">Pressure:</span>
      <span class="pressure-value"></span>
    </p>`;
  },
  renderFavPlacesWeather(favPlaces) {
    const container = document.getElementById("fav-weather-list");
    container.innerHTML = "";
    // this.weatherList = JSON.parse(localStorage.getItem("weathers")) || [];
    // const weatherListElement = document.getElementById("weather-list");
    // const favPlaces = await getWeatherForFavPlaces();
    console.log(favPlaces, "favPlaces");
    favPlaces.forEach((weather) => {
      let item = document.createElement("li");
      item.classList.add("weather-item");
      item.innerText = weather.name;

      container.appendChild(item);
    });
  },
  async getWeatherForFavPlaces(cb) {
    if (!this.favPlaces.length) return;

    const reqs = this.favPlaces.map((place) =>
      this.fetchWeather(place.city, place.country)
    );

    Promise.all(reqs)
      .then((res) => {
        return cb(res);
      })
      .catch((error) => {
        console.log("Error" + error);
      });
  },
  addFavPlace(place) {
    if (this.favPlaces.length === 10) return;

    this.favPlaces.push(place);
    localStorage.setItem("favPlaces", JSON.stringify(this.favPlaces));
  },
  removeFavPlace(place) {
    if (!this.favPlaces.length) return;

    this.favPlaces.push(place);
    localStorage.setItem("favPlaces", JSON.stringify(this.favPlaces));
  },
  addWeatherToList(data) {
    this.weatherList.push(data);
    localStorage.setItem("weathers", JSON.stringify(this.weatherList));
  },
  getCurrentTime: () => {
    const date = new Date();
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    let day = date.getDate();
    let monthIndex = date.getMonth();
    let year = date.getFullYear();
    return (
      day +
      " " +
      monthNames[monthIndex] +
      " " +
      year +
      " | " +
      date.toLocaleTimeString()
    );
  },
  async fetchWeather(city, country) {
    const weather = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${API_KEY}&units=metric`
    );
    return weather.json();
  },
  async fetchWeatherDataFromUser() {
    const city = document.getElementById("city-input").value;
    const country = document.getElementById("country-input").value;
    console.log(city, country);

    this.addFavPlace({ city, country, id: uuidv4() });

    const weather = await this.fetchWeather(city, country);
    const data = await weather.json();
    console.log(data);
    if (data.cod === 200) {
      this.displayData(data);
      this.addWeatherToList(data);
      this.addressValue.innerHTML = city + ", " + country;
    } else {
      alert("City not found");
    }
  },
  displayData(data) {
    // change image and backgroundColor depends on current weather
    const { humidity, pressure, temp, temp_max, temp_min } = data.main;
    const { main, icon } = data.weather[0];
    const {
      tempValue,
      temp_maxValue,
      temp_minValue,
      humidityValue,
      pressureValue,
      conditionsValue,
    } = _viewModel;

    tempValue.innerHTML = temp;
    temp_maxValue.innerHTML = temp_max;
    temp_minValue.innerHTML = temp_min;
    humidityValue.innerHTML = humidity;
    pressureValue.innerHTML = pressure;
    conditionsValue.innerHTML = main;

    document.body.style.backgroundColor = this.getChangeBackground(main);
    document.querySelector(".inner").innerHTML = "";
    let weatherImg = document.createElement("img");
    weatherImg.setAttribute(
      "src",
      "http://openweathermap.org/img/wn/" + icon + "@2x.png"
    );
    document.querySelector(".inner").appendChild(weatherImg);
  },
  getChangeBackground(value = "Clouds") {
    // returns backgroundColor depends on current weather
    return weatherBackground[value];
  },
};

const weatherBackground = {
  Thunderstorm: "#000000",
  Rain: "#3C424C",
  Snow: "#EDEFF3",
  Clouds: "#979999",
  Clear: "#86B9E0",
  Fog: "#B8B8B8",
  Drizzle: "#B8B8B8",
};
