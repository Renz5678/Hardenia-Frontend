import styles from './Title.module.css'
import TitleTab from './Title.png'

export default function Title() {
    return(
        <>
            <div className={styles.title}>
                <img src={TitleTab} alt="Title"/>
            </div>
        </>
    );
}