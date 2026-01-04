import {useRef, useEffect, useState, useCallback} from 'react';
import styles from './TaskModal.module.css';
import EditResponse from "./ResponseModals/EditResponse/EditResponse.jsx";
import DeleteResponse from "./ResponseModals/DeleteResponse/DeleteResponse.jsx";
import DeleteSuccessful from "./ResponseModals/DeleteSuccessful/DeleteSuccessful.jsx";
import AddResponse from "./ResponseModals/AddResponse/AddResponse.jsx";
import {useAuth} from '../../../../../../contexts/AuthContext.jsx'

const API_BASE_URL = 'https://flower-backend-latest-8vkl.onrender.com';

export default function TaskModal({ flower, onClose }) {
    const { getToken } = useAuth();
    const modalRef = useRef(null);
    const [tasks, setTasks] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [isDelete, setIsDelete] = useState(false);
    const [targetTaskId, setTargetTaskId] = useState(null);
    const [targetTask, setTargetTask] = useState(null);
    const [isDeleteSuccess, setIsDeleteSuccess] = useState(false);
    const [isAddClicked, setIsAddClicked] = useState(false);

    const getTasks = useCallback(async () => {
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/maintenance/flower/${flower.flower_id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error("Tasks failed to fetch");

            const data = await response.json();
            setTasks(data);
        } catch(e) {
            console.error('Error fetching tasks:', e);
        }
    }, [flower.flower_id, getToken]);

    const handleDeleteTask = useCallback(async (taskId) => {
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/maintenance/${taskId}`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to delete task: ${errorText}`);
            }

            // Refresh tasks after deletion
            await getTasks();
            setIsDelete(false);
            setIsDeleteSuccess(true);
        } catch(e) {
            console.error('Error deleting task:', e);
            alert('Failed to delete task: ' + e.message);
            setIsDelete(false);
        }
    }, [getToken, getTasks]);

    const handleSaveTask = useCallback(async (updatedTask) => {
        await getTasks();
        setIsEdit(false);
        window.location.reload();
    }, [getTasks]);

    const handleAddTask = useCallback(() => {
        setIsAddClicked(false);
        getTasks();
    }, [getTasks]);

    // Initial fetch
    useEffect(() => {
        getTasks();
    }, [getTasks]);

    // Handle outside clicks and escape key
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Don't close if any modal is open
            if (isDelete || isEdit || isAddClicked) return;
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                if (isDelete) setIsDelete(false);
                else if (isEdit) setIsEdit(false);
                else if (isAddClicked) setIsAddClicked(false);
                else onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose, isDelete, isEdit, isAddClicked]);

    // Auto-close success message
    useEffect(() => {
        if (!isDeleteSuccess) return;

        const timer = setTimeout(() => {
            setIsDeleteSuccess(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, [isDeleteSuccess]);

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

                                        <button
                                            className={styles.edit}
                                            onClick={() => {
                                                setTargetTask(task);
                                                setIsEdit(true);
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className={styles.delete}
                                            onClick={() => {
                                                setTargetTaskId(task.task_id);
                                                setIsDelete(true);
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <button
                        className={styles.addBtn}
                        onClick={() => setIsAddClicked(true)}
                    >
                        Add Task
                    </button>
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
                    onClose={() => setIsDelete(false)}
                    onConfirm={() => handleDeleteTask(targetTaskId)}
                />
            )}

            {isAddClicked && (
                <AddResponse
                    onClose={handleAddTask}
                    flower={flower}
                />
            )}

            {isDeleteSuccess && (
                <DeleteSuccessful onClose={() => setIsDeleteSuccess(false)} />
            )}
        </>
    );
}