import styles from './HarvestTrash.module.css'
import trash from './Compost_bin-1.png'
import harvest from './basket.png'

export default function HarvestTrash() {
    return (
        <>
            <div className={styles}>
                <img src={trash} className={styles.image}/>
                <img src={harvest} className={styles.image}/>
            </div>
        </>
    )
}