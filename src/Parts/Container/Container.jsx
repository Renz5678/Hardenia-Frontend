import styles from './Container.module.css'
import LeftColumn from "./Columns/LeftColumn.jsx";
import MiddleColumn from "./Columns/MiddleColumn.jsx";
import RightColumn from "./Columns/RightColumn.jsx";
import {useState, useEffect} from "react";

export default function Container() {
    const [plants, setPlants] = useState([]);

    const fetchFlowers = () => {
        fetch("https://flower-backend-latest-8vkl.onrender.com/flowers")
            .then(response => {
                if (!response.ok)
                    throw new Error("Plants could not be fetched!");

                return response.json();
            })
            .then(data => {
                setPlants(data);
            })
            .catch(err => {
                console.error(err);
            })
    };

    useEffect(() => {
        fetchFlowers();
    }, []);

    return(
        <>
            <div className={styles.container}>
                <LeftColumn plants={plants}/>
                <MiddleColumn plants={plants} />
                <RightColumn />
            </div>

            <div className={styles.spaceWrapper}>

            </div>
        </>
    );
}