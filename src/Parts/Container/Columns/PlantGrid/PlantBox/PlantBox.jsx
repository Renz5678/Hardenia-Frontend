import styles from './PlantBox.module.css'
import sunflower from '../FlowerPhotos/Sunflower.png'
import anthurium from '../FlowerPhotos/Anthurium.png'
import hibiscus from '../FlowerPhotos/Hibiscus.png'
import kalachuci from '../FlowerPhotos/Kalachuchi.png'
import zinnias from '../FlowerPhotos/Zinnias.png'
import cosmos from '../FlowerPhotos/Cosmos.png'
import marigold from '../FlowerPhotos/Marigold.png'
import sampaguita from '../FlowerPhotos/Sampaguita.png'
import tulips from '../FlowerPhotos/Tulips.png'
import { useState, useRef, useEffect } from 'react'

// Import the active state images
import PouringWateringCan from './Tools/WateringCan/wc pouring.png'
import OpenScissors from './Tools/Pruning/open.png'
import SprayingSprayCan from './Tools/Pesticide/spray bottle spraying.png'
import DirtyShovel from './Tools/Repot/shovel (dirty).png'
import Sun from './Tools/Sun.png'
import Fertilize from './Tools/Fertilizer/fertilizer-1.png'
import PlantDetails from "./PlantDetails/PlantDetails.jsx";

// Growth stage imports - Regular plants
import stageOne from './PlantDetails/FlowerPhotos/Stages/firstStage.png'
import stageTwo from './PlantDetails/FlowerPhotos/Stages/secondStage.png'
import stageThree from './PlantDetails/FlowerPhotos/Stages/thirdStage.png'
import stageFour from './PlantDetails/FlowerPhotos/Stages/fourthStage.png'

// Growth stage imports - Bush plants
import stageOneBush from './PlantDetails/FlowerPhotos/Stages/BushStages/firstStage.png'
import stageTwoBush from './PlantDetails/FlowerPhotos/Stages/BushStages/secondStage.png'
import stageThreeBush from './PlantDetails/FlowerPhotos/Stages/BushStages/thirdStage.png'
import stageFourBush from './PlantDetails/FlowerPhotos/Stages/BushStages/fourthStage.png'
import pest from './pest.png'

import Happy from './Status/Happy.png';
import Neutral from './Status/Annoyed.png';
import Sad from './Status/Sad.png'

import SunGIF from './Needs/Sun.gif';
import WaterGIF from './Needs/Water.gif'
import DeadGIF from './Status/dead status_animation.gif';

import {useAuth} from '../../../../../contexts/AuthContext.jsx';

// Flower images mapping
const FLOWER_IMAGES = {
    sunflower,
    anthurium,
    hibiscus,
    kalachuchi: kalachuci,
    zinnias,
    cosmos,
    marigold,
    sampaguita,
    tulips
};

// Bush species that use different growth stage images
const BUSH_SPECIES = ['cosmos', 'sampaguita'];

const API_BASE_URL = 'https://flower-backend-latest-8vkl.onrender.com';

// Action icons mapping
const ACTION_ICONS = {
    water: PouringWateringCan,
    fertilize: Fertilize,
    prune: OpenScissors,
    spray: SprayingSprayCan,
    repot: DirtyShovel,
    sun: Sun
};

// Map tool types to maintenance types
const MAINTENANCE_TYPE_MAPPING = {
    'water': 'WATERING',
    'fertilize': 'FERTILIZING',
    'sun': 'SUNLIGHT',
    'spray': 'PEST_CONTROL',
    'prune': 'PRUNING'
};

// Map tool types to action names
const ACTION_NAMES = {
    'water': 'watering',
    'fertilize': 'fertilizing',
    'sun': 'sunlight',
    'spray': 'pest control',
    'prune': 'pruning'
};

// Status states
const STATUS_STATES = {
    HAPPY: 'happy',
    NEUTRAL: 'neutral',
    SAD: 'sad'
};

export default function PlantBox({ plant, index, onClick, onToolUse, onDelete, onUpdate }) {
    const [isEnlarged, setIsEnlarged] = useState(false);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [currentAction, setCurrentAction] = useState(null);
    const [showEmptyWarning, setShowEmptyWarning] = useState(false);
    const [showDeadModal, setIsShowDeadModal] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [growthPercentage, setGrowthPercentage] = useState(0);
    const [maintenanceData, setMaintenanceData] = useState([]);
    const [hasPestControl, setHasPestControl] = useState(false);
    const [plantStatus, setPlantStatus] = useState(STATUS_STATES.HAPPY);
    const [showStatus, setShowStatus] = useState(false);
    const [needsWater, setNeedsWater] = useState(false);
    const [needsSun, setNeedsSun] = useState(false);
    const [isDead, setIsDead] = useState(false);
    const boxRef = useRef(null);
    const detailsRef = useRef(null);
    const {getToken} = useAuth();

    const getFlowerImage = (species, percentage = 0) => {
        if (!species) {
            return sunflower;
        }

        const lowerCaseName = species.toLowerCase().trim();
        const isBush = BUSH_SPECIES.includes(lowerCaseName);

        if (percentage < 40) {
            return isBush ? stageOneBush : stageOne;
        } else if (percentage < 60) {
            return isBush ? stageTwoBush : stageTwo;
        } else if (percentage < 80) {
            return isBush ? stageThreeBush : stageThree;
        } else if (percentage < 100) {
            return isBush ? stageFourBush : stageFour;
        } else {
            return FLOWER_IMAGES[lowerCaseName] || sunflower;
        }
    }

    // Get status image based on plant status
    const getStatusImage = () => {
        switch (plantStatus) {
            case STATUS_STATES.HAPPY:
                return Happy;
            case STATUS_STATES.NEUTRAL:
                return Neutral;
            case STATUS_STATES.SAD:
                return Sad;
            default:
                return Happy;
        }
    };

    // Check for water and sun tasks due today or earlier
    const checkTaskNeeds = (maintenanceList) => {
        if (!maintenanceList || maintenanceList.length === 0) {
            setNeedsWater(false);
            setNeedsSun(false);
            return;
        }

        const now = new Date();
        const todayString = now.toISOString().split('T')[0];

        let hasWaterTask = false;
        let hasSunTask = false;

        maintenanceList.forEach(task => {
            if (!task.maintenanceDate) return;

            const scheduledDate = new Date(task.maintenanceDate);
            const scheduledDateString = scheduledDate.toISOString().split('T')[0];

            // Check if task is due today or earlier (overdue)
            const isDueOrOverdue = scheduledDateString <= todayString;

            if (isDueOrOverdue) {
                if (task.maintenanceType === 'WATERING') {
                    hasWaterTask = true;
                } else if (task.maintenanceType === 'SUNLIGHT') {
                    hasSunTask = true;
                }
            }
        });

        setNeedsWater(hasWaterTask);
        setNeedsSun(hasSunTask);
    };

    // Calculate plant status based on maintenance tasks
    const calculatePlantStatus = (maintenanceList) => {
        if (!maintenanceList || maintenanceList.length === 0) {
            setPlantStatus(STATUS_STATES.HAPPY);
            return;
        }

        const now = new Date();
        const todayString = now.toISOString().split('T')[0];

        let hasOverdue = false;
        let hasDueToday = false;

        maintenanceList.forEach(task => {
            if (!task.maintenanceDate) return;

            const scheduledDate = new Date(task.maintenanceDate);
            const scheduledDateString = scheduledDate.toISOString().split('T')[0];

            if (scheduledDateString < todayString) {
                hasOverdue = true;
            } else if (scheduledDateString === todayString) {
                hasDueToday = true;
            }
        });

        if (hasOverdue) {
            setPlantStatus(STATUS_STATES.SAD);
        } else if (hasDueToday) {
            setPlantStatus(STATUS_STATES.NEUTRAL);
        } else {
            setPlantStatus(STATUS_STATES.HAPPY);
        }
    };

    // Check if there's a PEST_CONTROL task
    const checkForPestControl = (maintenanceList) => {
        if (!maintenanceList || maintenanceList.length === 0) {
            setHasPestControl(false);
            return;
        }

        const hasPest = maintenanceList.some(task =>
            task.maintenanceType === 'PEST_CONTROL'
        );

        setHasPestControl(hasPest);
    };

    // Fetch maintenance data
    const fetchMaintenanceData = async (flowerId) => {
        if (!flowerId) return;

        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/maintenance/flower/${flowerId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setMaintenanceData(data);
                checkForPestControl(data);
                calculatePlantStatus(data);
                checkTaskNeeds(data);
            } else {
                console.error('Failed to fetch maintenance data');
            }
        } catch (error) {
            console.error('Error fetching maintenance data:', error);
        }
    };

    // Fetch growth data
    const fetchGrowthData = async (flowerId, maxHeight) => {
        if (!flowerId) return;

        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/growth/flower/${flowerId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.ok) {
                const growthData = await response.json();

                if (growthData && growthData.length > 0) {
                    const latestGrowth = growthData[0];
                    const max = maxHeight || 100;
                    const percentage = (latestGrowth.height / max) * 100;
                    setGrowthPercentage(Math.min(percentage, 100));
                    setIsDead(latestGrowth.stage === "Dead");
                }
            }
        } catch (error) {
            console.error('Error fetching growth data:', error);
        }
    };

    // Reload all data
    const reloadData = async () => {
        if (!plant?.flower_id) return;

        await Promise.all([
            fetchGrowthData(plant.flower_id, plant.maxHeight),
            fetchMaintenanceData(plant.flower_id)
        ]);
    };

    // Fetch data when component mounts or plant changes
    useEffect(() => {
        reloadData();
    }, [plant?.flower_id, plant?.maxHeight]);

    // Handle drag over - required to allow drop
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(true);
    };

    // Handle drag leave
    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
    };

    // Handle drop
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);

        if (!plant) {
            setShowEmptyWarning(true);
            setTimeout(() => {
                setShowEmptyWarning(false);
            }, 2000);
            return;
        }

        const toolType = e.dataTransfer.getData('toolType');

        // Prevent any action except repot if plant is dead
        if (isDead && toolType !== 'repot') {
            alert(`${plant.flowerName} is dead. Please remove it from the garden using the repot tool.`);
            return;
        }

        if (toolType) {
            performAction(toolType);
        }
    };

    // Get maintenance type from tool type
    const getMaintenanceType = (toolType) => {
        return MAINTENANCE_TYPE_MAPPING[toolType];
    };

    const checkTodayTask = (toolType) => {
        const maintenanceType = getMaintenanceType(toolType);

        if (!maintenanceType) {
            return null;
        }

        if (!maintenanceData || maintenanceData.length === 0) {
            return null;
        }

        // Get today's date in YYYY-MM-DD format for comparison
        const now = new Date();
        const todayString = now.toISOString().split('T')[0];

        // Find a maintenance task that matches the tool type and is scheduled for today or earlier (overdue)
        const todayTask = maintenanceData.find(task => {
            // Check maintenance type
            if (task.maintenanceType !== maintenanceType) {
                return false;
            }

            if (!task.maintenanceDate) {
                return false;
            }

            // Parse the scheduled date and get YYYY-MM-DD format
            const scheduledDate = new Date(task.maintenanceDate);
            const scheduledDateString = scheduledDate.toISOString().split('T')[0];

            // Check if scheduled date is today or before today (overdue)
            const isToday = scheduledDateString === todayString;
            const isOverdue = scheduledDateString < todayString;

            return isToday || isOverdue;
        });

        return todayTask;
    };

    // Delete maintenance task
    const deleteMaintenanceTask = async (taskId) => {
        if (!taskId) {
            console.error('No taskId provided to deleteMaintenanceTask');
            return false;
        }

        try {
            const token = await getToken();
            const endpoint = `${API_BASE_URL}/maintenance/${taskId}`;

            const response = await fetch(endpoint, {
                method: 'DELETE',
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                return true;
            } else {
                const errorText = await response.text();
                console.error('Failed to delete maintenance task:', response.status, errorText);
                return false;
            }
        } catch (error) {
            console.error('Error deleting maintenance task:', error);
            return false;
        }
    };

    // Delete flower
    const deleteFlower = async (flowerId) => {
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/flowers/${flowerId}`, {
                method: 'DELETE',
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                return true;
            } else {
                console.error('Failed to delete flower');
                return false;
            }
        } catch (error) {
            console.error('Error deleting flower:', error);
            return false;
        }
    };

    // Perform the action based on tool type
    const performAction = async (toolType) => {
        // Handle repot (delete plant) - allowed even for dead plants
        if (toolType === 'repot') {
            setCurrentAction(toolType);

            // Show immediate feedback with animation
            setTimeout(async () => {
                const success = await deleteFlower(plant.flower_id);
                if (success) {
                    // Call parent's onDelete immediately for instant UI update
                    if (onDelete) {
                        onDelete(index);
                    }
                    alert(`${plant.flowerName} has been removed from the garden.`);
                } else {
                    alert('Failed to remove plant. Please try again.');
                    setCurrentAction(null);
                }
            }, 500); // Short delay to show animation
            return;
        }

        // Prevent any other action if plant is dead
        if (isDead) {
            alert(`${plant.flowerName} is dead. You can only remove it using the repot tool.`);
            return;
        }

        // Check if there's a task for today
        const todayTask = checkTodayTask(toolType);

        if (todayTask && todayTask.task_id) {
            // Show animation immediately
            setCurrentAction(toolType);

            // Perform deletion in background
            setTimeout(async () => {
                const success = await deleteMaintenanceTask(todayTask.task_id);
                if (success) {
                    // Update local state immediately
                    const updatedTasks = maintenanceData.filter(task => task.task_id !== todayTask.task_id);
                    setMaintenanceData(updatedTasks);

                    // Recalculate status immediately
                    calculatePlantStatus(updatedTasks);
                    checkTaskNeeds(updatedTasks);
                    checkForPestControl(updatedTasks);

                    const actionName = getMaintenanceType(toolType).toLowerCase().replace('_', ' ');

                    // Clear animation
                    setCurrentAction(null);

                    // Show success message
                    alert(`✓ Task completed! ${actionName} done for ${plant.flowerName}.`);

                    // Call parent's onUpdate if available for broader state sync
                    if (onUpdate) {
                        onUpdate(index, plant);
                    }
                } else {
                    alert('Failed to complete task. Please try again.');
                    setCurrentAction(null);
                }

                if (onToolUse) {
                    onToolUse(index, toolType, plant);
                }
            }, 800); // Animation duration
        } else {
            // No task scheduled for today
            const actionName = ACTION_NAMES[toolType] || toolType;
            alert(`No ${actionName} task scheduled for ${plant.flowerName} today.`);
        }
    };

    // Handle click outside
    useEffect(() => {
        function handleClickOutside(e) {
            const clickedInsideDetails = detailsRef.current && detailsRef.current.contains(e.target);
            const clickedInsideBox = boxRef.current && boxRef.current.contains(e.target);

            if (!clickedInsideDetails && !clickedInsideBox) {
                setIsEnlarged(false);
                setShowDetails(false);
            }
        }

        if (isEnlarged || showDetails) {
            setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside);
            }, 0);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isEnlarged, showDetails]);

    const handleDeadPlantCLick = () => {
        setTimeout(() => {
            setIsShowDeadModal(false);
        }, 1500);
    }
    const handleClick = () => {
        if (plant) {
            if (isDead) {
                setIsShowDeadModal(true);
                handleDeadPlantCLick();
                return;
            }
            // Show status for 1.5 seconds when clicked
            setShowStatus(true);
            setTimeout(() => {
                setShowStatus(false);
            }, 1500);

            setShowDetails(!showDetails);
            setIsEnlarged(!isEnlarged);
        } else {
            setIsEnlarged(!isEnlarged);
        }

        if (onClick) {
            onClick();
        }
    }

    // Get action icon based on tool type
    const getActionIcon = () => {
        if (!currentAction) return null;
        return ACTION_ICONS[currentAction];
    };

    return (
        <>
            <div
                ref={boxRef}
                className={`${styles.plantBox} ${isEnlarged ? styles.enlarged : ''} ${isDraggingOver ? styles.draggingOver : ''} ${!plant && isDraggingOver ? styles.emptyDraggingOver : ''}`}
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                    position: 'relative',
                    boxShadow: isDraggingOver && plant ? '0 0 20px rgba(0, 255, 0, 0.5)' :
                        isDraggingOver && !plant ? '0 0 20px rgba(255, 0, 0, 0.5)' : undefined,
                    transition: 'box-shadow 0.3s ease'
                }}
            >
                {hasPestControl && plant && (
                    <img
                        src={pest}
                        className={styles.insectImage}
                        alt="pest"
                    />
                )}
                {plant ? (
                    <>
                        <img
                            src={getFlowerImage(plant.species, growthPercentage)}
                            alt={plant.flowerName || 'plant'}
                            onError={(e) => {
                                console.error('Image failed to load for species:', plant.species);
                                e.target.src = sunflower;
                            }}
                        />

                        <h2 className={styles.plantName}>{plant.flowerName}</h2>

                        {/* Show Water GIF if water task is due and plant is not dead */}
                        {needsWater && !isDead && (
                            <img
                                src={WaterGIF}
                                alt="needs water"
                                className={styles.needsWaterGif}
                            />
                        )}

                        {/* Show Sun GIF if sun task is due and plant is not dead */}
                        {needsSun && !isDead && (
                            <img
                                src={SunGIF}
                                alt="needs sun"
                                className={styles.needsSunGif}
                            />
                        )}

                        {/* Show Dead GIF only when plant is dead */}
                        {isDead && (
                            <img
                                src={DeadGIF}
                                alt="Dead"
                                className={styles.dead}
                            />
                        )}

                        {/* Show status only if plant is not dead */}
                        {showStatus && !isDead && (
                            <img
                                src={getStatusImage()}
                                alt="status"
                                className={styles.status}
                            />
                        )}

                        {currentAction && getActionIcon() && (
                            <div className={styles.actionFeedback}>
                                <img
                                    src={getActionIcon()}
                                    alt={currentAction}
                                    className={styles.actionIcon}
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <p>+</p>
                )}

                {showEmptyWarning && (
                    <div className={styles.warningModal}>
                        <div className={styles.warningContent}>
                            <p>No plant here!</p>
                        </div>
                    </div>
                )}
            </div>

            {showDetails && plant && (
                <div ref={detailsRef} style={{ display: 'contents' }}>
                    <PlantDetails
                        plant={plant}
                        onDelete={onDelete}
                        onUpdate={onUpdate}
                    />
                </div>
            )}

            {showDeadModal && <div className={styles.deadModal}>
                Flower is dead, please remove using shovel
            </div>}
        </>
    )
}