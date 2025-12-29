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
import PlantDetails from "./PlantDetails/PlantDetails.jsx";

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

export default function PlantBox({ plant, index, onClick, onToolUse }) {
    const [isEnlarged, setIsEnlarged] = useState(false);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [currentAction, setCurrentAction] = useState(null);
    const [showEmptyWarning, setShowEmptyWarning] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const boxRef = useRef(null);

    const getFlowerImage = (species) => {
        if (!species) {
            console.log('No species provided for plant');
            return sunflower; // Default fallback
        }

        const lowerCaseName = species.toLowerCase().trim();
        const image = FLOWER_IMAGES[lowerCaseName];

        return image || sunflower; // Default fallback instead of null
    }

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

        // If there's no plant, show warning modal
        if (!plant) {
            setShowEmptyWarning(true);
            setTimeout(() => {
                setShowEmptyWarning(false);
            }, 2000);
            return;
        }

        // Get the tool information from the drag data
        const toolType = e.dataTransfer.getData('toolType');
        const toolId = e.dataTransfer.getData('toolId');

        if (toolType) {
            performAction(toolType, toolId);
        }
    };

    // Perform the action based on tool type
    const performAction = (toolType) => {
        setCurrentAction(toolType);

        // Call parent callback if provided
        if (onToolUse) {
            onToolUse(index, toolType, plant);
        }

        // Example actions for each tool
        switch(toolType) {
            case 'water':
                console.log(`Watering ${plant.flowerName}...`);
                // Add your watering logic here
                break;
            case 'fertilize':
                console.log(`Fertilizing ${plant.flowerName}...`);
                // Add your fertilizing logic here
                break;
            case 'prune':
                console.log(`Pruning ${plant.flowerName}...`);
                // Add your pruning logic here
                break;
            case 'spray':
                console.log(`Spraying ${plant.flowerName}...`);
                // Add your spraying/pesticide logic here
                break;
            case 'repot':
                console.log(`Repotting ${plant.flowerName}...`);
                // Add your repotting logic here
                break;
            case 'sun':
                console.log(`Giving sunlight to ${plant.flowerName}...`);
                // Add your sun exposure logic here
                break;
            default:
                console.log('Unknown tool');
        }

        // Clear action after animation/delay
        setTimeout(() => {
            setCurrentAction(null);
        }, 2000);
    };

    // Handle click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (boxRef.current && !boxRef.current.contains(event.target)) {
                setIsEnlarged(false);
                setShowDetails(false);
            }
        }

        if (isEnlarged || showDetails) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isEnlarged, showDetails]);

    const handleClick = () => {
        if (plant) {
            // If there's a plant, show the details div
            setShowDetails(!showDetails);
            setIsEnlarged(!isEnlarged);
        } else {
            // If empty, trigger parent onClick (to open form)
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
            water: PouringWateringCan,        // Uses active state
            fertilize: null,                   // No other state, keep default
            prune: OpenScissors,              // Uses active state
            spray: SprayingSprayCan,          // Uses active state
            repot: DirtyShovel,               // Uses active state
            sun: Sun                          // Sun icon
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
                            src={getFlowerImage(plant.species)}
                            alt={plant.flowerName || 'plant'}
                            onError={(e) => {
                                console.error('Image failed to load for species:', plant.species);
                                e.target.src = sunflower; // Fallback on error
                            }}
                        />

                        {/* Show action feedback with tool image only */}
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

                {/* Warning modal for empty box */}
                {showEmptyWarning && (
                    <div className={styles.warningModal}>
                        <div className={styles.warningContent}>
                            <p>No plant here!</p>
                        </div>
                    </div>
                )}
            </div>

            {showDetails && plant && <PlantDetails plant={plant}/>}
        </>
    )
}