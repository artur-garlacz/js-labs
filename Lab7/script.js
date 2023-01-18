//LAB 7
const API_KEY = "d7818ca22a941ac71e9f35b02762b407";
// const GOOGLE_API_KEY = "AIzaSyDw6cRMC4psyblPXZ5P6eA9vF17oZ_qVXI";

document.addEventListener("DOMContentLoaded", () => {
  _viewModel.setView();
});

// AIzaSyDw6cRMC4psyblPXZ5P6eA9vF17oZ_qVXI;

const uuidv4 = () => {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
};

const _viewModel = {
  input: document.getElementById("city-input"),
  favPlaces: JSON.parse(localStorage.getItem("favPlaces")) || [],
  historicalWeathers: localStorage.getItem("favPlaces") || [],
  refFetchInterval: null,
  setView() {
    document
      .querySelector(".form-search-btn")
      .addEventListener("click", () => this.fetchWeatherDataFromUser());

    const options = {
      types: ["(cities)"],
    };

    const input = document.getElementById("search-input");
    new google.maps.places.Autocomplete(input, options);

    this.renderFavPlaces();
    this.setReFetchInterval();
  },
  setReFetchInterval() {
    this.refFetchInterval = setInterval(() => {
      console.log("Interval", new Date());
      this.renderFavPlaces();
    }, 3600000);
  },
  renderFavPlaces() {
    this.getWeatherForFavPlaces((favPlaces) =>
      this.createFavPlacesWeather(favPlaces)
    );
  },
  createWeatherCard(weather, place, isFav = true) {
    const { humidity, pressure, temp, temp_max, temp_min } = weather.main;
    const { main, icon } = weather.weather[0];

    const item = document.createElement("li");
    item.classList.add(isFav ? "fav-weather-item" : "current-weather");
    item.style.backgroundColor = this.getChangeBackground(main);

    const content = document.createElement("div");
    content.innerHTML = `<h1>${weather.name}</h1>
    <h2 class="date" id="title-date"></h2>
    <div class="weatherIcon">
      <div class="sunny">
        <div class="inner">
          <img src=${"http://openweathermap.org/img/wn/" + icon + "@2x.png"} />
        </div>
      </div>
    </div>
    <p class="temp"><strong>${temp}</strong></p>
    <p class="conditions">${main}</p>
    <p class="tempRange m-0">
      <span class="high">${temp_max}</span> | <span class="low">${temp_min}</span>
    </p>
    <p class="humidity m-0">
      <span class="humidity-label">Humidity:</span>
      <span class="humidity-value">${humidity}</span>
    </p>
    <p class="pressure">
      <span class="pressure-label">Pressure:</span>
      <span class="pressure-value">${pressure}</span>
    </p>`;

    if (isFav) {
      const deleteBtn = document.createElement("i");
      deleteBtn.className = "remove-btn fa fa-trash";
      deleteBtn.onclick = () => this.removeFavPlace(place.id);
      content.appendChild(deleteBtn);
    } else {
      const addFavBtn = document.createElement("button");
      addFavBtn.innerText = "Add to favouites";

      const currPlaceIsFav = this.favPlaces.some(
        (fav) => fav.city === place.city && fav.country === place.country
      );

      addFavBtn.onclick = () => this.addFavPlace(place);
      !currPlaceIsFav && content.appendChild(addFavBtn);
    }

    const detailsBtn = document.createElement("button");
    detailsBtn.innerText = "Show details";
    detailsBtn.setAttribute("data-toggle", "modal");
    detailsBtn.setAttribute("data-target", "#editModal");
    detailsBtn.addEventListener("click", () => this.renderWeatherChart(place));

    content.appendChild(detailsBtn);
    item.appendChild(content);
    return item;
  },
  createFavPlacesWeather(favPlaces) {
    const container = document.getElementById("fav-weather-list");
    container.innerHTML = "";
    console.log(favPlaces);
    favPlaces.forEach((weather, idx) => {
      const item = this.createWeatherCard(weather, this.favPlaces[idx]);
      container.appendChild(item);
    });
  },
  async renderWeatherChart(place) {
    const data = await this.fetchForecastWeather(place.city, place.country);

    if (data.cod !== "200") return;

    weatherChart.createWeatherChart(data.list);
  },
  async getWeatherForFavPlaces(cb) {
    if (!this.favPlaces.length) return;

    const reqs = this.favPlaces.map((place) =>
      this.fetchWeather(place.city, place.country)
    );

    Promise.all(reqs)
      .then((res) => {
        const places = res.filter((r) => r.cod === 200);
        cb(places);
      })
      .catch((error) => {
        console.log("Error" + error);
      });
  },
  addFavPlace(place) {
    if (this.favPlaces.length === 10) return;

    this.favPlaces.push(place);
    localStorage.setItem("favPlaces", JSON.stringify(this.favPlaces));

    clearInterval(this.refFetchInterval);

    this.renderFavPlaces();
    this.setReFetchInterval();
  },
  removeFavPlace(placeId) {
    if (!this.favPlaces.length) return;

    const favPlaces = this.favPlaces.filter((place) => place.id !== placeId);
    this.favPlaces = favPlaces;
    localStorage.setItem("favPlaces", JSON.stringify(favPlaces));

    clearInterval(this.refFetchInterval);

    this.renderFavPlaces();
    this.setReFetchInterval();
  },
  addWeatherToList(data) {
    this.weatherList.push(data);
    localStorage.setItem("weathers", JSON.stringify(this.weatherList));
  },
  async fetchWeather(city, country) {
    const weather = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${API_KEY}&units=metric`
    );
    return weather.json();
  },
  async fetchForecastWeather(city, country) {
    const weather = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city},${country}&appid=${API_KEY}&units=metric`
    );
    return weather.json();
  },
  async fetchWeatherDataFromUser() {
    const search = document.getElementById("search-input").value;
    const searchedWeather = document.getElementById("searched-weather");

    if (!search) return;

    const placeName = search.split(", ");
    const city = placeName[0];
    const country = placeName.at(-1);
    console.log(city, country);

    const data = await this.fetchWeather(city, country);
    if (data.cod === 200) {
      searchedWeather.innerHTML = "";
      const place = {
        fullName: search,
        city,
        country: data.sys.country,
        id: uuidv4(),
      };
      searchedWeather.appendChild(this.createWeatherCard(data, place, false));
    } else {
      alert("City not found");
    }
  },
  getChangeBackground(value = "Clouds") {
    return weatherBackground[value];
  },
};

const weatherChart = {
  createWeatherChart(data) {
    const weatherChartElement = document
      .getElementById("weather-chart")
      .getContext("2d");

    const weathers = this.getPreparedData(data);
    console.log(weathers);
    const { min, max, main } = this.getGroupedTempData(weathers);

    const chart = new Chart(weatherChartElement, {
      type: "line",
      title: "ss",
      data: {
        labels: this.getDataLabels(weathers),
        datasets: [
          {
            label: "Min temp.",
            data: min,
            borderWidth: 1,
          },
          {
            label: "Main temp.",
            data: main,
            borderWidth: 1,
          },
          {
            label: "Max temp.",
            data: max,
            borderWidth: 1,
          },
        ],
      },
    });

    document.getElementById("close-modal").onclick = () => chart.destroy();
  },
  getGroupedTempData(data) {
    const groupedData = data.reduce(
      (prev, curr) => {
        const { temp_min, temp_max, temp } = curr.main;
        console.log(prev);
        return {
          min: [...prev.min, temp_min],
          max: [...prev.max, temp_max],
          main: [...prev.main, temp],
        };
      },
      { min: [], max: [], main: [] }
    );
    console.log(groupedData);
    return groupedData;
  },
  getPreparedData(data) {
    const preparedData = data.filter((_, idx) => idx % 8 === 0);
    return preparedData;
  },
  getDataLabels(data) {
    const labels = data.map((weather) =>
      new Date(weather.dt * 1000).toDateString()
    );
    return labels;
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
  Mist: "#CDD8D9",
};
