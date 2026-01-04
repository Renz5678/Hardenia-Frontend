import {useState, useEffect} from 'react';
import styles from './EditResponse.module.css'
import {useAuth} from '../../../../../../../../../contexts/AuthContext.jsx'

const API_BASE_URL = 'https://flower-backend-latest-8vkl.onrender.com';
const STAGES = ['SEED', 'SEEDLING', 'BUDDING', 'WILTING', 'BLOOMING'];

export default function EditResponse({ flower, onClose, onSave }) {
    const { getToken } = useAuth();
    const [formData, setFormData] = useState({
        flowerName: '',
        height: 0,
        waterFrequencyDays: 0,
        fertilizeFrequencyDays: 0,
        pruneFrequencyDays: 0,
        stage: 'SEED'
    });
    const [showSuccess, setShowSuccess] = useState(false);
    const [growthId, setGrowthId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch growth details
    const fetchGrowthDetails = async () => {
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/growth/flower/${flower.flower_id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                const growthData = await response.json();
                const growth = Array.isArray(growthData) ? growthData[0] : growthData;

                if (growth?.growth_id) {
                    setGrowthId(growth.growth_id);
                    setFormData(prev => ({
                        ...prev,
                        height: growth.height || 0,
                        stage: growth.stage || prev.stage
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching growth details:', error);
        }
    };

    // Initialize form data
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

            fetchGrowthDetails();
        }
    }, [flower]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        const numericFields = ['height', 'waterFrequencyDays', 'fertilizeFrequencyDays', 'pruneFrequencyDays'];

        setFormData(prev => ({
            ...prev,
            [name]: numericFields.includes(name) ? (parseFloat(value) || 0) : value
        }));
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;

        setIsSubmitting(true);

        try {
            const token = await getToken();

            // Prepare update requests
            const updatePlant = fetch(`${API_BASE_URL}/flowers/${flower.flower_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...flower,
                    flowerName: formData.flowerName,
                    waterFrequencyDays: formData.waterFrequencyDays,
                    fertilizeFrequencyDays: formData.fertilizeFrequencyDays,
                    pruneFrequencyDays: formData.pruneFrequencyDays
                })
            });

            const updateGrowth = growthId ? fetch(`${API_BASE_URL}/growth/${growthId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
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
            }) : Promise.resolve({ ok: true });

            // Execute both requests in parallel
            const [plantResponse, growthResponse] = await Promise.all([updatePlant, updateGrowth]);

            if (!plantResponse.ok) {
                throw new Error('Failed to update plant details');
            }

            if (!growthResponse.ok) {
                throw new Error('Failed to update growth details');
            }

            const updatedPlant = await plantResponse.json();

            // Show success message
            setShowSuccess(true);

            // Close modal after 2 seconds
            setTimeout(() => {
                setShowSuccess(false);
                onSave(updatedPlant);
                onClose();
                window.location.reload();
            }, 2000);

        } catch (error) {
            console.error('Error updating flower:', error);
            alert('Failed to update flower: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

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
                        type="text"
                        id="height"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        autoComplete="off"
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
                        {STAGES.map(stage => (
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
                    <button
                        type="button"
                        className={styles.saveButton}
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
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