import styles from './Column.module.css'
import Weather from "./Weather/Weather.jsx";
import Tasks from "./Tasks/Tasks.jsx";

export default function LeftColumn() {
    return (
        <>
            <div className={styles.sideColumn}>
                <Weather />
                {/*<Tasks />*/}
            </div>
        </>
    )
}