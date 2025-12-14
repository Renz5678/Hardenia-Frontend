import styles from './PlantGrid.module.css'
import {useState, useEffect} from "react";
import PlantForm from "./NewPlantForm/PlantForm.jsx";

export default function PlantGrid() {
    const [isOpen, setIsOpen] = useState(false);
    const [plants, setPlants] = useState([]);
    const totalBoxes = 9;

    useEffect(() => {
        fetch ("https://flower-backend-latest-8vkl.onrender.com/flowers")
            .then(response=> {
                if (!response.ok)
                    throw new Error("Plants could not be fetched!");

                return response.json(); // Added parentheses here!
            })
            .then(data => {
                setPlants(data);
                console.log(data);
            })
            .catch(err => {
                console.error(err);
            })
    }, []);

    const gridItems = Array.from({ length: totalBoxes }, (_, index) => {
        return plants[index] || null
    })

    console.log(gridItems);

    return (
        <>
            <div className={styles.grid}>
                {gridItems.map((plant, index) => (
                    <div key={index}
                         className={styles.box}
                         onClick={() => setIsOpen(true)}>
                        {plant ? (
                            <>
                            </>
                        ) : (
                            <p>+</p>
                        )}
                    </div>
                ))}
            </div>

            <PlantForm />
            {/*{isOpen && <PlantForm onClose={() => setIsOpen(false)}/>}*/}
        </>
    )
}