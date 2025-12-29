import styles from './Column.module.css'
import PlantGrid from "./PlantGrid/PlantGrid.jsx";
import Title from "./Title/Title.jsx";

export default function MiddleColumn({ plants, onPlantAdded }) {
    return (
        <div className={styles.middleColumn}>
            <Title />
            <PlantGrid
                plants={plants}
                onPlantAdded={onPlantAdded}
            />
        </div>
    )
}