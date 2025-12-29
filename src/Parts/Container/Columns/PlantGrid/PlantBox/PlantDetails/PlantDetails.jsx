import styles from './PlantDetails.module.css'
import FlowerPhotos from "./FlowerPhotos/FlowerPhotos.jsx";
import {useState, useEffect} from "react";

// Badge imports
import QuarterWaterBadge from './Badges/WaterBadge/25.png'
import HalfWaterBadge from './Badges/WaterBadge/50.png'
import AlmostFullWaterBadge from './Badges/WaterBadge/75.png'
import FullWaterBadge from './Badges/WaterBadge/100.png'
import FertilizerBadge from './Badges/Fertilizer Badge.png'
import SunBadge from './Badges/Sun Badge.png'
import IssueBadge from './Badges/Issue Badge.png'
import More from './Badges/More Button.png'

// Flower image imports
import anthurium from './FlowerPhotos/Anthurium.png'
import hibiscus from './FlowerPhotos/Hibiscus.png'
import kalachuchi from './FlowerPhotos/Kalachuchi.png'
import sunflower from './FlowerPhotos/Sunflower.png'
import zinnias from './FlowerPhotos/Zinnias.png'
import cosmos from './FlowerPhotos/Cosmos.png'
import marigold from './FlowerPhotos/Marigold.png'
import sampaguita from './FlowerPhotos/Sampaguita.png'
import tulips from './FlowerPhotos/Tulips.png'

const FLOWER_IMAGES = {
    anthurium,
    hibiscus,
    kalachuchi,
    sunflower,
    zinnias,
    cosmos,
    marigold,
    sampaguita,
    tulips
};

const WATER_BADGES = {
    25: QuarterWaterBadge,
    50: HalfWaterBadge,
    75: AlmostFullWaterBadge,
    100: FullWaterBadge
};

const API_BASE_URL = 'https://flower-backend-latest-8vkl.onrender.com';

export default function PlantDetails({ plant }) {
    const [status, setStatus] = useState(null);
    const [maintenanceData, setMaintenanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const flowerId = plant.flower_id;

    const getFlowerImage = (flowerName) => {
        const lowerCaseName = flowerName.toLowerCase();
        return FLOWER_IMAGES[lowerCaseName] || null;
    };

    const getWaterBadge = (percentage) => {
        if (percentage >= 100) return WATER_BADGES[100];
        if (percentage >= 75) return WATER_BADGES[75];
        if (percentage >= 50) return WATER_BADGES[50];
        if (percentage >= 25) return WATER_BADGES[25];
        return WATER_BADGES[25];
    };

    useEffect(() => {
        if (!flowerId) return;

        const loadData = async () => {
            setLoading(true);
            setError(null);

            try {
                // Fetch growth data
                const growthResponse = await fetch(`${API_BASE_URL}/growth/flower/${flowerId}`);
                if (growthResponse.ok) {
                    const growthData = await growthResponse.json();
                    if (growthData?.length > 0) {
                        setStatus(growthData[0].stage);
                    }
                }

                // Fetch maintenance data
                const maintenanceResponse = await fetch(`${API_BASE_URL}/maintenance/flower/${flowerId}`);
                if (maintenanceResponse.ok) {
                    const maintenanceData = await maintenanceResponse.json();
                    setMaintenanceData(maintenanceData);
                }
            } catch (e) {
                console.error('Error loading flower data:', e);
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [flowerId]);

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
                <h4>Status: {loading ? 'Loading...' : status || 'Unknown'}</h4>
            </div>

            <div className={styles.badgeContainer}>
                <div className={styles.badge}>
                    <img src={FullWaterBadge} alt="Water Badge"/>
                    Hydrated
                </div>

                <div className={styles.badge}>
                    <img src={FertilizerBadge} alt="Fertilizer Badge"/>
                    Good
                </div>

                <div className={styles.badge}>
                    <img src={SunBadge} alt="Sun Badge"/>
                    Good
                </div>

                <div className={styles.badge}>
                    <img src={IssueBadge} alt="Issue Badge"/>
                    <img src={More} alt="More"/>
                </div>
            </div>

            {error && <p className={styles.error}>Error: {error}</p>}
        </div>
    );
}