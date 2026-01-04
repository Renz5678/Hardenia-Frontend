import styles from './TaskPosting.module.css'
import {useEffect, useState} from "react";
import {useAuth} from '../../../contexts/AuthContext.jsx'

export default function NumberOfPlants() {
    const [numberOfPlants, setNumberOfPlants] = useState(0);
    const {getToken} = useAuth();

    const getNumberOfPlants = async () => {
        const token = await getToken();
        try {
            const response = await fetch("https://flower-backend-latest-8vkl.onrender.com/flowers/number_of_flowers", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok)
                throw new Error("Flower details cannot be found!");

            const flowerCount = await response.json(); // Added 'await' here
            return flowerCount; // Return the value
        } catch (error) {
            console.log(error);
            return 0; // Return a default value on error
        }
    }

    useEffect(() => {
        getNumberOfPlants().then(count => setNumberOfPlants(count));
    }, [])

    return (
        <>
            <div className={styles.taskPosting}>
                <p>Number of Plants: {numberOfPlants}</p>
            </div>
        </>
    );
}