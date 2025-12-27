import styles from './PlantDetails.module.css'
import rose from './FlowerPhotos/Rose.png'
import sunflower from './FlowerPhotos/Sunflower.png'
import tulips from './FlowerPhotos/Tulips.png'
import FlowerPhotos from "./FlowerPhotos/FlowerPhotos.jsx";
import {useState, useEffect} from "react";
import QuarterWaterBadge from './Badges/WaterBadge/25.png'
import HalfWaterBadge from './Badges/WaterBadge/50.png'
import AlmostFullWaterBadge from './Badges/WaterBadge/75.png'
import More from './Badges/More Button.png'
import FullWaterBadge from './Badges/WaterBadge/100.png'
import FertilizerBadge from './Badges/Fertilizer Badge.png'
import SunBadge from './Badges/Sun Badge.png'
import IssueBadge from './Badges/Issue Badge.png'

export default function PlantDetails({ plant }) {
    const [status, setStatus] = useState(null);
    const [maintenanceData, setMaintenanceData] = useState(null);

    const flowerId = plant.flower_id;

    const getFlowerGrowthStatus = async () => {
        try {
            // Fixed: Remove 's' from https for localhost
            const response = await fetch(`http://localhost:8080/growth/flower/${flowerId}`);
            if (!response.ok)
                throw new Error('Failed to fetch growth status');

            // Fixed: Added await
            const data = await response.json();

            // Fixed: Since it returns an array, get the latest/first one
            if (data && data.length > 0) {
                setStatus(data[0].stage);
                console.log('Growth data:', data);
            }

        } catch (e) {
            console.error('Error fetching growth status:', e);
        }
    }

    const getFlowerMaintenanceStatus = async () => {
        try {
            // Fixed: Remove 's' from https for localhost
            const response = await fetch(`http://localhost:8080/maintenance/flower/${flowerId}`);
            if (!response.ok)
                throw new Error('Failed to fetch maintenance status');

            // Fixed: Added await
            const data = await response.json();
            setMaintenanceData(data);
            console.log('Maintenance data:', data);

        } catch (e) {
            console.error('Error fetching maintenance status:', e);
        }
    }

    const getFlowerImage = (flowerName) => {
        switch (flowerName.toLowerCase()) {
            case 'rose':
                return rose;
            case 'sunflower':
                return sunflower;
            case 'tulips':
                return tulips;
            default:
                return null;
        }
    }

    // Fixed: Move API calls to useEffect
    useEffect(() => {
        if (flowerId) {
            getFlowerMaintenanceStatus();
            getFlowerGrowthStatus();
        }
    }, [flowerId]); // Re-fetch when flowerId changes

    return (
        <div className={styles.plantDetails}>
            <div className={styles.imageAndName}>
                <FlowerPhotos flowerImage={getFlowerImage(plant.species)}/>

                <div className={styles.nameAndSpecies}>
                    <u><p>{plant.flowerName}</p></u>
                    <p>({plant.species})</p>
                </div>
            </div>

            <div className={styles.growthBar}>
                <h4>Growth Stage</h4>
                <div className={styles.loadingBar}>
                    <div className={styles.loadingPart1}></div>
                    <div className={styles.loadingPart2}></div>
                    <div className={styles.loadingPart3}></div>
                    <div className={styles.loadingPart4}></div>
                    <div className={styles.loadingPart5}></div>
                </div>

                <div className={styles.loadingCounter}>
                    <p>20%</p>
                    <p>40%</p>
                    <p>60%</p>
                    <p>80%</p>
                    <p>100%</p>
                </div>
                <h4>Status: {status || 'Loading...'}</h4>
            </div>

            <div className={styles.badgeContainer}>
                <div className={styles.badge}>
                    <img src={FullWaterBadge} alt={"Badge"}/>
                    Hydrated
                </div>

                <div className={styles.badge}>
                    <img src={FertilizerBadge} alt={"Badge"}/>
                    Good
                </div>

                <div className={styles.badge}>
                    <img src={SunBadge} alt={"Badge"}/>
                    Good
                </div>

                <div className={styles.badge}>
                    <img src={IssueBadge} alt={"Badge"}/>
                    <img src={More} alt={"More"}/>
                </div>
            </div>
        </div>
    );
}