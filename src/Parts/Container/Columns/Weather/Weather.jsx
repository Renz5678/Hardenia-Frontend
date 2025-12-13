import styles from './Weather.module.css'
import WeatherStatus from './weatherStatus.png'
import Day from "./Days/Day.jsx";
import Status from "./Status/Status.jsx";
import {useState} from "react";

export default function Weather() {
    const [date] = useState(() => new Date().toDateString().substring(4));
    return (
        <>
            <div className={styles.weather}>
                <img src={WeatherStatus} alt="weatherStatus"/>
                <Status />
                <h1>{date}</h1>
                <Day />
            </div>
        </>
    )
}