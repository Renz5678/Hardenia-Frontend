import styles from './PlantDetails.module.css'
import FlowerPhotos from "./FlowerPhotos/FlowerPhotos.jsx";
import {useState, useEffect, useMemo, useCallback} from "react";

// Badge imports
import QuarterWaterBadge from './Badges/WaterBadge/25.png'
import FullWaterBadge from './Badges/WaterBadge/100.png'
import FertilizerBadge from './Badges/Fertilizer Badge.png'
import SunBadge from './Badges/Sun Badge.png'
import IssueBadge from './Badges/Issue Badge.png'
import More from './More/More.jsx'

import {useAuth} from '../../../../../../contexts/AuthContext.jsx'

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

const API_BASE_URL = 'https://flower-backend-latest-8vkl.onrender.com';

export default function PlantDetails({ plant, onDelete, onUpdate }) {
    const { getToken } = useAuth();
    const [status, setStatus] = useState(null);
    const [maintenanceData, setMaintenanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentHeight, setCurrentHeight] = useState(0);
    const [growthPercentage, setGrowthPercentage] = useState(0);
    const [isMoreClicked, setIsMoreClicked] = useState(false);

    const flowerId = plant.flower_id;
    const maxHeight = plant.maxHeight || 100;

    // Helper function to check if a date is today
    const isToday = useCallback((dateString) => {
        const today = new Date();
        const date = new Date(dateString);
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    }, []);

    // Get flower image
    const flowerImage = useMemo(() => {
        const lowerCaseName = plant.species.toLowerCase();
        return FLOWER_IMAGES[lowerCaseName] || sunflower;
    }, [plant.species]);

    // Calculate maintenance status
    const maintenanceStatus = useMemo(() => {
        const tasksDueToday = maintenanceData.filter(task => {
            const dateToCheck = task.maintenanceDate || task.dueDate;
            const isIncomplete = !task.completed && !task.isCompleted;
            const isDueToday = dateToCheck && isToday(dateToCheck);
            return isIncomplete && isDueToday;
        });

        const status = {
            isHydrated: true,
            isFertilized: true,
            isSunlit: true
        };

        tasksDueToday.forEach(task => {
            const type = (task.maintenanceType || task.category || '').toLowerCase();
            if (type.includes('water')) status.isHydrated = false;
            if (type.includes('fertili')) status.isFertilized = false;
            if (type.includes('sun')) status.isSunlit = false;
        });

        return status;
    }, [maintenanceData, isToday]);

    // Fetch all data
    useEffect(() => {
        if (!flowerId) return;

        const loadData = async () => {
            setLoading(true);

            try {
                const token = await getToken();

                // Fetch both growth and maintenance data in parallel
                const [growthResponse, maintenanceResponse] = await Promise.all([
                    fetch(`${API_BASE_URL}/growth/flower/${flowerId}`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    }),
                    fetch(`${API_BASE_URL}/maintenance/flower/${flowerId}`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    })
                ]);

                // Process growth data
                if (growthResponse.ok) {
                    const growthData = await growthResponse.json();
                    if (growthData?.length > 0) {
                        const latestGrowth = growthData[0];
                        setStatus(latestGrowth.stage);
                        setCurrentHeight(latestGrowth.height);
                        const percentage = (latestGrowth.height / maxHeight) * 100;
                        setGrowthPercentage(Math.min(percentage, 100));
                    }
                }

                // Process maintenance data
                if (maintenanceResponse.ok) {
                    const data = await maintenanceResponse.json();
                    setMaintenanceData(data);
                }
            } catch (error) {
                console.error('Error loading flower data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [flowerId, maxHeight, getToken]);

    // Growth bar segment component
    const GrowthSegment = ({ threshold, color }) => (
        <div
            className={styles[`loadingPart${threshold / 20}`]}
            style={{
                backgroundColor: growthPercentage >= threshold ? color : '#ddd',
                transition: 'background-color 0.3s ease'
            }}
        />
    );

    return (
        <>
            <div className={styles.plantDetails}>
                <div className={styles.imageAndName}>
                    <FlowerPhotos flowerImage={flowerImage}/>
                    <div className={styles.nameAndSpecies}>
                        <u><p>{plant.flowerName}</p></u>
                        <p>({plant.species})</p>
                    </div>
                </div>

                <div className={styles.growthBar}>
                    <h4>Growth Stage</h4>
                    <div className={styles.loadingBar}>
                        <GrowthSegment threshold={20} color="#ff5b6d" />
                        <GrowthSegment threshold={40} color="#ff9d62" />
                        <GrowthSegment threshold={60} color="#ebb04e" />
                        <GrowthSegment threshold={80} color="#c8ed37" />
                        <GrowthSegment threshold={100} color="#8fc83b" />
                    </div>

                    <div className={styles.loadingCounter}>
                        <p>20%</p>
                        <p>40%</p>
                        <p>60%</p>
                        <p>80%</p>
                        <p>100%</p>
                    </div>

                    <div className={styles.statusInfo}>
                        <p>Status: {loading ? 'Loading...' : status || 'Unknown'} ||
                            Height: {currentHeight.toFixed(1)} cm ({growthPercentage.toFixed(1)}%)</p>
                    </div>
                </div>

                <div className={styles.badgeContainer}>
                    <div className={styles.badge}>
                        <img src={maintenanceStatus.isHydrated ? FullWaterBadge : QuarterWaterBadge} alt="Water Badge"/>
                        {maintenanceStatus.isHydrated ? 'Hydrated' : 'Dehydrated'}
                    </div>

                    <div className={styles.badge}>
                        <img src={FertilizerBadge} alt="Fertilizer Badge"/>
                        {maintenanceStatus.isFertilized ? 'Good' : 'Poor'}
                    </div>

                    <div className={styles.badge}>
                        <img src={SunBadge} alt="Sun Badge"/>
                        {maintenanceStatus.isSunlit ? 'Good' : 'Poor'}
                    </div>

                    <div className={styles.badge}>
                        <img src={IssueBadge} alt="Issue Badge"/>
                        <button
                            className={styles.moreBtn}
                            onClick={() => setIsMoreClicked(true)}
                        />
                    </div>
                </div>
            </div>

            {isMoreClicked && (
                <More
                    onClose={() => setIsMoreClicked(false)}
                    flower={plant}
                    onDelete={onDelete}
                    onSave={onUpdate}
                />
            )}
        </>
    );
}