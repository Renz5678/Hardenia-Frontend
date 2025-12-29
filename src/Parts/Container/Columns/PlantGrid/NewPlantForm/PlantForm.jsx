import styles from './PlantForm.module.css'
import placeholder from '../FlowerPhotos/smiley.png'
import sunflower from '../FlowerPhotos/Sunflower.png'
import anthurium from '../FlowerPhotos/Anthurium.png'
import hibiscus from '../FlowerPhotos/Hibiscus.png'
import kalachuchi from '../FlowerPhotos/Kalachuchi.png'
import zinnias from '../FlowerPhotos/Zinnias.png'
import cosmos from '../FlowerPhotos/Cosmos.png'
import marigold from '../FlowerPhotos/Marigold.png'
import sampaguita from '../FlowerPhotos/Sampaguita.png'
import tulips from '../FlowerPhotos/Tulips.png'
import {useState, useRef, useEffect} from "react";

const API_BASE_URL = "https://flower-backend-latest-8vkl.onrender.com";

const FLOWER_CARE_TEMPLATES = {
    sunflower: { waterFrequencyDays: 2, fertilizeFrequencyDays: 14, pruneFrequencyDays: 21, sunlightFrequencyDays: 1 },
    anthurium: { waterFrequencyDays: 3, fertilizeFrequencyDays: 30, pruneFrequencyDays: 60, sunlightFrequencyDays: 1 },
    hibiscus: { waterFrequencyDays: 1, fertilizeFrequencyDays: 7, pruneFrequencyDays: 30, sunlightFrequencyDays: 1 },
    kalachuchi: { waterFrequencyDays: 4, fertilizeFrequencyDays: 21, pruneFrequencyDays: 45, sunlightFrequencyDays: 1 },
    zinnias: { waterFrequencyDays: 2, fertilizeFrequencyDays: 14, pruneFrequencyDays: 28, sunlightFrequencyDays: 1 },
    cosmos: { waterFrequencyDays: 2, fertilizeFrequencyDays: 14, pruneFrequencyDays: 21, sunlightFrequencyDays: 1 },
    marigold: { waterFrequencyDays: 2, fertilizeFrequencyDays: 10, pruneFrequencyDays: 14, sunlightFrequencyDays: 1 },
    sampaguita: { waterFrequencyDays: 3, fertilizeFrequencyDays: 21, pruneFrequencyDays: 30, sunlightFrequencyDays: 1 },
    tulips: { waterFrequencyDays: 3, fertilizeFrequencyDays: 14, pruneFrequencyDays: 28, sunlightFrequencyDays: 1 }
};

const FLOWER_IMAGES = {
    sunflower, anthurium, hibiscus, kalachuchi, zinnias,
    cosmos, marigold, sampaguita, tulips
};

const COLOR_OPTIONS = {
    red: "#ff0000", yellow: "#ffff00", pink: "#f15c7b",
    white: "#ffffff", purple: "#800080"
};

const FLOWER_OPTIONS = Object.keys(FLOWER_IMAGES).map(
    flower => flower.charAt(0).toUpperCase() + flower.slice(1)
);

const COLORS = ["Red", "Yellow", "Pink", "White", "Purple"];
const GROWTH_STAGES = ["Seed", "Seedling", "Budding", "Wilting", "Blooming"];

export default function PlantForm({ onClose, gridPosition, onPlantAdded }) {
    const formRef = useRef(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modal, setModal] = useState({ show: false, type: "", message: "" });
    const [formData, setFormData] = useState({
        plantName: "New Plant",
        plantType: "",
        plantImage: placeholder,
        color: "",
        colorInImgBox: "#FFFFFF",
        growthStage: "",
        height: "",
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (formRef.current && !formRef.current.contains(e.target)) onClose();
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const showModal = (type, message) => setModal({ show: true, type, message });

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

        if ((height.split('.')[1] || '').length > 2) {
            showModal("error", "Height can have a maximum of 2 decimal places!");
            return false;
        }

        return true;
    };

    const createMaintenanceTasks = async (flowerId, careTemplate, plantName) => {
        const tasks = ['WATERING', 'FERTILIZING', 'PRUNING', 'SUNLIGHT'].map((type, i) => {
            const date = new Date();
            const frequencies = [
                careTemplate.waterFrequencyDays,
                careTemplate.fertilizeFrequencyDays,
                careTemplate.pruneFrequencyDays,
                careTemplate.sunlightFrequencyDays
            ];
            date.setDate(date.getDate() + frequencies[i]);

            return {
                flower_id: flowerId,
                maintenanceType: type,
                maintenanceDate: date.toISOString(),
                notes: `${type.charAt(0) + type.slice(1).toLowerCase()} ${plantName}`,
                performedBy: "System"
            };
        });

        const results = await Promise.all(
            tasks.map(task =>
                fetch(`${API_BASE_URL}/maintenance`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(task)
                }).then(res => res.ok ? res.text().then(t => t ? JSON.parse(t) : null) : Promise.reject())
            )
        );

        return results;
    };

    const addFlowerToDatabase = async () => {
        if (isSubmitting || !validateForm()) return;

        const careTemplate = FLOWER_CARE_TEMPLATES[formData.plantType.toLowerCase()] || {
            waterFrequencyDays: 3,
            fertilizeFrequencyDays: 14,
            pruneFrequencyDays: 30,
            sunlightFrequencyDays: 1
        };

        const currentDate = new Date().toISOString();
        const payload = {
            flowerName: formData.plantName,
            species: formData.plantType,
            color: formData.color.toUpperCase(),
            plantingDate: formData.date + "T00:00:00.000Z",
            gridPosition,
            ...careTemplate,
            lastWateredDate: currentDate,
            lastFertilizedDate: currentDate,
            lastPrunedDate: currentDate,
            lastSunlightDate: currentDate,
            autoScheduling: true
        };

        setIsSubmitting(true);

        try {
            const response = await fetch(`${API_BASE_URL}/flowers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`Server error: ${response.status}`);

            const flowerData = await response.json();
            const flowerId = flowerData.flower_id;

            // Add growth details
            try {
                await fetch(`${API_BASE_URL}/growth`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        flower_id: flowerId,
                        stage: formData.growthStage.toUpperCase(),
                        height: parseFloat(formData.height),
                        colorChanges: false,
                        notes: ""
                    })
                });
            } catch (error) {
                console.error("Growth details failed:", error);
            }

            // Create maintenance tasks
            let maintenanceTasks = [];
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                maintenanceTasks = await createMaintenanceTasks(flowerId, careTemplate, formData.plantName);
            } catch (error) {
                console.error("Maintenance tasks failed:", error);
            }

            showModal("success", `${formData.plantName} has been added successfully with scheduled maintenance tasks!`);

            setTimeout(() => {
                setModal({ show: false, type: "", message: "" });
                if (onPlantAdded) {
                    onPlantAdded({
                        ...flowerData,
                        ...payload,
                        growthStage: formData.growthStage.toUpperCase(),
                        height: parseFloat(formData.height),
                        maintenanceTasks
                    });
                }
                onClose();
            }, 1500);

        } catch (error) {
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
                    <h1>{formData.plantName}</h1>

                    <div className={styles.inputContainer}>
                        <div className={styles.imageContainer}>
                            <img src={formData.plantImage} alt={formData.plantType || "placeholder"}/>
                            <p>Color</p>
                            <div className={styles.colorBox} style={{background: formData.colorInImgBox}}></div>
                        </div>

                        <div className={styles.inputs}>
                            <h2>Flower Name</h2>
                            <input
                                value={formData.plantName === "New Plant" ? "" : formData.plantName}
                                maxLength={20}
                                placeholder="max. 20 characters"
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    plantName: e.target.value || "New Plant"
                                }))}
                            />

                            <h2>Type</h2>
                            <select
                                value={formData.plantType}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    plantType: e.target.value,
                                    plantImage: FLOWER_IMAGES[e.target.value] || placeholder
                                }))}
                            >
                                <option value="">Select a plant</option>
                                {FLOWER_OPTIONS.map((flower) => (
                                    <option key={flower} value={flower.toLowerCase()}>{flower}</option>
                                ))}
                            </select>

                            <h2>Color</h2>
                            <select
                                value={formData.color}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    color: e.target.value,
                                    colorInImgBox: COLOR_OPTIONS[e.target.value] || "#FFFFFF"
                                }))}
                            >
                                <option value="">Select a color</option>
                                {COLORS.map((c) => (
                                    <option key={c} value={c.toLowerCase()}>{c}</option>
                                ))}
                            </select>

                            <h2>Growth Stage</h2>
                            <select
                                value={formData.growthStage}
                                onChange={(e) => setFormData(prev => ({...prev, growthStage: e.target.value}))}
                            >
                                <option value="">Select a growth stage</option>
                                {GROWTH_STAGES.map((stage) => (
                                    <option key={stage} value={stage.toLowerCase()}>{stage}</option>
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
                                onChange={(e) => setFormData(prev => ({...prev, height: e.target.value}))}
                            />

                            <h2>Planting Date</h2>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData(prev => ({...prev, date: e.target.value}))}
                            />
                        </div>
                    </div>

                    <button onClick={addFlowerToDatabase} disabled={isSubmitting}>
                        {isSubmitting ? "Adding..." : "Add Flower"}
                    </button>
                </div>
            </div>

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