import styles from './DeleteResponse.module.css'
import { useRef, useEffect } from 'react';

export default function DeleteResponse({ onClose, onConfirm }) {
    const modalRef = useRef(null);

    const handleConfirm = async (e) => {
        e.stopPropagation(); // Prevent event bubbling
        console.log('Delete confirmed, calling onConfirm...');
        await onConfirm();
        console.log('onConfirm completed');
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        }

        function handleEscape(event) {
            if (event.key === 'Escape') {
                onClose();
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    return(
        <>
            <div className={styles.deleteModalOverlay} onClick={(e) => e.stopPropagation()}>
                <div ref={modalRef} className={styles.deleteModal}>
                    <h1>Are you sure to delete this task?</h1>

                    <div className={styles.buttonContainer}>
                        <button className={styles.yes} onClick={handleConfirm}>Yes</button>
                        <button className={styles.no} onClick={onClose}>No</button>
                    </div>
                </div>
            </div>
        </>
    )
}