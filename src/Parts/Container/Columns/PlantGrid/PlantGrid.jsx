import styles from './PlantGrid.module.css'
import {useState, useEffect} from "react";

export default function PlantGrid() {
    const [plants, setPlants] = useState([]);
    const totalBoxes = 9;

    useEffect(() => {
        fetch ("https://localhost:8080/flowers")
            .then(response=> {
               if (!response.ok)
                   throw new Error("Plants could not be fetched!");

               return response.json;
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

    return (
        <div className={styles.grid}>
            {gridItems.map((plant, index) => (
                <div key={index} className={styles.box}>
                    {plant ? (
                        <>
                            <h3>{plant.name}</h3>
                            <p>{plant.type}</p>
                            {/* Add more plant details as needed */}
                        </>
                    ) : (
                        <button>+</button>
                    )}
                </div>
            ))}
        </div>
    )
}