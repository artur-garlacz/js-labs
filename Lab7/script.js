const API_KEY = "d7818ca22a941ac71e9f35b02762b407";

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

const _viewModel = {
  favPlaces: JSON.parse(localStorage.getItem("favPlaces")) || [],
  prevSearches: JSON.parse(localStorage.getItem("prevSearches")) || [],
  currWeather: null,
  refFetchInterval: null,
  setView() {
    document
      .querySelector(".form-search-btn")
      .addEventListener("click", () => this.fetchWeatherDataFromUser());

    let timeout;

    document.getElementById("search-input").addEventListener(
      "keyup",
      (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => this.assignSearchBox(e), 200);
      },
      300
    );

    window.addEventListener("click", ({ target }) => {
      const popup = target.closest("#search-box");
      const searchBox = document.getElementById("search-box");
      const clickedOutsidePopup =
        !popup && searchBox.classList.contains("active");

      if (clickedOutsidePopup) searchBox.classList.remove("active");
    });

    // favourite places
    this.renderFavPlaces();
    this.setReFetchInterval();

    // previous searches
    this.renderPrevSearchedWeathers();

    // default current weather from previous searches
    this.renderDefaultWeather();
  },
  setReFetchInterval() {
    this.refFetchInterval = setInterval(() => {
      console.log("Interval", new Date());
      this.renderFavPlaces();
    }, 3600000);
  },
  renderFavPlaces() {
    if (!this.favPlaces.length) {
      document.getElementById("fav-weather-list").innerHTML = "";
      return;
    }

    this.getWeatherForPlaces(
      (favPlaces) => this.createFavPlacesWeather(favPlaces),
      this.favPlaces
    );
  },
  createWeatherCard(weather, place, isFav = true) {
    const { humidity, pressure, temp, temp_max, temp_min } = weather.main;
    const { main, icon } = weather.weather[0];

    const item = document.createElement("li");
    item.classList.add(isFav ? "fav-weather-item" : "current-weather");
    item.style.backgroundColor = this.getChangeBackground(main);

    const content = document.createElement("div");
    content.innerHTML = `<h1 class="text-overflow">${weather.name}</h1>
    <h2 class="date" id="title-date"></h2>
    <div class="weatherIcon">
      <div class="sunny">
        <div class="inner">
          <img src=${"http://openweathermap.org/img/wn/" + icon + "@2x.png"} />
        </div>
      </div>
    </div>
    <p class="temp title"><strong>${temp}</strong></p>
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
      addFavBtn.className = "card-action-btn";
      addFavBtn.innerText = "Add to favouites";

      const currPlaceIsFav = this.favPlaces.some(
        (fav) => fav.city === place.city && fav.country === place.country
      );

      addFavBtn.onclick = () => this.addFavPlace(place);
      !currPlaceIsFav && content.appendChild(addFavBtn);
    }

    const detailsBtn = document.createElement("button");
    detailsBtn.innerText = "Show details";
    detailsBtn.className = "card-action-btn";
    detailsBtn.setAttribute("data-toggle", "modal");
    detailsBtn.setAttribute("data-target", "#editModal");
    detailsBtn.addEventListener("click", () => this.renderWeatherChart(place));

    content.appendChild(detailsBtn);
    item.appendChild(content);
    return item;
  },
  createFavPlacesWeather(favPlaces) {
    console.log("render", favPlaces);
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
  async getWeatherForPlaces(cb, places) {
    if (!places.length) return;

    const reqs = places.map((place) =>
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
    if (this.favPlaces.length === 10) {
      alert("You already have 10 favourite places");
      return;
    }

    const placeExists = this.favPlaces.some(
      (favPlace) => favPlace.id === place.id
    );

    if (placeExists) return;

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

      this.currWeather = data;

      this.addPlaceToPrevSearches(place);
      searchedWeather.appendChild(this.createWeatherCard(data, place, false));
    } else {
      alert("City not found");
    }
  },
  async renderDefaultWeather() {
    const searchedWeather = document.getElementById("searched-weather");

    const currPlace = this.prevSearches.at(-1);
    if (!currPlace) return;

    searchedWeather.innerHTML = "";
    const { city, country } = currPlace;

    const weather = await this.fetchWeather(city, country);

    searchedWeather.appendChild(
      this.createWeatherCard(weather, currPlace, false)
    );
  },
  addPlaceToPrevSearches(place) {
    const placeExists = this.prevSearches.some((prev) => prev.id === place.id);
    if (placeExists) return;

    this.prevSearches.push(place);
    localStorage.setItem("prevSearches", JSON.stringify(this.prevSearches));

    this.renderPrevSearchedWeathers();
  },
  renderPrevSearchedWeathers() {
    if (!this.prevSearches.length) {
      document.getElementById("prev-searches").innerHTML = "";
      return;
    }

    this.getWeatherForPlaces(
      (weathers) => this.createPrevSearchedWeathers(weathers),
      [...this.prevSearches].reverse()
    );
  },
  createPrevSearchedWeathers(weathers) {
    const container = document.getElementById("prev-searches");
    container.innerHTML = "";

    if (!weathers.length) return;

    weathers.forEach((weather) =>
      this.createPrevSearchedWeather(weather, container)
    );
  },
  createPrevSearchedWeather(weather, container) {
    const { humidity, pressure, temp, temp_max, temp_min } = weather.main;

    const item = document.createElement("li");
    item.innerHTML = `<p>${weather.name} | <span class="temp">${temp} </span></p>`;
    container.appendChild(item);
  },
  async assignSearchBox(e) {
    const { value } = e.target;

    const options = await this.fetchSearchOptions(value);

    this.renderSearchOptions(options);
  },
  async fetchSearchOptions(city) {
    const options = await fetch(
      `http://geodb-free-service.wirefreethought.com/v1/geo/cities?limit=5&offset=0&namePrefix=${city}`
    );
    return options.json();
  },
  async renderSearchOptions(options) {
    const searchBox = document.getElementById("search-box");
    searchBox.innerHTML = "";

    searchBox.classList.add("active");

    options.data.forEach((option) => {
      const li = document.createElement("li");
      li.innerText = option.city;
      li.className = "search-option";
      li.onclick = () =>
        (document.getElementById("search-input").value = option.city);
      searchBox.appendChild(li);
    });
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
  Snow: "#d2d3d6",
  Clouds: "#979999",
  Clear: "#86B9E0",
  Fog: "#B8B8B8",
  Drizzle: "#B8B8B8",
  Mist: "#CDD8D9",
  Smoke: "#747780",
};
