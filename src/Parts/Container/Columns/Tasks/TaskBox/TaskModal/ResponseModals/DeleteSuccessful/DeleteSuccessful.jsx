import styles from "./DeleteSuccessful.module.css";

export default function DeleteSuccessful() {
    return(
        <>
            <div className={styles.successModal}>
                <h1>Task Deleted Successfully!</h1>
            </div>
        </>
    );
}