import styles from './Logout.module.css'
import {useAuth} from "../../../../contexts/AuthContext.jsx";

export default function Logout() {
    const {signOut} = useAuth()

    const handleLogout = async () => {
        try {
            await signOut();
        } catch (e) {
            console.log(e)
        }
    }
    return (
        <>
            <button className={styles.logoutBtn}>
                Log Out :)
            </button>
        </>
    );
}