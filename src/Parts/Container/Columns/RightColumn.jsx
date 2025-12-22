import styles from './Column.module.css'
import HarvestTrash from "./HarvestTrash/HarvestTrash.jsx";
import {ToolBox} from "./ToolBox/ToolBox.jsx";

export default function RightColumn() {
    return (
        <>
            <div className={styles.sideColumn}>
                <ToolBox/>
                {/*<HarvestTrash />*/}
            </div>
        </>
    )
}