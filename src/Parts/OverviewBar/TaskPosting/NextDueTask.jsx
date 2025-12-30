import styles from './TaskPosting.module.css'
import {useState, useEffect} from "react";

export default function NextDueTask() {
    const [earliestTask, setEarliestTask] = useState(null);
    const [loading, setLoading] = useState(true);

    const getEarliestTask = (tasks) => {
        if (!tasks || tasks.length === 0) return null;

        return tasks.reduce((earliest, current) =>
            current.maintenanceDate < earliest.maintenanceDate ? current : earliest
        );
    }

    const getTasks = async () => {
        try {
            const response = await fetch("https://flower-backend-latest-8vkl.onrender.com/maintenance");

            if (!response.ok)
                throw new Error("Tasks failed to fetch");

            const tasks = await response.json();
            const nextTask = getEarliestTask(tasks);
            setEarliestTask(nextTask);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getTasks();
    }, []);

    return (
        <>
            <div className={styles.nextDueTask}>
                <h3>Next Due Task:</h3>
                {loading ? (
                    <p>Loading...</p>
                ) : earliestTask ? (
                    <>
                        <p>{earliestTask.notes}</p>
                        <p>Due: {new Date(earliestTask.maintenanceDate).toLocaleDateString()}</p>
                    </>
                ) : (
                    <p>No plant yet.</p>
                )}
            </div>
        </>
    );
}