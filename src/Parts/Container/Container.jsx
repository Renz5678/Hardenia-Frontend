import styles from './Container.module.css'
import LeftColumn from "./Columns/LeftColumn.jsx";
import MiddleColumn from "./Columns/MiddleColumn.jsx";
import RightColumn from "./Columns/RightColumn.jsx";
import {useState, useEffect} from "react";
import {useAuth} from '../../contexts/AuthContext.jsx'

export default function Container() {
    const { getToken } = useAuth();
    const [plants, setPlants] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFlowers = async () => {
        try {
            setLoading(true);
            const token = await getToken();

            const response = await fetch("https://flower-backend-latest-8vkl.onrender.com/flowers", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error("Plants could not be fetched!");
            const data = await response.json();
            setPlants(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
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
                <LeftColumn plants={plants} loading={loading}/>
                <MiddleColumn
                    plants={plants}
                    onPlantAdded={handlePlantAdded}
                    loading={loading}
                />
                <RightColumn />
            </div>

            <div className={styles.spaceWrapper}></div>
        </>
    );
}