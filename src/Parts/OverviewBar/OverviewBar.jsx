import styles from './OverviewBar.module.css'
import grass from './Grass.png'
import TaskPosting from "./TaskPosting/TaskPosting.jsx";
import NumberOfPlants from "./TaskPosting/NumberOfPlants.jsx";
import NextDueTask from "./TaskPosting/NextDueTask.jsx";
import MostStages from "./TaskPosting/MostStages.jsx";

export default function OverviewBar() {
    return (
        <>
            <div className={styles.overviewBar}>
                <img src={grass} alt="Grass"
                className={styles.grass}/>
                <NumberOfPlants />
                <NextDueTask/>
                <MostStages/>
            </div>
        </>
    )
}