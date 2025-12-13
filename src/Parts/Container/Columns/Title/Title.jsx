import styles from './Title.module.css'
import TitleTab from './Title.png'

export default function Title() {
    return(
        <>
            <div className={styles.title}>
                <h1 className={styles.header}>Title</h1>
                <img src={TitleTab} alt="Title"/>
            </div>
        </>
    );
}