//LAB 7
const API_KEY = "d7818ca22a941ac71e9f35b02762b407"; //

document.addEventListener("DOMContentLoaded", () => {
  _viewModel.setView();
});

const _viewModel = {
  addressValue: document.getElementById("title-location"),
  tempValue: document.querySelector(".temp"),
  temp_maxValue: document.querySelector(".high"),
  temp_minValue: document.querySelector(".low"),
  humidityValue: document.querySelector(".humidity-value"),
  pressureValue: document.querySelector(".pressure-value"),
  conditionsValue: document.querySelector(".conditions"),
  currentPosition: null,
  weatherList: [],
  setView() {
    let titleDate = document.getElementById("title-date");
    titleDate.innerHTML = this.getCurrentTime();
    document
      .querySelector(".form-search-btn")
      .addEventListener("click", () => this.fetchWeatherDataFromUser());

    this.loadWeatherList();
  },
  loadWeatherList() {
    this.weatherList = JSON.parse(localStorage.getItem("weathers")) || [];
    const weatherListElement = document.getElementById("weather-list");

    this.weatherList.forEach((weather) => {
      let item = document.createElement("li");
      item.classList.add("weather-item");
      item.innerText = weather.name;
      weatherListElement.appendChild(item);
    });
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
  async fetchWeatherDataFromUser() {
    let city = document.getElementById("city-input").value;
    let country = document.getElementById("country-input").value;
    console.log(city, country);
    let api_call_by_user = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${API_KEY}&units=metric`
    );
    let data = await api_call_by_user.json();
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
    console.log(data);
    document.body.style.backgroundColor = _viewModel.getChangeBackground(main);
    document.querySelector(".inner").innerHTML = "";
    let weatherImg = document.createElement("img");
    weatherImg.setAttribute(
      "src",
      "http://openweathermap.org/img/wn/" + icon + "@2x.png"
    );
    document.querySelector(".inner").appendChild(weatherImg);
  },
  getChangeBackground(value) {
    // returns backgroundColor depends on current weather
    switch (value) {
      case "Thunderstorm":
        return (backgroundColor = "#000000");
      case "Rain":
        return (backgroundColor = "#3C424C");
      case "Snow":
        return (backgroundColor = "#EDEFF3");
      case "Clouds":
        return (backgroundColor = "#979999");
      case "Clear":
        return (backgroundColor = "#86B9E0");
      case "Fog":
        return (backgroundColor = "#B8B8B8");
      case "Drizzle":
        return (backgroundColor = "#B8B8B8");
    }
  },
};
