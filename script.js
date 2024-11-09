const apiKey = "272d20ea2b55d08f7117d9d204d34f9d";  

// Save city to localStorage
function saveCityToLocalStorage(city) {
  const history = JSON.parse(localStorage.getItem("searchHistory")) || [];

  if (!history.includes(city)) {
    history.push(city);
    localStorage.setItem("searchHistory", JSON.stringify(history));
  }
}

// Load search history from localStorage
function loadSearchHistory() {
  const historyContainer = document.getElementById("history");
  const history = JSON.parse(localStorage.getItem("searchHistory")) || [];

  if (history.length === 0) {
    historyContainer.innerHTML = "<p>No search history available.</p>";
    return;
  }

  historyContainer.innerHTML = "<h2>Search History</h2>";
  history.forEach(city => {
    const button = document.createElement("button");
    button.classList.add("history-btn");
    button.textContent = city;
    button.addEventListener("click", () => {
      fetchWeatherData(city); // Fetch weather for that city
    });
    historyContainer.appendChild(button);
  });
}

// Fetches coordinates for the city
async function getCityCoordinates(city) {
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.length > 0) {
      return { lat: data[0].lat, lon: data[0].lon };
    } else {
      alert("City not found. Please try a different city name.");
    }
  } catch (error) {
    console.error("Error fetching city coordinates:", error);
    alert("An error occurred while fetching the city coordinates.");
  }
}

// Fetches current weather data
async function getCurrentWeather(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching current weather:", error);
    alert("An error occurred while fetching the current weather data.");
  }
}

// Fetches 5-day weather forecast data
async function getWeatherForecast(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.list.filter((_, index) => index % 8 === 0); // Every 8th item for daily forecast
  } catch (error) {
    console.error("Error fetching weather forecast:", error);
    alert("An error occurred while fetching the 5-day forecast data.");
  }
}

// Displays current weather on the page
function displayCurrentWeather(data) {
  const weatherDisplay = document.getElementById("current-weather");
  weatherDisplay.innerHTML = ` 
    <h2>${data.name}</h2>
    <p>Date: ${new Date().toLocaleDateString()}</p>
    <p>Temperature: ${data.main.temp} °C</p>
    <p>Humidity: ${data.main.humidity}%</p>
    <p>Wind Speed: ${data.wind.speed} m/s</p>
    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}" />
  `;
}

// Displays 5-day forecast on the page
function displayWeatherForecast(forecastData) {
  const forecastDisplay = document.getElementById("forecast");
  forecastDisplay.innerHTML = forecastData.map(day => `
    <div class="forecast-item">
      <p>${new Date(day.dt * 1000).toLocaleDateString()}</p>
      <p>Temp: ${day.main.temp} °C</p>
      <p>Wind: ${day.wind.speed} m/s</p>
      <p>Humidity: ${day.main.humidity}%</p>
      <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="${day.weather[0].description}" />
    </div>
  `).join('');
}

// Fetch weather data based on the city
async function fetchWeatherData(city) {
  const coordinates = await getCityCoordinates(city);
  if (coordinates) {
    const currentWeather = await getCurrentWeather(coordinates.lat, coordinates.lon);
    const forecast = await getWeatherForecast(coordinates.lat, coordinates.lon);
    if (currentWeather && forecast) {
      displayCurrentWeather(currentWeather);
      displayWeatherForecast(forecast);
      saveCityToLocalStorage(city);  // Save city to history
      loadSearchHistory();  // Reload search history
    }
  }
}

// Event listener for the search button
document.getElementById("search-btn").addEventListener("click", () => {
  const city = document.getElementById("city-input").value.trim();
  if (city) fetchWeatherData(city);
  else alert("Please enter a city name.");
});

// Load search history on page load
window.onload = loadSearchHistory;
