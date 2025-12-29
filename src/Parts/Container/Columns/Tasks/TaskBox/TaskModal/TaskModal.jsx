import {useRef, useEffect, useState} from 'react';
import styles from './TaskModal.module.css';

export default function TaskModal({ flower, onClose }) {
    const modalRef = useRef(null);
    const [tasks, setTasks] = useState([]);

    const getTasks = async () => {
        try {
            const response = await fetch(`https://flower-backend-latest-8vkl.onrender.com/maintenance/flower/${flower.flower_id}`);

            if (!response.ok)
                throw new Error("Tasks failed to fetch")

            const data = await response.json(); // Added await here
            console.log(data)
            setTasks(data);
        } catch(e) {
            console.log(e);
        }
    };

    useEffect(() => {
        getTasks(); // Call getTasks when component mounts

        function handleClickOutside(event) {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        }

        function handleEscape(event) {
            if (event.key === 'Escape') {
                onClose();
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);


    return (
        <div className={styles.overlay}>
            <div ref={modalRef} className={styles.modal}>
                <span className={styles.closeButton} onClick={onClose}>x</span>
                <div className={styles.header}>
                    <h2 className={styles.title}>Tasks for {flower.flowerName}</h2>
                </div>

                <div className={styles.body}>
                    <ul>
                        {tasks.map((task) => (
                            <li key={task.task_id}>
                                {task.maintenanceType} - {new Date(task.maintenanceDate).toLocaleDateString()}
                                {task.notes && ` - ${task.notes}`}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}