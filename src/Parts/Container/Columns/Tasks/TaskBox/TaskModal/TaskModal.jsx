import {useRef, useEffect, useState} from 'react';
import styles from './TaskModal.module.css';
import EditResponse from "./ResponseModals/EditResponse/EditResponse.jsx";
import DeleteResponse from "./ResponseModals/DeleteResponse/DeleteResponse.jsx";
import DeleteSuccessful from "./ResponseModals/DeleteSuccessful/DeleteSuccessful.jsx";

export default function TaskModal({ flower, onClose }) {
    const modalRef = useRef(null);
    const [tasks, setTasks] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [isDelete, setIsDelete] = useState(false);
    const [targetTaskId, setTargetTaskId] = useState(null);
    const [targetTask, setTargetTask] = useState(null);
    const [isDeleteSuccess, setIsDeleteSuccess] = useState(false);

    const getTasks = async () => {
        try {
            const response = await fetch(`https://flower-backend-latest-8vkl.onrender.com/maintenance/flower/${flower.flower_id}`);

            if (!response.ok)
                throw new Error("Tasks failed to fetch")

            const data = await response.json();
            setTasks(data);
        } catch(e) {
            console.error('Error fetching tasks:', e);
        }
    };

    useEffect(() => {
        getTasks();

        function handleClickOutside(event) {
            // Don't close if clicking inside delete or edit modal
            if (isDelete || isEdit) return;

            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        }

        function handleEscape(event) {
            if (event.key === 'Escape') {
                if (isDelete) {
                    setIsDelete(false);
                } else if (isEdit) {
                    setIsEdit(false);
                } else {
                    onClose();
                }
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose, isDelete, isEdit]);

    // Auto-close DeleteSuccessful after 2 seconds
    useEffect(() => {
        if (isDeleteSuccess) {
            const timer = setTimeout(() => {
                setIsDeleteSuccess(false);
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [isDeleteSuccess]);

    const handleDeleteTask = async (taskId) => {
        try {
            console.log('Attempting to delete task:', taskId);
            const response = await fetch(`https://flower-backend-latest-8vkl.onrender.com/maintenance/${taskId}`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json"
                }
            });

            console.log('Delete response status:', response.status);
            console.log('Delete response ok:', response.ok);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Delete failed:', errorText);
                throw new Error(`Failed to delete task: ${errorText}`);
            }

            const responseData = await response.text();
            console.log("Task deleted successfully:", responseData);

            // Refresh tasks after deletion
            await getTasks();
            setIsDelete(false);
            setIsDeleteSuccess(true); // Show success message
        } catch(e) {
            console.error('Error in handleDeleteTask:', e);
            alert('Failed to delete task: ' + e.message);
            setIsDelete(false);
        }
    };

    const handleSaveTask = async (updatedTask) => {
        console.log('Task updated successfully:', updatedTask);
        await getTasks(); // Refresh the task list
        setIsEdit(false); // Close the edit modal
    };

    return (
        <>
            <div className={styles.overlay}>
                <div ref={modalRef} className={styles.modal}>
                    <span className={styles.closeButton} onClick={onClose}>x</span>
                    <div className={styles.header}>
                        <h2 className={styles.title}>Tasks for {flower.flowerName}</h2>
                    </div>

                    <div className={styles.body}>
                        {tasks.length === 0 ? (
                            <p>No tasks found for this flower.</p>
                        ) : (
                            <ul>
                                {tasks.map((task) => (
                                    <li key={task.task_id}>
                                        {task.notes || task.maintenanceType} ({new Date(task.maintenanceDate).toLocaleDateString()})

                                        <button className={styles.edit}
                                                onClick={() => {
                                                    setTargetTask(task);
                                                    setIsEdit(true);
                                                }}>Edit</button>
                                        <button className={styles.delete}
                                                onClick={() => {
                                                    console.log('Delete button clicked for task:', task.task_id);
                                                    setTargetTaskId(task.task_id);
                                                    setIsDelete(true);
                                                }}>Delete</button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {isEdit && (
                <EditResponse
                    task={targetTask}
                    onClose={() => setIsEdit(false)}
                    onSave={handleSaveTask}
                    flower={flower}
                />
            )}

            {isDelete && (
                <DeleteResponse
                    onClose={() => {
                        console.log('Delete cancelled');
                        setIsDelete(false);
                    }}
                    onConfirm={() => handleDeleteTask(targetTaskId)}
                />
            )}

            {isDeleteSuccess && <DeleteSuccessful onClose={() => setIsDeleteSuccess(false)} />}
        </>
    );
}