import styles from './TaskBox.module.css'
import { useState, useCallback } from "react";
import TaskModal from './TaskModal/TaskModal.jsx';
import { useAuth } from '../../../../../contexts/AuthContext.jsx'

const API_BASE_URL = 'https://flower-backend-latest-8vkl.onrender.com';

export default function TaskBox({ flower }) {
    const { getToken } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTasks = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const token = await getToken();
            const response = await fetch(
                `${API_BASE_URL}/maintenance/flower/${flower.flower_id}`,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch tasks");
            }

            const data = await response.json();
            setTasks(data);
        } catch (err) {
            console.error("Error fetching tasks:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [flower.flower_id, getToken]);

    const handleClick = () => {
        setIsModalOpen(true);
        // Only fetch if we don't have tasks yet
        if (tasks.length === 0) {
            fetchTasks();
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <div className={styles.taskBox} onClick={handleClick}>
                <h2>{flower.flowerName}</h2>
            </div>

            {isModalOpen && (
                <TaskModal
                    flower={flower}
                    tasks={tasks}
                    isLoading={isLoading}
                    error={error}
                    onClose={handleCloseModal}
                    onTaskUpdate={fetchTasks}
                />
            )}
        </>
    );
}