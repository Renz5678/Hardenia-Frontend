import styles from './FlowerPhotos.module.css'

export default function FlowerPhotos({ flowerImage }) {
    return (
        <div className={styles.flowerIcon}>
            <img src={flowerImage} alt={"Image"}/>
        </div>
    );
}