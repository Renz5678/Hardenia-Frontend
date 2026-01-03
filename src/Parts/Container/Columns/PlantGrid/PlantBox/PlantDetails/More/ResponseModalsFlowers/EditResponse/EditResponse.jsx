import { useState, useEffect } from 'react';
import styles from './EditResponse.module.css'

export default function EditResponse({ flower, onClose, onSave }) {
    const [formData, setFormData] = useState({
        flowerName: '',
        height: 0,
        waterFrequencyDays: 0,
        fertilizeFrequencyDays: 0,
        pruneFrequencyDays: 0,
        stage: 'SEED'
    });
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (flower) {
            setFormData({
                flowerName: flower.flowerName || '',
                height: flower.height || 0,
                waterFrequencyDays: flower.waterFrequencyDays || 0,
                fertilizeFrequencyDays: flower.fertilizeFrequencyDays || 0,
                pruneFrequencyDays: flower.pruneFrequencyDays || 0,
                stage: flower.stage || 'SEED'
            });
        }
    }, [flower]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Convert numeric fields to numbers
        if (['height', 'waterFrequencyDays', 'fertilizeFrequencyDays', 'pruneFrequencyDays'].includes(name)) {
            setFormData(prev => ({
                ...prev,
                [name]: parseFloat(value) || 0
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async () => {
        try {
            // Update plant details
            const plantResponse = await fetch(`https://flower-backend-latest-8vkl.onrender.com/flowers/${flower.flower_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...flower,
                    flowerName: formData.flowerName,
                    waterFrequencyDays: formData.waterFrequencyDays,
                    fertilizeFrequencyDays: formData.fertilizeFrequencyDays,
                    pruneFrequencyDays: formData.pruneFrequencyDays
                })
            });

            if (!plantResponse.ok) {
                throw new Error('Failed to update plant details');
            }

            // Update growth details
            const growthResponse = await fetch(`https://flower-backend-latest-8vkl.onrender.com/growth/${flower.flower_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    flower_id: flower.flower_id,
                    stage: formData.stage,
                    height: formData.height,
                    colorChanges: flower.colorChanges || true,
                    notes: flower.notes || '',
                    recordedAt: new Date().toISOString(),
                    growthSinceLast: 0
                })
            });

            if (!growthResponse.ok) {
                throw new Error('Failed to update growth details');
            }

            const updatedPlant = await plantResponse.json();
            const updatedGrowth = await growthResponse.json();

            // Show success message
            setShowSuccess(true);

            // Hide success message after 2 seconds and close modal
            setTimeout(() => {
                setShowSuccess(false);
                onSave({ ...updatedPlant, ...updatedGrowth });
                onClose();
            }, 2000);

        } catch (error) {
            console.error('Error updating flower:', error);
            alert('Failed to update flower: ' + error.message);
        }
    };

    const stages = ['SEED', 'SEEDLING', 'BUDDING', 'WILTING', 'BLOOMING'];

    return (
        <div className={styles.editModal}>
            <div className={styles.formContainer}>
                <h2>Edit Flower</h2>
                <span className={styles.closeButton} onClick={onClose}>×</span>

                <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="flowerName">Flower Name:</label>
                    <input
                        className={styles.input}
                        type="text"
                        id="flowerName"
                        name="flowerName"
                        value={formData.flowerName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="height">Height (cm):</label>
                    <input
                        className={styles.input}
                        type="number"
                        id="height"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        min="0"
                        step="0.1"
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="stage">Growth Stage:</label>
                    <select
                        className={styles.select}
                        id="stage"
                        name="stage"
                        value={formData.stage}
                        onChange={handleChange}
                        required
                    >
                        {stages.map(stage => (
                            <option key={stage} value={stage}>{stage}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="waterFrequencyDays">Water Frequency (days):</label>
                    <input
                        className={styles.input}
                        type="number"
                        id="waterFrequencyDays"
                        name="waterFrequencyDays"
                        value={formData.waterFrequencyDays}
                        onChange={handleChange}
                        min="0"
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="fertilizeFrequencyDays">Fertilize Frequency (days):</label>
                    <input
                        className={styles.input}
                        type="number"
                        id="fertilizeFrequencyDays"
                        name="fertilizeFrequencyDays"
                        value={formData.fertilizeFrequencyDays}
                        onChange={handleChange}
                        min="0"
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="pruneFrequencyDays">Prune Frequency (days):</label>
                    <input
                        className={styles.input}
                        type="number"
                        id="pruneFrequencyDays"
                        name="pruneFrequencyDays"
                        value={formData.pruneFrequencyDays}
                        onChange={handleChange}
                        min="0"
                        required
                    />
                </div>

                <div className={styles.buttonGroup}>
                    <button type="button" className={styles.saveButton} onClick={handleSubmit}>
                        Save Changes
                    </button>
                    <button type="button" className={styles.cancelButton} onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>

            {showSuccess && (
                <div className={styles.successMessage}>
                    ✓ Flower updated successfully!
                </div>
            )}
        </div>
    );
}