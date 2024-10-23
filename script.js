const apiKey = '8af3ed5c9a678617a1fde4087cd87e83';
const apiUrl = 'https://api.openweathermap.org/data/2.5';

const searchInput = document.getElementById('zipcode-input');
const searchBtn = document.getElementById('search-btn');
const currentWeatherDesc = document.getElementById('current-weather-desc');
const currentWeatherTemp = document.getElementById('current-weather-temp');
const forecastList = document.getElementById('forecast-list');
const darkModeToggle = document.getElementById('dark-mode-toggle');

searchBtn.addEventListener('click', searchWeather);
darkModeToggle.addEventListener('click', toggleDarkMode);

function searchWeather() {
    const zipcode = searchInput.value.trim();
    if (zipcode) {
        fetchApiData(zipcode);
    } else {
        showError('Please enter a valid zipcode or location.');
    }
}

function fetchApiData(location) {
    const url = `${apiUrl}/weather?${isNaN(location) ? `q=${location}` : `zip=${location}`}&units=imperial&appid=${apiKey}`;
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Weather data not found. Please check your input and try again.');
            }
            return response.json();
        })
        .then(data => {
            displayCurrentWeather(data);
            return fetchForecastData(data.coord);
        })
        .catch(error => showError(error.message));
}

function displayCurrentWeather(data) {
    const { weather, main } = data;
    currentWeatherDesc.textContent = weather[0].description;
    currentWeatherTemp.textContent = `Temp: ${main.temp}°F`;
}

function fetchForecastData(coord) {
    const url = `${apiUrl}/forecast?lat=${coord.lat}&lon=${coord.lon}&units=imperial&appid=${apiKey}`;
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Forecast data not found. Please try again later.');
            }
            return response.json();
        })
        .then(data => {
            const forecastListItems = data.list.slice(0, 3).map(item => `
                <li>
                    <h3>${item.dt_txt}</h3>
                    <p>Description: ${item.weather[0].description}</p>
                    <p>Temp: ${item.main.temp}°F</p>
                </li>
            `);
            forecastList.innerHTML = forecastListItems.join('');
        });
}

function showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    document.body.appendChild(errorElement);
    setTimeout(() => errorElement.remove(), 5000);
}

function setDarkMode(isDark) {
    if (isDark) {
        document.documentElement.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'true');
        darkModeToggle.textContent = 'Light Mode';
    } else {
        document.documentElement.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'false');
        darkModeToggle.textContent = 'Dark Mode';
    }
}

function toggleDarkMode() {
    setDarkMode(!document.documentElement.classList.contains('dark-mode'));
}

function checkSystemDarkMode() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setDarkMode(true);
    }
}

// Check user preference on page load
if (localStorage.getItem('darkMode') === 'true') {
    setDarkMode(true);
} else if (localStorage.getItem('darkMode') === null) {
    checkSystemDarkMode();
}

// Get user location on page load
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            fetchApiData(`${latitude},${longitude}`);
        },
        error => {
            console.error("Error getting user location:", error);
            showError("Unable to get your location. Please enter a zipcode manually.");
        }
    );
} else {
    showError("Geolocation is not supported by your browser. Please enter a zipcode manually.");
}

// Listen for system dark mode changes
window.matchMedia('(prefers-color-scheme: dark)').addListener((e) => {
    if (localStorage.getItem('darkMode') === null) {
        setDarkMode(e.matches);
    }
});
