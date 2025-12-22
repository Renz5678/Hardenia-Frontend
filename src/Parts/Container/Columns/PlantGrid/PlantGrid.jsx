import styles from './PlantGrid.module.css'
import {useState} from "react";
import PlantForm from "./NewPlantForm/PlantForm.jsx";
import PlantBox from "./PlantBox/PlantBox.jsx";

export default function PlantGrid({ plants }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const totalBoxes = 9;

    // Create grid with flowers in their assigned positions
    const gridItems = Array.from({ length: totalBoxes }, (_, index) => {
        return plants.find(plant => plant.gridPosition === index) || null;
    });

    const handleBoxClick = (index) => {
        if (!gridItems[index]) {
            setSelectedPosition(index);
            setIsOpen(true);
        }
    };

    return (
        <>
            <div className={styles.grid}>
                {gridItems.map((plant, index) => (
                    <PlantBox
                        key={index}
                        plant={plant}
                        index={index}
                        onClick={() => handleBoxClick(index)}
                    />
                ))}
            </div>

            {isOpen && (
                <PlantForm
                    onClose={() => setIsOpen(false)}
                    gridPosition={selectedPosition}
                />
            )}
        </>
    )
}