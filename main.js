const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherCard = document.getElementById('weather-card');
const weatherInfo = document.getElementById('weather-info');
const placeholderContent = document.querySelector('.placeholder-content');
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('error-message');

const temperatureEl = document.getElementById('temperature');
const cityDisplayEl = document.getElementById('display-city-name');
const descriptionEl = document.getElementById('weather-description');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('wind-speed');
const iconContainer = document.getElementById('weather-icon-container');

// Weather interpretation codes from Open-Meteo
const weatherCodes = {
    0: { desc: 'Clear sky', icon: '☀️' },
    1: { desc: 'Mainly clear', icon: '🌤️' },
    2: { desc: 'Partly cloudy', icon: '⛅' },
    3: { desc: 'Overcast', icon: '☁️' },
    45: { desc: 'Fog', icon: '🌫️' },
    48: { desc: 'Depositing rime fog', icon: '🌫️' },
    51: { desc: 'Light drizzle', icon: '🌦️' },
    53: { desc: 'Moderate drizzle', icon: '🌦️' },
    55: { desc: 'Dense drizzle', icon: '🌦️' },
    61: { desc: 'Slight rain', icon: '🌧️' },
    63: { desc: 'Moderate rain', icon: '🌧️' },
    65: { desc: 'Heavy rain', icon: '🌧️' },
    71: { desc: 'Slight snow fall', icon: '❄️' },
    73: { desc: 'Moderate snow fall', icon: '❄️' },
    75: { desc: 'Heavy snow fall', icon: '❄️' },
    95: { desc: 'Thunderstorm', icon: '⛈️' },
};

async function getCoordinates(city) {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const response = await fetch(geoUrl);
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
        throw new Error('City not found');
    }
    
    return data.results[0];
}

async function getWeather(lat, lon) {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;
    const response = await fetch(weatherUrl);
    if (!response.ok) throw new Error('Weather data unavailable');
    return await response.json();
}

function updateUI(weatherData, cityData) {
    const current = weatherData.current;
    const code = current.weather_code;
    const weatherInfoObj = weatherCodes[code] || { desc: 'Weather', icon: '🌡️' };

    temperatureEl.textContent = Math.round(current.temperature_2m);
    cityDisplayEl.textContent = `${cityData.name}, ${cityData.country_code.toUpperCase()}`;
    descriptionEl.textContent = weatherInfoObj.desc;
    humidityEl.textContent = `${current.relative_humidity_2m}%`;
    windSpeedEl.textContent = `${current.wind_speed_10m} km/h`;
    
    iconContainer.innerHTML = `<span style="font-size: 5rem; display: block; margin-bottom: 10px;">${weatherInfoObj.icon}</span>`;

    weatherInfo.classList.remove('hidden');
    placeholderContent.classList.add('hidden');
    loader.classList.add('hidden');
    errorMessage.classList.add('hidden');
}

async function handleSearch() {
    const city = cityInput.value.trim();
    if (!city) return;

    // Reset UI
    weatherInfo.classList.add('hidden');
    placeholderContent.classList.add('hidden');
    errorMessage.classList.add('hidden');
    loader.classList.remove('hidden');

    try {
        const cityData = await getCoordinates(city);
        const weatherData = await getWeather(cityData.latitude, cityData.longitude);
        updateUI(weatherData, cityData);
    } catch (error) {
        console.error(error);
        loader.classList.add('hidden');
        errorMessage.classList.remove('hidden');
        errorMessage.querySelector('p').textContent = error.message === 'City not found' 
            ? 'City not found. Please try another search.' 
            : 'Unable to fetch weather data. Check your connection.';
    }
}

searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});
