import styles from './TaskPosting.module.css'
import {useState, useEffect} from "react";
import {useAuth} from '../../../contexts/AuthContext.jsx'

export default function NextDueTask() {
    const [earliestTask, setEarliestTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const {getToken} = useAuth();

    const getEarliestTask = (tasks) => {
        if (!tasks || tasks.length === 0) return null;

        const now = new Date();

        // Filter tasks that are due today or in the future
        const upcomingTasks = tasks.filter(task => {
            if (!task.maintenanceDate) return false;

            const scheduledDate = new Date(task.maintenanceDate);

            // Set scheduled date to end of that day (11:59:59 PM)
            const endOfScheduledDay = new Date(scheduledDate);
            endOfScheduledDay.setHours(23, 59, 59, 999);

            // Include tasks whose day hasn't fully passed yet
            return endOfScheduledDay >= now;
        });

        if (upcomingTasks.length === 0) return null;

        // Get the earliest upcoming task
        return upcomingTasks.reduce((earliest, current) =>
            current.maintenanceDate < earliest.maintenanceDate ? current : earliest
        );
    }

    const getTasks = async () => {
        try {
            const token = await getToken();
            const response = await fetch("https://flower-backend-latest-8vkl.onrender.com/maintenance", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

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
                    <p>No tasks yet :).</p>
                )}
            </div>
        </>
    );
}