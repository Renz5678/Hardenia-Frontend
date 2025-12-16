import styles from './PlantBox.module.css'

export default function PlantBox({ plant, index, onClick }) {
    console.log(plant);
    return (
        <div
            className={styles.plantBox}
            onClick={onClick}
        >
            {plant ? (
                <>
                    {plant.flowerName}
                </>
            ) : (
                <p>+</p>
            )}
        </div>
    )
}