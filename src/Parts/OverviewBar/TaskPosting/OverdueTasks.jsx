import styles from './TaskPosting.module.css'
import {useEffect, useState} from "react";
import {useAuth} from '../../../contexts/AuthContext.jsx'

export default function OverdueTasks() {
    const [earliestOverdueTask, setEarliestOverdueTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const {getToken} = useAuth();

    const getEarliestOverdueTask = (tasks) => {
        if (!tasks || tasks.length === 0) return null;

        const now = new Date();

        // Set "end of today" to 11:59:59 PM
        const endOfToday = new Date(now);
        endOfToday.setHours(23, 59, 59, 999);

        const overdueTasks = tasks.filter(task => {
            if (!task.maintenanceDate) return false;

            const scheduledDate = new Date(task.maintenanceDate);

            // Set scheduled date to end of that day (11:59:59 PM)
            const endOfScheduledDay = new Date(scheduledDate);
            endOfScheduledDay.setHours(23, 59, 59, 999);

            // Task is overdue only if the entire day has passed
            return endOfScheduledDay < now;
        });

        if (overdueTasks.length === 0) return null;

        // Get the earliest overdue task
        return overdueTasks.reduce((earliest, current) =>
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
            const earliestOverdue = getEarliestOverdueTask(tasks);
            setEarliestOverdueTask(earliestOverdue);
        } catch (error) {
            console.log(error);
            setEarliestOverdueTask(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getTasks();
    }, []);

    return (
        <>
            <div className={styles.overdueTasks}>
                <h3>Earliest Overdue Task:</h3>
                {loading ? (
                    <p>Loading...</p>
                ) : earliestOverdueTask ? (
                    <p>
                        {earliestOverdueTask.notes} - Due: {new Date(earliestOverdueTask.maintenanceDate).toLocaleDateString()}
                    </p>
                ) : (
                    <p>You have no overdue tasks, Hoorayy</p>
                )}
            </div>
        </>
    );
}