import styles from './More.module.css'
import {useState} from "react";
import EditResponse from "./ResponseModalsFlowers/EditResponse/EditResponse.jsx";
import DeleteResponse from "./ResponseModalsFlowers/DeleteResponse/DeleteResponse.jsx";
import DeleteSuccessful from "./ResponseModalsFlowers/DeleteSuccessful/DeleteSuccessful.jsx";

export default function More({ flower, onClose, onSave, onDelete }) {
    const [isEditClicked, setIsEditClicked] = useState(false);
    const [isDeleteClicked, setIsDeleteClicked] = useState(false);
    const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

    const deleteFlower = async () => {
        try {
            const response = await fetch(`https://flower-backend-latest-8vkl.onrender.com/flowers/${flower.flower_id}`, {
                method: "DELETE"
            });

            if (!response.ok && response.status !== 204) {
                throw new Error("Failed to delete flower");
            }

            let data = null;
            if (response.status !== 204 && response.headers.get('content-type')?.includes('application/json')) {
                data = await response.json();
                console.log(data);
            }

            // Close delete confirmation modal
            setIsDeleteClicked(false);

            // Show success message
            setShowDeleteSuccess(true);

            // Notify parent with flower_id
            if (onDelete) {
                onDelete(flower.flower_id);
            }

            // Wait 2 seconds, then reload
            setTimeout(() => {
                window.location.reload();
            }, 2000);

        } catch (e) {
            console.error("Error deleting flower:", e);
            alert("Failed to delete flower: " + e.message);
        }
    }

    return (
        <>
            <div className={styles.moreModal}>
                <div className={styles.buttonContainer}>
                    <span className={styles.closeBtn}
                          onClick={onClose}>x</span>
                    <button className={styles.editBtn}
                            onClick={() => {
                                setIsEditClicked(true)
                            }}>Edit Flower</button>
                    <button className={styles.deleteBtn}
                            onClick={() => {
                                setIsDeleteClicked(true)
                            }}>Delete Flower</button>
                </div>
            </div>

            {isEditClicked && (
                <EditResponse
                    flower={flower}
                    onClose={() => setIsEditClicked(false)}
                    onSave={(updatedFlower) => {
                        onSave(updatedFlower);
                        setIsEditClicked(false);
                    }}
                />
            )}

            {isDeleteClicked && (
                <DeleteResponse
                    flower={flower}
                    onClose={() => setIsDeleteClicked(false)}
                    onConfirm={() => deleteFlower()}
                />
            )}

            {showDeleteSuccess && (
                <DeleteSuccessful />
            )}
        </>
    );
}