// noinspection SpellCheckingInspection

const apiKey = '8af3ed5c9a678617a1fde4087cd87e83';

const apiUrl = 'https://api.openweathermap.org/data/2.5';

const searchInput = document.getElementById('zipcode-input');
const searchBtn = document.getElementById('search-btn');
const currentWeatherDesc = document.getElementById('current-weather-desc');
const currentWeatherTemp = document.getElementById('current-weather-temp');
const forecastList = document.getElementById('forecast-list');

searchBtn.addEventListener('click', searchWeather);

function searchWeather() {
    const zipcode = searchInput.value.trim();
    if (zipcode) {
        fetchApiData(zipcode);
    }
}

function fetchApiData(zipcode) {
    const url = `${apiUrl}/weather?zip=${zipcode}&units=imperial&appid=${apiKey}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayCurrentWeather(data);
            fetchForecastData(data.coord);
        })
        .catch(error => console.error(error));
}

function displayCurrentWeather(data) {
    const { weather, main } = data;
    currentWeatherDesc.textContent = weather[0].description;
    currentWeatherTemp.textContent = `Temp: ${main.temp}°F`;
}

function fetchForecastData(coord) {
    const url = `${apiUrl}/forecast?lat=${coord.lat}&lon=${coord.lon}&units=imperial&appid=${apiKey}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const forecastListItems = [];
            for (let i = 0; i < 3; i++) {
                const forecastItem = `
                    <li>
                        <h3>${data.list[i].dt_txt}</h3>
                        <p>Description: ${data.list[i].weather[0].description}</p>
                        <p>Temp: ${data.list[i].main.temp}°F</p>
                    </li>
                `;
                forecastListItems.push(forecastItem);
            }
            forecastList.innerHTML = forecastListItems.join('');
        })
        .catch(error => console.error(error));
}

// Get user location on page load
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        fetchApiData(`${latitude},${longitude}`);
    });
}
