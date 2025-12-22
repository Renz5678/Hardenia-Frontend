import styles from './TaskBox.module.css'
import {useState} from "react";

export default function TaskBox({ flower }) {
    const [isHovered, setIsHovered] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [numberOfTasks, setNumberOfTasks] = useState(0)
    const getTasksForFlower = async () => {
        try {
            const response = await fetch(`http://localhost:8080/maintenance/flower/${flower.flower_id}`)

            if (!response.ok)
                throw new Error("Failed to fetch tasks")

            const data = await response.json();
            setTasks(data);
            setNumberOfTasks(data.length);

        } catch (error) {
            console.log(error);
        }
    }

    getTasksForFlower();
    return (
        <>
            <div
                className={styles.taskBox}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <h2>{flower.flowerName}</h2>
            </div>

            {isHovered && (
                <div className={styles.dropdown}>
                    {numberOfTasks === 0 ? (
                        <>
                            <h2>{flower.flowerName} Tasks</h2>
                            <p>No tasks available</p>
                        </>
                    ) : (
                        <div>
                            <h2>Tasks for {flower.flowerName}</h2>
                            {tasks.map((task, index) => (
                                <div key={task.id || index}>
                                    <p>{task.name || task.description}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    )
}