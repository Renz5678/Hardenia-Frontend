import styles from './PlantBox.module.css'
import rose from '../FlowerPhotos/Rose.png'
import sunflower from '../FlowerPhotos/Sunflower.png'
import tulips from '../FlowerPhotos/Tulips.png'
import { useState, useRef, useEffect } from 'react'

export default function PlantBox({ plant, index, onClick }) {
    const [isEnlarged, setIsEnlarged] = useState(false);
    const boxRef = useRef(null);

    const getFlowerImage = (flowerName) => {
        console.log(plant.flowerName)
        switch(flowerName.toLowerCase()) {
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

    // Handle click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (boxRef.current && !boxRef.current.contains(event.target)) {
                setIsEnlarged(false);
            }
        }

        if (isEnlarged) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isEnlarged]);

    const handleClick = () => {
        setIsEnlarged(!isEnlarged);
        if (onClick) {
            onClick();
        }
    }

    return (
        <div
            ref={boxRef}
            className={`${styles.plantBox} ${isEnlarged ? styles.enlarged : ''}`}
            onClick={handleClick}
        >
            {plant ? (
                <>
                    <h1>{plant.flowerName}</h1>
                    <img src={getFlowerImage(plant.species)} alt={plant.flowerName} />
                </>
            ) : (
                <p>+</p>
            )}
        </div>
    )
}