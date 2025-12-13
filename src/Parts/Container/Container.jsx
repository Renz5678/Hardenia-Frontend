import styles from './Container.module.css'
import LeftColumn from "./Columns/LeftColumn.jsx";
import MiddleColumn from "./Columns/MiddleColumn.jsx";
import RightColumn from "./Columns/RightColumn.jsx";

export default function Container() {
    return(
        <>
            <div className={styles.container}>
                <LeftColumn />
                <MiddleColumn />
                <RightColumn />
            </div>

            <div className={styles.spaceWrapper}>

            </div>
        </>
    );
}