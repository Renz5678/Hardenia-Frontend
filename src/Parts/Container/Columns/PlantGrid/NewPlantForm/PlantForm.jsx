import styles from './PlantForm.module.css'
import placeholder from '../FlowerPhotos/smiley.png'
import rose from '../FlowerPhotos/Rose.png'
import sunflower from '../FlowerPhotos/Sunflower.png'
import tulips from '../FlowerPhotos/Tulips.png'
import {useState, useRef, useEffect} from "react";

export default function PlantForm({ onClose, gridPosition, onPlantAdded }) {
    const formRef = useRef(null);

    // API Base URL - easy to switch between localhost and production
    const API_BASE_URL = "http://localhost:8080";

    const flowerImages = {
        "rose": rose,
        "sunflower": sunflower,
        "tulips": tulips
    };

    const colorOptions = {
        "red": "#ff0000",
        "yellow": "#ffff00",
        "pink": "#f15c7b",
        "white": "#ffffff",
        "purple": "#800080"
    };

    const flowerOptions = ["Rose", "Sunflower", "Tulips"];
    const colors = ["Red", "Yellow", "Pink", "White", "Purple"];
    const growthStages = ["Seed", "Seedling", "Budding", "Wilting", "Blooming"];

    const [plantName, setPlantName] = useState("New Plant")
    const [inputBoxValue, setInputBoxValue] = useState("")
    const [plantType, setPlantType] = useState("");
    const [plantImage, setPlantImage] = useState(placeholder);
    const [color, setColor] = useState("");
    const [colorInImgBox, setColorInImgBox] = useState("#FFFFFF")
    const [growthStage, setGrowthStage] = useState("");
    const [height, setHeight] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("");
    const [modalMessage, setModalMessage] = useState("");
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

    const addFlowerGrowthDetails = async (flowerId) => {
        // Fixed payload structure - matches backend DTO
        const growthPayload = {
            flower_id: flowerId,              // Direct field, not nested
            stage: growthStage.toUpperCase(), // Uppercase enum name
            height: parseFloat(height),
            colorChanges: false,
            notes: ""
        };

        console.log("Sending growth payload:", JSON.stringify(growthPayload, null, 2));

        try {
            const response = await fetch(`${API_BASE_URL}/growth`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(growthPayload)
            });

            const responseText = await response.text();
            console.log("Growth response status:", response.status);
            console.log("Growth response body:", responseText);

            if (!response.ok) {
                throw new Error(`Growth details failed: ${responseText}`);
            }

            const data = responseText ? JSON.parse(responseText) : null;
            console.log("Growth details sent successfully!", data);
            return data;

        } catch (error) {
            console.error("Growth details error:", error);
            throw error;
        }
    }

    const resetForm = () => {
        setPlantName("New Plant");
        setInputBoxValue("");
        setPlantType("");
        setPlantImage(placeholder);
        setColor("");
        setColorInImgBox("#FFFFFF");
        setGrowthStage("");
        setHeight("");
        setDate(new Date().toISOString().split('T')[0]);
    };

    const showError = (message) => {
        setModalType("error");
        setModalMessage(message);
        setShowModal(true);
    };

    const addFlowerToDatabase = async () => {
        // Prevent double submission
        if (isSubmitting) return;

        // Validate all fields
        if (!plantName || !plantType || !color || !growthStage || !height || !date) {
            showError("Please fill in all fields!");
            return;
        }

        const heightValue = parseFloat(height);
        if (isNaN(heightValue) || heightValue <= 0) {
            showError("Height must be a positive number!");
            return;
        }

        // Check decimal places (max 2)
        const decimalPlaces = (height.split('.')[1] || '').length;
        if (decimalPlaces > 2) {
            showError("Height can have a maximum of 2 decimal places!");
            return;
        }

        const payload = {
            flowerName: plantName,
            species: plantType,
            color: color.toUpperCase(),
            growthStage: growthStage.toUpperCase(),
            height: parseFloat(height),
            plantingDate: date + "T00:00:00.000Z",
            gridPosition: gridPosition
        };

        console.log("Sending flower payload:", JSON.stringify(payload, null, 2));

        setIsSubmitting(true);

        try {
            const response = await fetch(`${API_BASE_URL}/flowers`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload)
            });

            const responseText = await response.text();
            console.log("Flower response status:", response.status);
            console.log("Flower response body:", responseText);

            if (!response.ok) {
                throw new Error(`Server error: ${response.status} - ${responseText}`);
            }

            const data = JSON.parse(responseText);
            console.log("Flower created successfully:", data);

            const flowerId = data.flower_id;

            // Add growth details
            try {
                await addFlowerGrowthDetails(flowerId);
            } catch (growthError) {
                console.error("Growth details failed, but flower was created:", growthError);
                // Don't fail the whole operation if growth fails
            }

            // Show success message
            setModalType("success");
            setModalMessage(`${plantName} has been added successfully!`);
            setShowModal(true);

            // Wait 1.5 seconds, then close and notify parent
            setTimeout(() => {
                setShowModal(false);
                resetForm();

                // Notify parent component that a plant was added
                if (onPlantAdded) {
                    onPlantAdded(data);
                }

                onClose();
            }, 1500);

        } catch (error) {
            console.error("Full error:", error);
            showError("Error adding flower: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <div className={styles.plantFormContainer}>
                <div ref={formRef} className={styles.plantForm}>
                    <span className={styles.close}
                          onClick={onClose}>x</span>
                    <h1>{plantName === "" ? ("New Plant") : (plantName)}</h1>
                    <div className={styles.inputContainer}>
                        <div className={styles.imageContainer}>
                            <img src={plantImage} alt={plantType || "placeholder"}/>
                            <p>Color</p>
                            <div className={styles.colorBox}
                                 style={{background: colorInImgBox}}></div>
                        </div>

                        <div className={styles.inputs}>
                            <h2>Flower Name</h2>
                            <input value={inputBoxValue}
                                   maxLength={20}
                                   placeholder={"max. 20 characters"}
                                   onChange={(event) => {
                                       setPlantName(event.target.value)
                                       setInputBoxValue(event.target.value)
                                   }}/>

                            <h2>Type</h2>
                            <select value={plantType}
                                    onChange={(event) => {
                                        setPlantType(event.target.value)
                                        setPlantImage(flowerImages[event.target.value])
                                    }}>

                                <option value="">Select a plant</option>

                                {flowerOptions.map((flower) => (
                                    <option key={flower} value={flower.toLowerCase()}>
                                        {flower}
                                    </option>
                                ))}
                            </select>

                            <h2>Color</h2>
                            <select value={color}
                                    onChange={(event) => {
                                        setColor(event.target.value)
                                        setColorInImgBox(colorOptions[event.target.value])
                                    }}>

                                <option value="">Select a color</option>

                                {colors.map((colorOption) => (
                                    <option key={colorOption} value={colorOption.toLowerCase()}>
                                        {colorOption}
                                    </option>
                                ))}
                            </select>

                            <h2>Growth Stage</h2>
                            <select value={growthStage}
                                    onChange={(event) => {
                                        setGrowthStage(event.target.value)
                                    }}>

                                <option value="">Select a growth stage</option>

                                {growthStages.map((stage) => (
                                    <option key={stage} value={stage.toLowerCase()}>
                                        {stage}
                                    </option>
                                ))}
                            </select>

                            <h2>Height (cm)</h2>
                            <input
                                value={height}
                                maxLength={5}
                                type={"number"}
                                step={"0.01"}
                                min={"0.01"}
                                placeholder={"e.g., 25.50"}
                                onChange={(event) => {
                                    setHeight(event.target.value)
                                }}/>

                            <h2>Planting Date</h2>
                            <input type={"date"}
                                   value={date}
                                   onChange={(event) => setDate(event.target.value)}/>
                        </div>
                    </div>

                    <button
                        onClick={addFlowerToDatabase}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Adding..." : "Add Flower"}
                    </button>
                </div>
            </div>

            {/* Status Modal */}
            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalIcon}>
                            {modalType === "success" ? "✓" : "✕"}
                        </div>
                        <h3 className={styles.modalTitle}>
                            {modalType === "success" ? "Success!" : "Error"}
                        </h3>
                        <p className={styles.modalMessage}>{modalMessage}</p>
                        {modalType === "error" && (
                            <button
                                onClick={() => setShowModal(false)}
                                className={styles.modalButton}
                            >
                                Close
                            </button>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}