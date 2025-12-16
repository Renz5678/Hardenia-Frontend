import styles from './PlantGrid.module.css'
import {useState, useEffect} from "react";
import PlantForm from "./NewPlantForm/PlantForm.jsx";
import PlantBox from "./PlantBox/PlantBox.jsx";

export default function PlantGrid() {
    const [isOpen, setIsOpen] = useState(false);
    const [plants, setPlants] = useState([]);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const totalBoxes = 9;

    const fetchFlowers = () => {
        fetch("https://flower-backend-latest-8vkl.onrender.com/flowers")
            .then(response => {
                if (!response.ok)
                    throw new Error("Plants could not be fetched!");

                return response.json();
            })
            .then(data => {
                setPlants(data);
                console.log(data);
            })
            .catch(err => {
                console.error(err);
            })
    };

    // Create grid with flowers in their assigned positions
    const gridItems = Array.from({ length: totalBoxes }, (_, index) => {
        return plants.find(plant => plant.gridPosition === index) || null;
    });

    const handleBoxClick = (index) => {
        if (!gridItems[index]) { // Only open if empty
            setSelectedPosition(index);
            setIsOpen(true);
        }
    };

    useEffect(() => {
        fetchFlowers();
    }, []);

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