// Weather Haiku Generator
(function() {
    const cityInput = document.getElementById('city');
    const searchBtn = document.getElementById('search-btn');
    const locationBtn = document.getElementById('location-btn');
    const weatherDisplay = document.getElementById('weather-display');
    const statusEl = document.getElementById('status');
    const errorEl = document.getElementById('error');

    const weatherIcon = document.getElementById('weather-icon');
    const line1 = document.getElementById('line1');
    const line2 = document.getElementById('line2');
    const line3 = document.getElementById('line3');
    const locationName = document.getElementById('location-name');
    const temperatureEl = document.getElementById('temperature');
    const conditionEl = document.getElementById('condition');
    const windEl = document.getElementById('wind');

    // Weather code to description and icon
    const weatherCodes = {
        0: { desc: 'Clear sky', icon: '☀️', mood: 'clear' },
        1: { desc: 'Mainly clear', icon: '🌤️', mood: 'clear' },
        2: { desc: 'Partly cloudy', icon: '⛅', mood: 'cloudy' },
        3: { desc: 'Overcast', icon: '☁️', mood: 'cloudy' },
        45: { desc: 'Foggy', icon: '🌫️', mood: 'fog' },
        48: { desc: 'Depositing rime fog', icon: '🌫️', mood: 'fog' },
        51: { desc: 'Light drizzle', icon: '🌧️', mood: 'rain' },
        53: { desc: 'Moderate drizzle', icon: '🌧️', mood: 'rain' },
        55: { desc: 'Dense drizzle', icon: '🌧️', mood: 'rain' },
        61: { desc: 'Slight rain', icon: '🌧️', mood: 'rain' },
        63: { desc: 'Moderate rain', icon: '🌧️', mood: 'rain' },
        65: { desc: 'Heavy rain', icon: '🌧️', mood: 'rain' },
        71: { desc: 'Slight snow', icon: '🌨️', mood: 'snow' },
        73: { desc: 'Moderate snow', icon: '🌨️', mood: 'snow' },
        75: { desc: 'Heavy snow', icon: '❄️', mood: 'snow' },
        77: { desc: 'Snow grains', icon: '🌨️', mood: 'snow' },
        80: { desc: 'Slight rain showers', icon: '🌦️', mood: 'rain' },
        81: { desc: 'Moderate rain showers', icon: '🌦️', mood: 'rain' },
        82: { desc: 'Violent rain showers', icon: '⛈️', mood: 'storm' },
        85: { desc: 'Slight snow showers', icon: '🌨️', mood: 'snow' },
        86: { desc: 'Heavy snow showers', icon: '🌨️', mood: 'snow' },
        95: { desc: 'Thunderstorm', icon: '⛈️', mood: 'storm' },
        96: { desc: 'Thunderstorm with hail', icon: '⛈️', mood: 'storm' },
        99: { desc: 'Thunderstorm with heavy hail', icon: '⛈️', mood: 'storm' }
    };

    // Haiku templates by mood
    const haikus = {
        clear: [
            ['Blue sky stretches wide', 'Sunlight warms the earth below', 'Shadows dance and play'],
            ['Cloudless dome above', 'The sun traces its slow arc', 'Day unfolds in peace'],
            ['Crystal air so clear', 'Horizons sharp and defined', 'Light finds every crack']
        ],
        cloudy: [
            ['Gray blanket above', 'The world wrapped in soft cotton', 'Quiet contemplation'],
            ['Clouds drift overhead', 'Shapes forming and dissolving', 'Stories in the sky'],
            ['Overcast today', 'The light diffused and gentle', 'Colors softly glow']
        ],
        rain: [
            ['Raindrops tap the glass', 'A rhythm old as the earth', 'The garden drinks deep'],
            ['Wet streets mirror lights', 'Umbrellas bloom like flowers', 'The world washed anew'],
            ['Steady rain falling', 'Each drop a small universe', 'The ground welcomes all']
        ],
        snow: [
            ['White silence descends', 'Each flake unique and perfect', 'The world holds its breath'],
            ['Snow blankets the land', 'Footprints mark paths through the white', 'Winter speaks softly'],
            ['Crystalline and cold', 'The air bites with frozen teeth', 'Beauty in stillness']
        ],
        fog: [
            ['Mist shrouds everything', 'Familiar made mysterious', 'Boundaries dissolve'],
            ['Gray ghosts drift slowly', 'The world reduced to whispers', 'Near becomes distant'],
            ['Fog swallows the light', 'Sound travels strange distances', 'I walk through a dream']
        ],
        storm: [
            ['Thunder rolls above', 'Lightning cracks the darkened sky', 'Nature shows its force'],
            ['The storm gathers strength', 'Wind howls its ancient warning', 'We shelter within'],
            ['Electric air crackles', 'Rain drives horizontal', 'Power and fury']
        ],
        hot: [
            ['Heat shimmers and waves', 'The air thick and slow to move', 'Seeking shade and cool'],
            ['Summer sun blazes', 'Pavement radiates its warmth', 'Ice melts in the glass']
        ],
        cold: [
            ['Bitter cold bites deep', 'Breath hangs visible and still', 'Bundle up and wait'],
            ['Frost paints the windows', 'The world crisp and crystalline', 'Warmth found within walls']
        ]
    };

    function getHaiku(mood, temp) {
        let effectiveMood = mood;

        // Temperature can override mood
        if (temp > 30) effectiveMood = 'hot';
        else if (temp < -5) effectiveMood = 'cold';

        const options = haikus[effectiveMood] || haikus.clear;
        return options[Math.floor(Math.random() * options.length)];
    }

    const FETCH_TIMEOUT = 10000; // 10 seconds

    async function fetchWithTimeout(url, timeout = FETCH_TIMEOUT) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Request failed (${response.status})`);
            }

            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Request timed out. Please try again.');
            }
            throw error;
        }
    }

    async function geocodeCity(city) {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
        const response = await fetchWithTimeout(url);
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            throw new Error('City not found');
        }

        return {
            lat: data.results[0].latitude,
            lon: data.results[0].longitude,
            name: data.results[0].name,
            country: data.results[0].country
        };
    }

    async function fetchWeather(lat, lon) {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m`;
        const response = await fetchWithTimeout(url);
        return await response.json();
    }

    function showError(message) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
        statusEl.style.display = 'none';
        weatherDisplay.style.display = 'none';
    }

    function showLoading() {
        statusEl.style.display = 'block';
        errorEl.style.display = 'none';
        weatherDisplay.style.display = 'none';
    }

    async function displayWeather(lat, lon, displayName) {
        showLoading();

        try {
            const weather = await fetchWeather(lat, lon);
            const current = weather.current;
            const code = current.weather_code;
            const temp = current.temperature_2m;
            const wind = current.wind_speed_10m;

            const weatherInfo = weatherCodes[code] || { desc: 'Unknown', icon: '🌡️', mood: 'clear' };
            const haiku = getHaiku(weatherInfo.mood, temp);

            // Update display
            weatherIcon.textContent = weatherInfo.icon;
            line1.textContent = haiku[0];
            line2.textContent = haiku[1];
            line3.textContent = haiku[2];

            locationName.textContent = displayName;
            temperatureEl.textContent = `${temp}°C`;
            conditionEl.textContent = weatherInfo.desc;
            windEl.textContent = `${wind} km/h`;

            statusEl.style.display = 'none';
            errorEl.style.display = 'none';
            weatherDisplay.style.display = 'block';

        } catch (error) {
            showError('Error fetching weather data: ' + error.message);
        }
    }

    async function searchCity() {
        const city = cityInput.value.trim();
        if (!city) {
            showError('Please enter a city name');
            return;
        }

        showLoading();

        try {
            const geo = await geocodeCity(city);
            const displayName = geo.country ? `${geo.name}, ${geo.country}` : geo.name;
            await displayWeather(geo.lat, geo.lon, displayName);
        } catch (error) {
            showError(error.message);
        }
    }

    function useGeolocation() {
        if (!navigator.geolocation) {
            showError('Geolocation is not supported by your browser');
            return;
        }

        showLoading();

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                await displayWeather(lat, lon, `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`);
            },
            (error) => {
                showError('Unable to get your location: ' + error.message);
            }
        );
    }

    // Event listeners
    searchBtn.addEventListener('click', searchCity);
    locationBtn.addEventListener('click', useGeolocation);

    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchCity();
        }
    });
})();
