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

export default function PlantBox({ plant, index, onClick, onToolUse, onDelete, onUpdate }) {
    const [isEnlarged, setIsEnlarged] = useState(false);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [currentAction, setCurrentAction] = useState(null);
    const [showEmptyWarning, setShowEmptyWarning] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [growthPercentage, setGrowthPercentage] = useState(0);
    const [maintenanceData, setMaintenanceData] = useState([]);
    const boxRef = useRef(null);
    const detailsRef = useRef(null);

    const getFlowerImage = (species, percentage = 0) => {
        if (!species) {
            console.log('No species provided for plant');
            return sunflower;
        }

        const lowerCaseName = species.toLowerCase().trim();
        const isBush = BUSH_SPECIES.includes(lowerCaseName);

        if (percentage < 20) {
            return isBush ? stageOneBush : stageOne;
        } else if (percentage < 40) {
            return isBush ? stageOneBush : stageOne;
        } else if (percentage < 60) {
            return isBush ? stageTwoBush : stageTwo;
        } else if (percentage < 80) {
            return isBush ? stageThreeBush : stageThree;
        } else if (percentage < 100) {
            return isBush ? stageFourBush : stageFour;
        } else {
            const image = FLOWER_IMAGES[lowerCaseName];
            return image || sunflower;
        }
    }

    // Fetch maintenance data
    const fetchMaintenanceData = async (flowerId) => {
        if (!flowerId) return;

        try {
            const response = await fetch(`${API_BASE_URL}/maintenance/flower/${flowerId}`);
            if (response.ok) {
                const data = await response.json();
                setMaintenanceData(data);
                console.log('PlantBox - Maintenance data:', data);
            } else {
                console.error('Failed to fetch maintenance data');
            }
        } catch (error) {
            console.error('Error fetching maintenance data:', error);
        }
    };

    // Fetch growth data when component mounts or plant changes
    useEffect(() => {
        if (!plant || !plant.flower_id) return;

        const fetchGrowthData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/growth/flower/${plant.flower_id}`);
                if (response.ok) {
                    const growthData = await response.json();

                    if (growthData && growthData.length > 0) {
                        const latestGrowth = growthData[0];
                        const maxHeight = plant.maxHeight || 100;
                        const percentage = (latestGrowth.height / maxHeight) * 100;
                        setGrowthPercentage(Math.min(percentage, 100));

                        console.log('PlantBox - Growth percentage:', percentage);
                    }
                }
            } catch (error) {
                console.error('Error fetching growth data:', error);
            }
        };

        fetchGrowthData();
        fetchMaintenanceData(plant.flower_id);
    }, [plant]);

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
        const toolId = e.dataTransfer.getData('toolId');

        if (toolType) {
            performAction(toolType, toolId);
        }
    };

    // Map tool types to maintenance types
    const getMaintenanceType = (toolType) => {
        const mapping = {
            'water': 'WATERING',
            'fertilize': 'FERTILIZING',
            'sun': 'SUNLIGHT',
            'spray': 'PEST_CONTROL',
            'prune': 'PRUNING'
        };
        return mapping[toolType];
    };

    // Check if there's a task scheduled for today
    const checkTodayTask = (toolType) => {
        const maintenanceType = getMaintenanceType(toolType);

        if (!maintenanceType) {
            console.log('No maintenance type found for tool:', toolType);
            return null;
        }

        if (!maintenanceData || maintenanceData.length === 0) {
            console.log('No maintenance data available');
            return null;
        }

        // Get today's date at midnight in local timezone
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        console.log('Checking for task:', {
            toolType,
            maintenanceType,
            todayStart: todayStart.toISOString(),
            todayEnd: todayEnd.toISOString()
        });

        // Find a maintenance task that matches the tool type and is scheduled for today
        const todayTask = maintenanceData.find(task => {
            // Use camelCase field names to match your backend
            if (task.maintenanceType !== maintenanceType) {
                return false;
            }

            if (!task.maintenanceDate) {
                return false;
            }

            // Parse the scheduled date
            const scheduledDate = new Date(task.maintenanceDate);

            // Check if the scheduled date falls within today
            const isToday = scheduledDate >= todayStart && scheduledDate <= todayEnd;

            console.log('Checking task:', {
                taskId: task.task_id,
                taskType: task.maintenanceType,
                scheduledDate: scheduledDate.toISOString(),
                isToday
            });

            return isToday;
        });

        console.log('Found task:', todayTask);
        console.log('Task ID:', todayTask?.task_id);
        return todayTask;
    };

    // Delete maintenance task
    const deleteMaintenanceTask = async (taskId) => {
        console.log('deleteMaintenanceTask called with taskId:', taskId);

        if (!taskId) {
            console.error('No taskId provided to deleteMaintenanceTask');
            return false;
        }

        try {
            // Try different possible endpoints
            const possibleEndpoints = [
                `${API_BASE_URL}/maintenance/${taskId}`,
                `${API_BASE_URL}/maintenance/task/${taskId}`,
                `${API_BASE_URL}/tasks/${taskId}`
            ];

            let response;
            let successfulEndpoint;

            // Try each endpoint until one works
            for (const endpoint of possibleEndpoints) {
                console.log('Trying endpoint:', endpoint);
                response = await fetch(endpoint, {
                    method: 'DELETE'
                });

                console.log('Response status:', response.status);

                if (response.ok) {
                    successfulEndpoint = endpoint;
                    break;
                } else if (response.status !== 405 && response.status !== 404) {
                    // If it's not "Method Not Allowed" or "Not Found", stop trying
                    break;
                }
            }

            if (response.ok) {
                console.log('Successfully deleted task using endpoint:', successfulEndpoint);
                // Refresh maintenance data after deletion
                await fetchMaintenanceData(plant.flower_id);
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
            const response = await fetch(`${API_BASE_URL}/flowers/${flowerId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                if (onDelete) {
                    onDelete(index);
                }
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
        console.log('=== performAction called ===');
        console.log('Tool type:', toolType);

        // Handle repot (delete plant)
        if (toolType === 'repot') {
            setCurrentAction(toolType);
            const success = await deleteFlower(plant.flower_id);
            if (success) {
                alert(`${plant.flowerName} has been removed from the garden.`);
            } else {
                alert('Failed to remove plant. Please try again.');
            }
            setCurrentAction(null);
            return;
        }

        // Check if there's a task for today
        const todayTask = checkTodayTask(toolType);

        console.log('Today task result:', todayTask);
        console.log('Task ID from result:', todayTask?.task_id);

        if (todayTask && todayTask.task_id) {
            // Task exists for today - show animation and delete it
            setCurrentAction(toolType);

            console.log('About to delete task with ID:', todayTask.task_id);

            const success = await deleteMaintenanceTask(todayTask.task_id);
            if (success) {
                const actionName = getMaintenanceType(toolType).toLowerCase().replace('_', ' ');
                alert(`✓ Task completed! ${actionName} done for ${plant.flowerName}.`);

                // Call onUpdate to refresh the parent component
                if (onUpdate) {
                    onUpdate();
                }
            } else {
                alert('Failed to complete task. Please try again.');
            }

            if (onToolUse) {
                onToolUse(index, toolType, plant);
            }

            setTimeout(() => {
                setCurrentAction(null);
            }, 2000);
        } else {
            // No task scheduled for today - no animation
            const actionName = toolType === 'water' ? 'watering' :
                toolType === 'fertilize' ? 'fertilizing' :
                    toolType === 'sun' ? 'sunlight' :
                        toolType === 'spray' ? 'pest control' :
                            toolType === 'prune' ? 'pruning' : toolType;
            alert(`No ${actionName} task scheduled for ${plant.flowerName} today.`);
        }

        console.log('=== performAction completed ===');
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

    const handleClick = () => {
        if (plant) {
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

        const icons = {
            water: PouringWateringCan,
            fertilize: Fertilize,
            prune: OpenScissors,
            spray: SprayingSprayCan,
            repot: DirtyShovel,
            sun: Sun
        };

        return icons[currentAction];
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
        </>
    )
}