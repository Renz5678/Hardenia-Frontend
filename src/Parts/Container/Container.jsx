import styles from './Container.module.css'
import LeftColumn from "./Columns/LeftColumn.jsx";
import MiddleColumn from "./Columns/MiddleColumn.jsx";
import RightColumn from "./Columns/RightColumn.jsx";
import {useState, useEffect} from "react";

export default function Container() {
    const [plants, setPlants] = useState([]);

    const fetchFlowers = async () => {
        try {
            const response = await fetch("https://flower-backend-latest-8vkl.onrender.com/flowers");
            if (!response.ok) throw new Error("Plants could not be fetched!");
            const data = await response.json();
            setPlants(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchFlowers();
    }, []);

    const handlePlantAdded = (newPlant) => {
        setPlants(prev => [...prev, newPlant]);
    };

    return (
        <>
            <div className={styles.container}>
                <LeftColumn plants={plants}/>
                <MiddleColumn
                    plants={plants}
                    onPlantAdded={handlePlantAdded}
                />
                <RightColumn />
            </div>

            <div className={styles.spaceWrapper}></div>
        </>
    );
}