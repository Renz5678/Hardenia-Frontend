import styles from './PlantForm.module.css'
import placeholder from '../FlowerPhotos/smiley.png'
import sunflower from '../FlowerPhotos/Sunflower.png'
import anthurium from '../FlowerPhotos/Anthurium.png'
import hibiscus from '../FlowerPhotos/Hibiscus.png'
import kalachuchi from '../FlowerPhotos/Kalachuchi.png'
import zinnias from '../FlowerPhotos/Zinnias.png'
import {useState, useRef, useEffect} from "react";

// Flower care templates - different frequencies for each species
const FLOWER_CARE_TEMPLATES = {
    sunflower: {
        waterFrequencyDays: 2,
        fertilizeFrequencyDays: 14,
        pruneFrequencyDays: 21
    },
    anthurium: {
        waterFrequencyDays: 3,
        fertilizeFrequencyDays: 30,
        pruneFrequencyDays: 60
    },
    hibiscus: {
        waterFrequencyDays: 1,
        fertilizeFrequencyDays: 7,
        pruneFrequencyDays: 30
    },
    kalachuchi: {
        waterFrequencyDays: 4,
        fertilizeFrequencyDays: 21,
        pruneFrequencyDays: 45
    },
    zinnias: {
        waterFrequencyDays: 2,
        fertilizeFrequencyDays: 14,
        pruneFrequencyDays: 28
    }
};

const FLOWER_IMAGES = {
    sunflower,
    anthurium,
    hibiscus,
    kalachuchi,
    zinnias
};

const COLOR_OPTIONS = {
    red: "#ff0000",
    yellow: "#ffff00",
    pink: "#f15c7b",
    white: "#ffffff",
    purple: "#800080"
};

const FLOWER_OPTIONS = Object.keys(FLOWER_IMAGES).map(
    flower => flower.charAt(0).toUpperCase() + flower.slice(1)
);

const COLORS = ["Red", "Yellow", "Pink", "White", "Purple"];
const GROWTH_STAGES = ["Seed", "Seedling", "Budding", "Wilting", "Blooming"];

export default function PlantForm({ onClose, gridPosition, onPlantAdded }) {
    const formRef = useRef(null);
    const API_BASE_URL = "http://localhost:8080";

    // Form state
    const [formData, setFormData] = useState({
        plantName: "New Plant",
        inputBoxValue: "",
        plantType: "",
        plantImage: placeholder,
        color: "",
        colorInImgBox: "#FFFFFF",
        growthStage: "",
        height: "",
        date: new Date().toISOString().split('T')[0]
    });

    // Modal state
    const [modal, setModal] = useState({
        show: false,
        type: "",
        message: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handle click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (formRef.current && !formRef.current.contains(event.target)) {
                onClose();
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const updateFormData = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addFlowerGrowthDetails = async (flowerId) => {
        const growthPayload = {
            flower_id: flowerId,
            stage: formData.growthStage.toUpperCase(),
            height: parseFloat(formData.height),
            colorChanges: false,
            notes: ""
        };

        const response = await fetch(`${API_BASE_URL}/growth`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(growthPayload)
        });

        if (!response.ok) {
            const responseText = await response.text();
            throw new Error(`Growth details failed: ${responseText}`);
        }

        return response.text().then(text => text ? JSON.parse(text) : null);
    };

    // Helper function to retry API calls
    const retryApiCall = async (apiCall, maxRetries = 3, delayMs = 300) => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await apiCall();
            } catch (error) {
                if (attempt === maxRetries) throw error;
                console.log(`Attempt ${attempt} failed, retrying in ${delayMs}ms...`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }
    };

    // Create maintenance tasks for the flower
    const createMaintenanceTasks = async (flowerId, careTemplate, plantName) => {
        const currentDate = new Date();
        const tasks = [];

        // Create watering task
        const wateringDate = new Date(currentDate);
        wateringDate.setDate(wateringDate.getDate() + careTemplate.waterFrequencyDays);

        tasks.push({
            flower_id: flowerId,
            maintenanceType: "WATERING",
            maintenanceDate: wateringDate.toISOString(),
            notes: `Water ${plantName}`,
            performedBy: "System"
        });

        // Create fertilizing task
        const fertilizingDate = new Date(currentDate);
        fertilizingDate.setDate(fertilizingDate.getDate() + careTemplate.fertilizeFrequencyDays);

        tasks.push({
            flower_id: flowerId,
            maintenanceType: "FERTILIZING",
            maintenanceDate: fertilizingDate.toISOString(),
            notes: `Fertilize ${plantName}`,
            performedBy: "System"
        });

        // Create pruning task
        const pruningDate = new Date(currentDate);
        pruningDate.setDate(pruningDate.getDate() + careTemplate.pruneFrequencyDays);

        tasks.push({
            flower_id: flowerId,
            maintenanceType: "PRUNING",
            maintenanceDate: pruningDate.toISOString(),
            notes: `Prune ${plantName}`,
            performedBy: "System"
        });

        console.log("Creating maintenance tasks:", tasks);

        // Post each task to the API with retry logic
        const taskPromises = tasks.map(async (task) => {
            return retryApiCall(async () => {
                const response = await fetch(`${API_BASE_URL}/maintenance`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(task)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to create ${task.maintenanceType} task: ${errorText}`);
                }

                const result = await response.text().then(text => text ? JSON.parse(text) : null);
                console.log(`${task.maintenanceType} task created:`, result);
                return result;
            });
        });

        // Wait for all tasks to be created
        return Promise.all(taskPromises);
    };

    const resetForm = () => {
        setFormData({
            plantName: "New Plant",
            inputBoxValue: "",
            plantType: "",
            plantImage: placeholder,
            color: "",
            colorInImgBox: "#FFFFFF",
            growthStage: "",
            height: "",
            date: new Date().toISOString().split('T')[0]
        });
    };

    const showModal = (type, message) => {
        setModal({ show: true, type, message });
    };

    const validateForm = () => {
        const { plantName, plantType, color, growthStage, height, date } = formData;

        if (!plantName || !plantType || !color || !growthStage || !height || !date) {
            showModal("error", "Please fill in all fields!");
            return false;
        }

        const heightValue = parseFloat(height);
        if (isNaN(heightValue) || heightValue <= 0) {
            showModal("error", "Height must be a positive number!");
            return false;
        }

        const decimalPlaces = (height.split('.')[1] || '').length;
        if (decimalPlaces > 2) {
            showModal("error", "Height can have a maximum of 2 decimal places!");
            return false;
        }

        return true;
    };

    const addFlowerToDatabase = async () => {
        if (isSubmitting || !validateForm()) return;

        // Get care template for selected flower species
        const careTemplate = FLOWER_CARE_TEMPLATES[formData.plantType.toLowerCase()] || {
            waterFrequencyDays: 3,
            fertilizeFrequencyDays: 14,
            pruneFrequencyDays: 30
        };

        const currentDate = new Date().toISOString();

        const payload = {
            flowerName: formData.plantName,
            species: formData.plantType,
            color: formData.color.toUpperCase(),
            plantingDate: formData.date + "T00:00:00.000Z",
            gridPosition: gridPosition,
            waterFrequencyDays: careTemplate.waterFrequencyDays,
            fertilizeFrequencyDays: careTemplate.fertilizeFrequencyDays,
            pruneFrequencyDays: careTemplate.pruneFrequencyDays,
            lastWateredDate: currentDate,
            lastFertilizedDate: currentDate,
            lastPrunedDate: currentDate,
            autoScheduling: true
        };

        console.log("Sending flower payload:", JSON.stringify(payload, null, 2));

        setIsSubmitting(true);

        try {
            const response = await fetch(`${API_BASE_URL}/flowers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const responseText = await response.text();

            if (!response.ok) {
                throw new Error(`Server error: ${response.status} - ${responseText}`);
            }

            const data = JSON.parse(responseText);
            console.log("Flower created successfully:", data);

            const flowerId = data.flower_id;

            // Add growth details
            try {
                await addFlowerGrowthDetails(flowerId);
                console.log("Growth details added successfully");
            } catch (growthError) {
                console.error("Growth details failed, but flower was created:", growthError);
            }

            // Create maintenance tasks (with small delay to ensure flower is committed to DB)
            try {
                // Wait 500ms to ensure the flower transaction is committed
                await new Promise(resolve => setTimeout(resolve, 500));
                await createMaintenanceTasks(flowerId, careTemplate, formData.plantName);
                console.log("Maintenance tasks created successfully");
            } catch (maintenanceError) {
                console.error("Maintenance tasks failed, but flower was created:", maintenanceError);
                // Don't fail the entire operation if maintenance tasks fail
            }

            // Show success message
            showModal("success", `${formData.plantName} has been added successfully with scheduled maintenance tasks!`);

            // Wait 1.5 seconds, then close and notify parent
            setTimeout(() => {
                setModal({ show: false, type: "", message: "" });
                resetForm();

                if (onPlantAdded) {
                    onPlantAdded(data);
                }

                onClose();
            }, 1500);

        } catch (error) {
            console.error("Full error:", error);
            showModal("error", "Error adding flower: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className={styles.plantFormContainer}>
                <div ref={formRef} className={styles.plantForm}>
                    <span className={styles.close} onClick={onClose}>x</span>
                    <h1>{formData.plantName || "New Plant"}</h1>

                    <div className={styles.inputContainer}>
                        <div className={styles.imageContainer}>
                            <img src={formData.plantImage} alt={formData.plantType || "placeholder"}/>
                            <p>Color</p>
                            <div className={styles.colorBox} style={{background: formData.colorInImgBox}}></div>
                        </div>

                        <div className={styles.inputs}>
                            <h2>Flower Name</h2>
                            <input
                                value={formData.inputBoxValue}
                                maxLength={20}
                                placeholder="max. 20 characters"
                                onChange={(e) => {
                                    updateFormData("plantName", e.target.value);
                                    updateFormData("inputBoxValue", e.target.value);
                                }}
                            />

                            <h2>Type</h2>
                            <select
                                value={formData.plantType}
                                onChange={(e) => {
                                    updateFormData("plantType", e.target.value);
                                    updateFormData("plantImage", FLOWER_IMAGES[e.target.value]);
                                }}
                            >
                                <option value="">Select a plant</option>
                                {FLOWER_OPTIONS.map((flower) => (
                                    <option key={flower} value={flower.toLowerCase()}>
                                        {flower}
                                    </option>
                                ))}
                            </select>

                            <h2>Color</h2>
                            <select
                                value={formData.color}
                                onChange={(e) => {
                                    updateFormData("color", e.target.value);
                                    updateFormData("colorInImgBox", COLOR_OPTIONS[e.target.value]);
                                }}
                            >
                                <option value="">Select a color</option>
                                {COLORS.map((colorOption) => (
                                    <option key={colorOption} value={colorOption.toLowerCase()}>
                                        {colorOption}
                                    </option>
                                ))}
                            </select>

                            <h2>Growth Stage</h2>
                            <select
                                value={formData.growthStage}
                                onChange={(e) => updateFormData("growthStage", e.target.value)}
                            >
                                <option value="">Select a growth stage</option>
                                {GROWTH_STAGES.map((stage) => (
                                    <option key={stage} value={stage.toLowerCase()}>
                                        {stage}
                                    </option>
                                ))}
                            </select>

                            <h2>Height (cm)</h2>
                            <input
                                value={formData.height}
                                maxLength={5}
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="e.g., 25.50"
                                onChange={(e) => updateFormData("height", e.target.value)}
                            />

                            <h2>Planting Date</h2>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => updateFormData("date", e.target.value)}
                            />
                        </div>
                    </div>

                    <button onClick={addFlowerToDatabase} disabled={isSubmitting}>
                        {isSubmitting ? "Adding..." : "Add Flower"}
                    </button>
                </div>
            </div>

            {/* Status Modal */}
            {modal.show && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalIcon}>
                            {modal.type === "success" ? "✓" : "✕"}
                        </div>
                        <h3 className={styles.modalTitle}>
                            {modal.type === "success" ? "Success!" : "Error"}
                        </h3>
                        <p className={styles.modalMessage}>{modal.message}</p>
                        {modal.type === "error" && (
                            <button
                                onClick={() => setModal({ show: false, type: "", message: "" })}
                                className={styles.modalButton}
                            >
                                Close
                            </button>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}