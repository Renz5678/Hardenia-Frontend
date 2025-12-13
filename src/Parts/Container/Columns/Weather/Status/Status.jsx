import { useState, useEffect } from "react";
import Sunny from './WeatherStatus/Sunny.png'
import SunnyCloud from './WeatherStatus/Sunny w_ Cloudiness.png'
import SunnyRain from './WeatherStatus/Sunny w_ Rain.png'
import Cloudy from './WeatherStatus/Cloudy.png'
import Rainy from './WeatherStatus/Rainy.png'
import Thunder from './WeatherStatus/Thunder.png'
import ThunderStorm from './WeatherStatus/Thunderstorm.png'

import styles from './Status.module.css'

export default function Status() {
    const [weatherImage, setWeatherImage] = useState(Cloudy);
    const [weather, setWeather] = useState("Cloudy");
    const [showWeatherDescription, setWeatherDescription] = useState(false);

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

    const getWeatherData = () => {
        const cached = localStorage.getItem("WeatherCache");

        if (cached) {
            const { weather: cachedWeather, timestamp } = JSON.parse(cached);
            const age = Date.now() - timestamp;

            if (age < CACHE_DURATION) {
                setWeather(cachedWeather.condition);
                setWeatherImage(weatherImages[cachedWeather.code]);
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
            const response = await fetch(
                `http://localhost:8080/api/weather/coordinates?lat=${lat}&lng=${lon}`
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
            setWeather(weatherData.condition);
            setWeatherImage(weatherImages[weatherData.code]);
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