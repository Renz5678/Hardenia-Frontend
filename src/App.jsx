import styles from './App.module.css';
import OverviewBar from './Parts/OverviewBar/OverviewBar.jsx'
import Container from "./Parts/Container/Container.jsx";

function App() {
    return (
        <>
            <div className={styles.backGround}>
                <Container />
                <OverviewBar />
            </div>

        </>);
}

export default App;