import styles from "./DeleteSuccessful.module.css";

export default function DeleteSuccessful() {
    return(
        <>
            <div className={styles.successModal}>
                <h1>Flower Deleted Successfully!</h1>
            </div>
        </>
    );
}