import styles from './Weather.module.css'
import WeatherStatus from './weatherStatus.png'
import Day from "./Days/Day.jsx";
import Status from "./Status/Status.jsx";
import { useState } from "react";
import sun from './Sun.png'

export default function Weather() {
    const [date] = useState(() => new Date().toDateString().substring(4));
    const [currentWeather, setCurrentWeather] = useState("Cloudy"); // Add this state
    const [isSunAvailable, setIsSunAvailable] = useState(false);

    // Add this callback function
    const handleWeatherUpdate = (weatherCondition) => {
        setCurrentWeather(weatherCondition);

        setIsSunAvailable(weatherCondition === "Sunny" || weatherCondition === "Sunny with Clouds" || weatherCondition === "Sunny with Rain");
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
                <Status onWeatherUpdate={handleWeatherUpdate} /> {/* Pass the callback */}
                <h1>{date}</h1>
                <Day />
            </div>

            {isSunAvailable && (<img
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