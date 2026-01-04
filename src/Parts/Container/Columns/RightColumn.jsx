import styles from './Column.module.css'
import {ToolBox} from "./ToolBox/ToolBox.jsx";

export default function RightColumn() {
    return (
        <>
            <div className={styles.sideColumn}>
                <ToolBox/>
            </div>
        </>
    )
}