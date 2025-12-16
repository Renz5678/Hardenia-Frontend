import styles from './PlantForm.module.css'
import placeholder from '../FlowerPhotos/smiley.png'
import rose from '../FlowerPhotos/Rose.png'
import sunflower from '../FlowerPhotos/Sunflower.png'
import tulips from '../FlowerPhotos/Tulips.png'
import {useState, useRef, useEffect} from "react";

export default function PlantForm({ onClose, gridPosition }) { // Add gridPosition prop
    const formRef = useRef(null);

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

    const [plantName, setPlantName] = useState("New Plant")
    const [inputBoxValue, setInputBoxValue] = useState("")
    const [plantType, setPlantType] = useState("");
    const [plantImage, setPlantImage] = useState(placeholder);
    const [color, setColor] = useState("");
    const [colorInImgBox, setColorInImgBox] = useState("#FFFFFF")
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(""); // "success" or "error"
    const [modalMessage, setModalMessage] = useState("");

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

    const addFlowerToDatabase = async () => {
        // Validate all fields
        if (!plantName || !plantType || !color || !date) {
            setModalType("error");
            setModalMessage("Please fill in all fields!");
            setShowModal(true);

            // Reload after showing error
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            return;
        }

        const payload = {
            flowerName: plantName,
            species: plantType,
            color: color.toUpperCase(),
            plantingDate: date + "T00:00:00.000Z",
            gridPosition: gridPosition // Add this line
        };

        console.log("Sending payload:", JSON.stringify(payload, null, 2));

        try {
            const response = await fetch("https://flower-backend-latest-8vkl.onrender.com/flowers", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload)
            });

            const responseText = await response.text();
            console.log("Response status:", response.status);
            console.log("Response body:", responseText);

            if (!response.ok) {
                throw new Error(`Server error: ${response.status} - ${responseText}`);
            }

            const data = JSON.parse(responseText);
            console.log("Success:", data);

            setModalType("success");
            setModalMessage(`${plantName} has been added successfully!`);
            setShowModal(true);

            // Reload after success
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            console.error("Full error:", error);
            setModalType("error");
            setModalMessage("Error adding flower: " + error.message);
            setShowModal(true);

            // Reload after error
            setTimeout(() => {
                window.location.reload();
            }, 2000);
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
                            <img src={plantImage}/>
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
                                        console.log(event.target.value);
                                    }}>

                                <option value="">Select a color</option>

                                {colors.map((colorOption) => (
                                    <option key={colorOption} value={colorOption.toLowerCase()}>
                                        {colorOption}
                                    </option>
                                ))}
                            </select>

                            <h2>Planting Date</h2>
                            <input type={"date"}
                                   value={date}
                                   onChange={(event) => setDate(event.target.value)}/>
                        </div>
                    </div>

                    <button onClick={addFlowerToDatabase}>Add Flower</button>
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