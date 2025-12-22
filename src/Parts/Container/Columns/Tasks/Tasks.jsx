import styles from './Tasks.module.css'
import TaskBox from "./TaskBox/TaskBox.jsx";

export default function Tasks({ plants = [] }) {
    return(
        <>
            <div className={styles.tasks}>
                {plants.map((flower, index) => (
                    <TaskBox key={flower.id || index} flower={flower} />
                ))}
            </div>
        </>
    )
}