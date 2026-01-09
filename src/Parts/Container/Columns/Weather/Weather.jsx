import styles from './Weather.module.css'
import WeatherStatus from './weatherStatus.png'
import Day from "./Days/Day.jsx";
import Status from "./Status/Status.jsx";
import { useState } from "react";
import sun from './Sun.png'

export default function Weather() {
    const [date] = useState(() => new Date().toDateString().substring(4));
    const [currentWeather, setCurrentWeather] = useState("Cloudy");
    const [isSunAvailable, setIsSunAvailable] = useState(false);
    const [isDay, setIsDay] = useState(true); // Add state to track day/night

    // Add this callback function
    const handleWeatherUpdate = (weatherCondition) => {
        setCurrentWeather(weatherCondition);

        setIsSunAvailable(weatherCondition === "Sunny" || weatherCondition === "Sunny with Clouds" || weatherCondition === "Sunny with Rain");
    };

    // Add callback to receive day/night status from Day component
    const handleDayNightUpdate = (isDaytime) => {
        setIsDay(isDaytime);
    };

    const handleDragStart = (e) => {
        e.dataTransfer.setData('toolType', 'sun');
        e.dataTransfer.setData('toolId', 'sun-tool');
        e.dataTransfer.effectAllowed = 'copy';
    };

    return (
        <>
            <div className={styles.weather}>
                {/*<img src={WeatherStatus} alt="weatherStatus"/>*/}
                <Status onWeatherUpdate={handleWeatherUpdate} />
                <h1>{date}</h1>
                <Day onDayNightUpdate={handleDayNightUpdate} /> {/* Pass callback to Day */}
            </div>

            {isSunAvailable && isDay && (<img
                src={sun}
                alt="sun"
                className={styles.sun}
                draggable={true}
                onDragStart={handleDragStart}
                style={{ cursor: 'grab' }}
            />)}
        </>
    )
}