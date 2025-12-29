import styles from './TaskBox.module.css'
import { useState, useEffect } from "react";
import TaskModal from './TaskModal/TaskModal.jsx'; // Import the new modal component

export default function TaskBox({ flower }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleClick = async () => {
        setIsModalOpen(true);

        // Fetch tasks when modal opens
        if (tasks.length === 0 && !isLoading) {
            await fetchTasks();
        }
    };

    const fetchTasks = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(
                `https://flower-backend-latest-8vkl.onrender.com/maintenance/flower/${flower.flower_id}`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch tasks");
            }

            const data = await response.json();
            setTasks(data);
        } catch (error) {
            console.error("Error fetching tasks:", error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleTaskUpdate = () => {
        // Refetch tasks when a task is updated
        fetchTasks();
    };

    return (
        <>
            <div
                className={styles.taskBox}
                onClick={handleClick}
            >
                <h2>{flower.flowerName}</h2>
            </div>

            {isModalOpen && (
                <TaskModal
                    flower={flower}
                    tasks={tasks}
                    isLoading={isLoading}
                    error={error}
                    onClose={handleCloseModal}
                    onTaskUpdate={handleTaskUpdate}
                />
            )}
        </>
    );
}