import { useState, useEffect } from "react";
import Sunny from './WeatherStatus/Sunny.png'
import SunnyCloud from './WeatherStatus/Sunny w_ Cloudiness.png'
import SunnyRain from './WeatherStatus/Sunny w_ Rain.png'
import Cloudy from './WeatherStatus/Cloudy.png'
import Rainy from './WeatherStatus/Rainy.png'
import Thunder from './WeatherStatus/Thunder.png'
import ThunderStorm from './WeatherStatus/Thunderstorm.png'
import {useAuth} from '../../../../../contexts/AuthContext.jsx'
import styles from './Status.module.css'

export default function Status({ onWeatherUpdate }) {
    const [weatherImage, setWeatherImage] = useState(Cloudy);
    const [weather, setWeather] = useState("Cloudy");
    const [showWeatherDescription, setWeatherDescription] = useState(false);
    const {getToken} = useAuth();

    const CACHE_DURATION = 60 * 60 * 2.5 * 1000; // 2.5 hours

    const weatherImages = {
        "SUNNY": Sunny,
        "SUNNY_CLOUDS": SunnyCloud,
        "CLOUDY": Cloudy,
        "SUNNY_RAIN": SunnyRain,
        "RAINY": Rainy,
        "THUNDER": Thunder,
        "THUNDERSTORM": ThunderStorm,
    };

    const updateWeather = (condition, code) => {
        setWeather(condition);
        setWeatherImage(weatherImages[code]);
        // Call the parent's callback function
        if (onWeatherUpdate) {
            onWeatherUpdate(condition);
        }
    };

    const getWeatherData = () => {
        const cached = localStorage.getItem("WeatherCache");

        if (cached) {
            const { weather: cachedWeather, timestamp } = JSON.parse(cached);
            const age = Date.now() - timestamp;

            if (age < CACHE_DURATION) {
                updateWeather(cachedWeather.condition, cachedWeather.code);
                return;
            }
        }

        if (!navigator.geolocation) {
            console.error("Geolocation not supported");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetchWeather(position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                console.error(error);
            }
        );
    };

    const fetchWeather = async (lat, lon) => {
        try {
            const token = await getToken();
            const response = await fetch(
                `https://flower-backend-latest-8vkl.onrender.com/api/weather/coordinates?lat=${lat}&lng=${lon}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            if (!response.ok)
                throw new Error("Weather fetch failed!");

            const weatherData = await response.json();

            const cacheData = {
                weather: weatherData,
                timestamp: Date.now(),
                coordinates: { lat, lon }
            };

            localStorage.setItem("WeatherCache", JSON.stringify(cacheData));
            updateWeather(weatherData.condition, weatherData.code);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        getWeatherData();
    }, []);

    return (
        <>
            <img src={weatherImage}
                 className={styles.weatherStatus}
                 alt="Weather status"
                 onMouseEnter={() => setWeatherDescription(true)}
                 onMouseLeave={() => setWeatherDescription(false)}
            />

            {showWeatherDescription && (
                <>
                    <div className={styles.triangle}>

                    </div>
                    <div className={styles.tooltip}>
                        {weather}
                    </div>
                </>
            )}
        </>
    )
}