import './css/styles.css';
import './css/iconstyles.css';
import './css/addtional.css';

document.addEventListener('DOMContentLoaded', () => {
    const searchField = document.querySelector('#searchField');
    const butt = document.querySelector('.butt');
    const img = document.querySelector('img');
    const temp = document.querySelector('.temp');
    const cond = document.querySelector('.cond');
    const minTemp = document.querySelector('.min');
    const maxTemp = document.querySelector('.max');
    const feels = document.querySelector('.feels');
    const rain = document.querySelector('.rainIcon');
    const wind = document.querySelector('.windIcon');
    const rise = document.querySelector('.riseIcon');
    const set = document.querySelector('.setIcon');
    const uv = document.querySelector('.uvIcon');
    const pressure = document.querySelector('.pressureIcon');
    const humidity = document.querySelector('.humidityIcon');
    const gust = document.querySelector('.gustIcon');
    const hourlyCards = document.querySelectorAll('.hourlycard');
    const tempToggle = document.querySelector('#tempToggle');
    const suggestionsList = document.querySelector('#suggestions');

    let isCelsius = true;
    let currentWeatherData = null;
    let currentForecastData = null;
    let currentHourlyData = null;

    searchField.addEventListener('input', handleInput);
    butt.addEventListener('click', handleSearchClick);
    tempToggle.addEventListener('click', toggleTemperatureUnit);

    async function handleInput(event) {
        const query = event.target.value;
        if (query.length < 2) {
            suggestionsList.innerHTML = '';
            return;
        }
        const suggestions = await fetchCitySuggestions(query);
        displaySuggestions(suggestions);
    }

    async function fetchCitySuggestions(query) {
        const response = await fetch(`https://api.weatherapi.com/v1/search.json?key=d5240453a3674fb9819110327242006&q=${query}`);
        if (!response.ok) throw new Error('Failed to fetch city suggestions');
        const data = await response.json();
        return data;
    }

    function displaySuggestions(suggestions) {
        suggestionsList.innerHTML = '';
        suggestions.forEach(suggestion => {
            const li = document.createElement('li');
            li.textContent = `${suggestion.name}, ${suggestion.country}`;
            li.addEventListener('click', () => {
                searchField.value = suggestion.name+","+suggestion.country;
                suggestionsList.innerHTML = '';
                handleSearchClick(); 
            });
            suggestionsList.appendChild(li);
        });
    }

    async function handleSearchClick() {
        try {
            const weatherData = await fetchWeatherData(searchField.value);
            const forecastData = await fetchForecastData(searchField.value);
            const hourlyData = forecastData.forecast.forecastday[0].hour;

            currentWeatherData = weatherData;
            currentForecastData = forecastData;
            currentHourlyData = hourlyData;

            updateWeatherUI(weatherData, forecastData, hourlyData);
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('The information is not available! Try again with a nearby city.');
        }
    }

    async function fetchWeatherData(location) {
        const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=d5240453a3674fb9819110327242006&q=${location}`);
        if (!response.ok) throw new Error('Failed to fetch current weather data');
        return response.json();
    }

    async function fetchForecastData(location) {
        const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=d5240453a3674fb9819110327242006&q=${location}`);
        if (!response.ok) throw new Error('Failed to fetch forecast data');
        return response.json();
    }

    function updateWeatherUI(weatherData, forecastData, hourlyData) {
        img.src = weatherData.current.condition.icon;
        updateTemperature(temp, weatherData.current.temp_c);
        cond.textContent = weatherData.current.condition.text;
        updateTemperature(minTemp, forecastData.forecast.forecastday[0].day.mintemp_c);
        updateTemperature(maxTemp, forecastData.forecast.forecastday[0].day.maxtemp_c);
        updateTemperature(feels, weatherData.current.feelslike_c);
        rain.textContent = `${forecastData.forecast.forecastday[0].day.daily_chance_of_rain}%`;
        wind.textContent = `${weatherData.current.wind_kph} km/h`;
        rise.textContent = forecastData.forecast.forecastday[0].astro.sunrise;
        set.textContent = forecastData.forecast.forecastday[0].astro.sunset;
        uv.textContent = forecastData.current.uv;
        pressure.textContent = `${weatherData.current.pressure_mb} mb`;
        humidity.textContent = `${forecastData.current.humidity}%`;
        gust.textContent = `${weatherData.current.gust_kph} kph`;

        updateHourlyCards(hourlyData);
    }

    function updateTemperature(element, tempCelsius) {
        if (isCelsius) {
            element.textContent = `${tempCelsius}°C`;
        } else {
            const tempFahrenheit = (tempCelsius * 9 / 5) + 32;
            element.textContent = `${tempFahrenheit.toFixed(1)}°F`;
        }
    }

    function updateHourlyCards(hourlyData) {
        const now = new Date();
        const currentHour = now.getHours();

        hourlyCards.forEach((card, i) => {
            const hourIndex = (currentHour + i + 1) % 24;
            const hourData = hourlyData[hourIndex];

            const time = new Date(hourData.time).getHours();
            const iconHour = hourData.condition.icon;
            const tempHour = hourData.temp_c;

            const hourElement = document.createElement('div');
            hourElement.className = 'hour';
            hourElement.textContent = `${time}:00`;

            const iconElement = document.createElement('img');
            iconElement.src = iconHour;
            iconElement.alt = 'Weather icon';

            const tempElement = document.createElement('div');
            tempElement.className = 'temp';
            tempElement.textContent = isCelsius ? `${tempHour}°C` : `${((tempHour * 9 / 5) + 32).toFixed(1)}°F`;

            card.innerHTML = '';
            card.appendChild(hourElement);
            card.appendChild(iconElement);
        });
    }

    function toggleTemperatureUnit() {
        isCelsius = !isCelsius;
        tempToggle.textContent = isCelsius ? '°F' : '°C';
        updateWeatherUI(currentWeatherData, currentForecastData, currentHourlyData);
    }

    handleSearchClick(); // Initialize with default city or user's last searched location
});
