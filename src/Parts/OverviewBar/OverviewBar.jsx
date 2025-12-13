import styles from './OverviewBar.module.css'
import grass from './Grass.png'
import TaskPosting from "./TaskPosting/TaskPosting.jsx";
import NumberOfPlants from "./TaskPosting/NumberOfPlants.jsx";

export default function OverviewBar() {
    return (
        <>
            <div className={styles.overviewBar}>
                <img src={grass} alt="Grass"
                className={styles.grass}/>
                <NumberOfPlants />
                <TaskPosting />
                <TaskPosting />
            </div>
        </>
    )
}