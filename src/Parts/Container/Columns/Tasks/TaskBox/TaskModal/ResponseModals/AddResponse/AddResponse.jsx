import { useState, useEffect } from 'react'
import styles from './AddResponse.module.css'
import AddSuccessful from './AddSuccessful.jsx'

export default function AddResponse({ onClose, flower }) {
    const [formData, setFormData] = useState({
        maintenanceType: 'WATERING',
        maintenanceDate: new Date().toISOString().slice(0, 16),
        notes: '',
        performedBy: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [taskAdded, setTaskAdded] = useState(false)

    const maintenanceTypes = [
        'WATERING',
        'SUNLIGHT',
        'FERTILIZING',
        'PRUNING',
        'PEST_CONTROL',
        'REPOTTING'
    ]

    // Auto-close after 2 seconds when task is added
    useEffect(() => {
        if (taskAdded) {
            const timer = setTimeout(() => {
                window.location.reload()
            }, 2000)

            return () => clearTimeout(timer)
        }
    }, [taskAdded])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        const submission = {
            flower_id: flower.flower_id,
            maintenanceType: formData.maintenanceType,
            maintenanceDate: new Date(formData.maintenanceDate).toISOString(),
            notes: formData.notes,
            performedBy: formData.performedBy
        }

        try {
            const response = await fetch('https://flower-backend-latest-8vkl.onrender.com/maintenance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submission)
            })

            if (response.ok) {
                setTaskAdded(true)
            } else {
                const error = await response.json()
                alert(`Error: ${error.message || 'Failed to add task'}`)
                setIsSubmitting(false)
            }
        } catch (error) {
            alert(`Error: ${error.message || 'Failed to add task'}`)
            setIsSubmitting(false)
        }
    }

    const handleSuccessClose = () => {
        setTaskAdded(false)
        window.location.reload()
    }

    // Get current date and time in local timezone for min attribute
    const getCurrentDateTime = () => {
        const now = new Date()
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
        return now.toISOString().slice(0, 16)
    }

    return (
        <>
            {!taskAdded && (
                <div className={styles.addModal}>
                    <div className={styles.addForm}>
                        <h2>Add a new Task for {flower.flowerName}</h2>

                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label htmlFor="maintenanceType">Maintenance Type</label>
                                <select
                                    id="maintenanceType"
                                    name="maintenanceType"
                                    value={formData.maintenanceType}
                                    onChange={handleChange}
                                    required
                                    disabled={isSubmitting}
                                >
                                    {maintenanceTypes.map(type => (
                                        <option key={type} value={type}>
                                            {type.replace(/_/g, ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="maintenanceDate">Maintenance Date</label>
                                <input
                                    type="datetime-local"
                                    id="maintenanceDate"
                                    name="maintenanceDate"
                                    value={formData.maintenanceDate}
                                    onChange={handleChange}
                                    min={getCurrentDateTime()}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="notes">Notes</label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Add any notes about this maintenance task..."
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="performedBy">Performed By</label>
                                <input
                                    type="text"
                                    id="performedBy"
                                    name="performedBy"
                                    value={formData.performedBy}
                                    onChange={handleChange}
                                    placeholder="Your name"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className={styles.formActions}>
                                <button
                                    type="submit"
                                    className={styles.submitBtn}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Adding...' : 'Add Task'}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className={styles.cancelBtn}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {taskAdded && <AddSuccessful onClose={handleSuccessClose} />}
        </>
    )
}