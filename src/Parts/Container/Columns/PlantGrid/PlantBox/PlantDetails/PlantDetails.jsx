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
import More from './More/More.jsx'

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

export default function PlantDetails({ plant, onDelete, onUpdate }) {
    const [status, setStatus] = useState(null);
    const [maintenanceData, setMaintenanceData] = useState(null);
    const [dueMaintenance, setDueMaintenance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentHeight, setCurrentHeight] = useState(0);
    const [maxHeight, setMaxHeight] = useState(plant.maxHeight || 100);
    const [growthPercentage, setGrowthPercentage] = useState(0);
    const [isHydrated, setIsHydrated] = useState(true);
    const [isFertilized, setIsFertilized] = useState(true);
    const [isSunlit, setIsSunlit] = useState(true);
    const [isMoreClicked, setIsMoreClicked] = useState(false);

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

    // Helper function to check if a date is today
    const isToday = (dateString) => {
        const today = new Date();
        const date = new Date(dateString);

        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
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
                    console.log('Growth data:', growthData);

                    if (growthData && growthData.length > 0) {
                        // Get the most recent growth record (should be first if sorted by date desc)
                        const latestGrowth = growthData[0];

                        setStatus(latestGrowth.stage);
                        setCurrentHeight(latestGrowth.height);

                        // Calculate growth percentage
                        const percentage = (latestGrowth.height / maxHeight) * 100;
                        setGrowthPercentage(Math.min(percentage, 100)); // Cap at 100%

                        console.log('Height:', latestGrowth.height, 'Max:', maxHeight, 'Percentage:', percentage);
                    }
                } else {
                    console.error('Failed to fetch growth data');
                }

                // Fetch maintenance data
                const maintenanceResponse = await fetch(`${API_BASE_URL}/maintenance/flower/${flowerId}`);
                if (maintenanceResponse.ok) {
                    const maintenanceData = await maintenanceResponse.json();
                    setMaintenanceData(maintenanceData);
                    setDueMaintenance(maintenanceData);

                    console.log('Maintenance data:', maintenanceData);

                    // Check for incomplete tasks due today
                    const tasksDueToday = maintenanceData.filter(task => {
                        // Use maintenanceDate instead of dueDate
                        const dateToCheck = task.maintenanceDate || task.dueDate;
                        // Check if task is not completed and is due today
                        const isIncomplete = !task.completed && !task.isCompleted;
                        const isDueToday = dateToCheck && isToday(dateToCheck);

                        return isIncomplete && isDueToday;
                    });

                    console.log('Tasks due today:', tasksDueToday);

                    // Reset states to true first
                    let hydrated = true;
                    let fertilized = true;
                    let sunlit = true;

                    // Set states to false if there are incomplete tasks due today
                    tasksDueToday.forEach(task => {
                        // Check both maintenanceType and category fields
                        const type = (task.maintenanceType || task.category || '').toLowerCase();

                        console.log('Task type:', type);

                        if (type.includes('water')) {
                            hydrated = false;
                        }
                        if (type.includes('fertili')) {
                            fertilized = false;
                        }
                        if (type.includes('sun')) {
                            sunlit = false;
                        }
                    });

                    setIsHydrated(hydrated);
                    setIsFertilized(fertilized);
                    setIsSunlit(sunlit);

                    console.log('States - Hydrated:', hydrated, 'Fertilized:', fertilized, 'Sunlit:', sunlit);
                } else {
                    console.error('Failed to fetch maintenance data');
                }
            } catch (e) {
                console.error('Error loading flower data:', e);
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [flowerId, maxHeight]);

    // Group due maintenance by category
    const maintenanceByCategory = dueMaintenance.reduce((acc, item) => {
        const category = item.category || 'Other';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(item);
        return acc;
    }, {});

    return (
        <>
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
                        <div
                            className={styles.loadingPart1}
                            style={{
                                backgroundColor: growthPercentage >= 20 ? '#ff5b6d' : '#ddd',
                                transition: 'background-color 0.3s ease'
                            }}
                        ></div>
                        <div
                            className={styles.loadingPart2}
                            style={{
                                backgroundColor: growthPercentage >= 40 ? '#ff9d62' : '#ddd',
                                transition: 'background-color 0.3s ease'
                            }}
                        ></div>
                        <div
                            className={styles.loadingPart3}
                            style={{
                                backgroundColor: growthPercentage >= 60 ? '#ebb04e' : '#ddd',
                                transition: 'background-color 0.3s ease'
                            }}
                        ></div>
                        <div
                            className={styles.loadingPart4}
                            style={{
                                backgroundColor: growthPercentage >= 80 ? '#c8ed37' : '#ddd',
                                transition: 'background-color 0.3s ease'
                            }}
                        ></div>
                        <div
                            className={styles.loadingPart5}
                            style={{
                                backgroundColor: growthPercentage >= 100 ? '#8fc83b' : '#ddd',
                                transition: 'background-color 0.3s ease'
                            }}
                        ></div>
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
                        <img src={isHydrated ? FullWaterBadge : QuarterWaterBadge} alt="Water Badge"/>
                        {isHydrated ? 'Hydrated' : 'Dehydrated'}
                    </div>

                    <div className={styles.badge}>
                        <img src={FertilizerBadge} alt="Fertilizer Badge"/>
                        {isFertilized ? 'Good' : 'Poor'}
                    </div>

                    <div className={styles.badge}>
                        <img src={SunBadge} alt="Sun Badge"/>
                        {isSunlit ? 'Good' : 'Poor'}
                    </div>

                    <div className={styles.badge}>
                        <img src={IssueBadge} alt="Issue Badge"/>
                        <button className={styles.moreBtn}
                                onClick={() => {
                                    setIsMoreClicked(true);
                                }}
                        ></button>
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