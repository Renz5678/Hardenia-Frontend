import styles from './TaskModal.module.css';
import { useRef, useEffect } from 'react';

export default function TaskModal({ flower, tasks, isLoading, error, onClose, onTaskUpdate }) {
    const modalRef = useRef(null);

    // Close modal when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    // Close modal on Escape key
    useEffect(() => {
        function handleEscape(event) {
            if (event.key === 'Escape') {
                onClose();
            }
        }

        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    const handleCompleteTask = async (taskId) => {
        try {
            // TODO: Implement task completion API call
            console.log('Completing task:', taskId);
            // await fetch(`API_URL/maintenance/${taskId}/complete`, { method: 'PATCH' });
            onTaskUpdate(); // Refresh tasks after update
        } catch (error) {
            console.error('Error completing task:', error);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            // TODO: Implement task deletion API call
            console.log('Deleting task:', taskId);
            // await fetch(`API_URL/maintenance/${taskId}`, { method: 'DELETE' });
            onTaskUpdate(); // Refresh tasks after deletion
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div ref={modalRef} className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Tasks for {flower.flowerName}</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className={styles.modalBody}>
                    {isLoading ? (
                        <div className={styles.loading}>
                            <p>Loading tasks...</p>
                        </div>
                    ) : error ? (
                        <div className={styles.error}>
                            <p>Error: {error}</p>
                            <button onClick={onTaskUpdate}>Retry</button>
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className={styles.empty}>
                            <p>No tasks available for this flower</p>
                        </div>
                    ) : (
                        <div className={styles.taskList}>
                            {tasks.map((task) => (
                                <div key={task.task_id} className={styles.taskItem}>
                                    <div className={styles.taskInfo}>
                                        <h3>{task.taskType}</h3>
                                        <p className={styles.taskDate}>
                                            Due: {new Date(task.scheduledDate).toLocaleDateString()}
                                        </p>
                                        {task.notes && (
                                            <p className={styles.taskNotes}>{task.notes}</p>
                                        )}
                                        {task.performedBy && (
                                            <p className={styles.taskPerformer}>By: {task.performedBy}</p>
                                        )}
                                    </div>
                                    <div className={styles.taskActions}>
                                        <button
                                            className={styles.completeButton}
                                            onClick={() => handleCompleteTask(task.task_id)}
                                        >
                                            Complete
                                        </button>
                                        <button
                                            className={styles.deleteButton}
                                            onClick={() => handleDeleteTask(task.task_id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.addButton}>
                        + Add New Task
                    </button>
                </div>
            </div>
        </div>
    );
}