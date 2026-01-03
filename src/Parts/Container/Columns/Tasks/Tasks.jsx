import styles from './Tasks.module.css'
import TaskBox from "./TaskBox/TaskBox.jsx";

export default function Tasks({ plants = [] }) {
    return(
        <>
            <div className={styles.tasks}>
                {plants
                    .filter(flower => flower != null) // Remove null/undefined entries
                    .map((flower, index) => (
                        <TaskBox key={flower.id || index} flower={flower} />
                    ))}
            </div>
        </>
    )
}