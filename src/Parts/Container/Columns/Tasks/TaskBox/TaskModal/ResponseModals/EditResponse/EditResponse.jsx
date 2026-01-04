import styles from './EditResponse.module.css'
import { useState, useEffect } from 'react';
import EditSuccessful from "../EditSuccessful/EditSuccessful.jsx";
import {useAuth} from '../../../../../../../../contexts/AuthContext.jsx'

export default function EditResponse({ task, onClose, onSave, flower }) {
    const {getToken} = useAuth();
    const [formData, setFormData] = useState({
        flower_id: 0,
        maintenanceType: '',
        maintenanceDate: '',
        notes: '',
        performedBy: ''
    });
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (task && flower) {
            setFormData({
                flower_id: flower.flower_id,
                maintenanceType: task.maintenanceType || '',
                maintenanceDate: task.maintenanceDate ? new Date(task.maintenanceDate).toISOString() : '',
                notes: task.notes || '',
                performedBy: task.performedBy || 'string'
            });
        }
    }, [task, flower]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Convert date input to ISO string format
        if (name === 'maintenanceDate') {
            const dateValue = new Date(value).toISOString();
            setFormData(prev => ({
                ...prev,
                [name]: dateValue
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = await getToken();
            const response = await fetch(`https://flower-backend-latest-8vkl.onrender.com/maintenance/${task.task_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to update task');
            }

            const updatedTask = await response.json();

            // Show success message
            setShowSuccess(true);

            // Hide success message after 2 seconds and close modal
            setTimeout(() => {
                setShowSuccess(false);
                onSave(updatedTask);
                onClose();
            }, 2000);

        } catch (error) {
            console.error('Error updating task:', error);
            alert('Failed to update task: ' + error.message);
        }
    };

    // Convert ISO date to date input format for display
    const getDateInputValue = () => {
        if (formData.maintenanceDate) {
            return new Date(formData.maintenanceDate).toISOString().split('T')[0];
        }
        return '';
    };

    return (
        <div className={styles.editModal}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <h2>Edit Task</h2>
                <span className={styles.closeButton} onClick={onClose}>×</span>
                <div className={styles.formGroup}>
                    <label htmlFor="maintenanceType">Task Type:</label>
                    <input
                        type="text"
                        id="maintenanceType"
                        name="maintenanceType"
                        value={formData.maintenanceType}
                        readOnly={true}
                        disabled={true}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="maintenanceDate">Date:</label>
                    <input
                        type="date"
                        id="maintenanceDate"
                        name="maintenanceDate"
                        value={getDateInputValue()}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="notes">Notes:</label>
                    <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows="4"
                    />
                </div>

                <div className={styles.buttonGroup}>
                    <button type="submit" className={styles.saveButton}>
                        Save Changes
                    </button>
                    <button type="button" className={styles.cancelButton} onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </form>

            {showSuccess && <EditSuccessful/>}
        </div>
    );
}