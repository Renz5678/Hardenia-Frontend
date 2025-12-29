import styles from './PlantGrid.module.css'
import {useState} from "react";
import PlantForm from "./NewPlantForm/PlantForm.jsx";
import PlantBox from "./PlantBox/PlantBox.jsx";

export default function PlantGrid({ plants, onPlantAdded }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [localPlants, setLocalPlants] = useState(plants);
    const totalBoxes = 9;

    // Create grid with flowers in their assigned positions
    const gridItems = Array.from({ length: totalBoxes }, (_, index) => {
        return localPlants.find(plant => plant.gridPosition === index) || null;
    });

    const handleBoxClick = (index) => {
        if (!gridItems[index]) {
            setSelectedPosition(index);
            setIsOpen(true);
        }
    };

    const handlePlantAdded = (newPlant) => {
        // Update local state immediately for instant UI update
        setLocalPlants(prev => [...prev, newPlant]);

        // Also notify parent if callback exists
        if (onPlantAdded) {
            onPlantAdded(newPlant);
        }
        setIsOpen(false);
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
                    onPlantAdded={handlePlantAdded}
                />
            )}
        </>
    )
}