import styles from './PlantGrid.module.css'
import {useState, useEffect} from "react";
import PlantForm from "./NewPlantForm/PlantForm.jsx";
import PlantBox from "./PlantBox/PlantBox.jsx";

export default function PlantGrid({ plants = [], onPlantAdded }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [localPlants, setLocalPlants] = useState(plants);
    const totalBoxes = 9;

    useEffect(() => {
        setLocalPlants(plants);
    }, [plants]);

    const gridItems = Array.from({ length: totalBoxes }, (_, index) => {
        return localPlants.find(plant => plant != null && plant.gridPosition === index) || null;
    });

    const handleBoxClick = (index) => {
        if (!gridItems[index]) {
            setSelectedPosition(index);
            setIsOpen(true);
        }
    };

    const handlePlantAdded = (newPlant) => {
        setLocalPlants(prev => [...prev, newPlant]);

        if (onPlantAdded) {
            onPlantAdded(newPlant);
        }
        setIsOpen(false);
    };

    // Add handler for plant deletion
    const handlePlantDeleted = (flowerId) => {
        setLocalPlants(prev => prev.filter(plant => plant.flower_id !== flowerId));

        if (onPlantAdded) {
            // Fetch updated plants from parent
            onPlantAdded();
        }
    };

    // Add handler for plant update
    const handlePlantUpdated = (updatedPlant) => {
        setLocalPlants(prev => prev.map(plant =>
            plant.flower_id === updatedPlant.flower_id ? updatedPlant : plant
        ));

        if (onPlantAdded) {
            onPlantAdded();
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
                        onDelete={handlePlantDeleted}
                        onUpdate={handlePlantUpdated}
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