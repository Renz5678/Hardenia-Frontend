import tasks from './Tasks.png'
import styles from './Tasks.module.css'

export default function Tasks() {
    return(
        <>
            <div className={styles.tasks}>
                <img src={tasks} alt="tasks"/>
            </div>
        </>
    )
}