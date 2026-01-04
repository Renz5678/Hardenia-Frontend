import styles from './TaskPosting.module.css'
import {useState, useEffect} from "react";
import {useAuth} from '../../../contexts/AuthContext.jsx'

export default function MostStages() {
    const [mostStage, setMostStage] = useState("");
    const [loading, setLoading] = useState(true);
    const {getToken} = useAuth();

    const getMostCommonStage = (growthData) => {
        if (!growthData || growthData.length === 0) return "";

        // Count occurrences of each stage
        const stageCounts = growthData.reduce((acc, item) => {
            acc[item.stage] = (acc[item.stage] || 0) + 1;
            return acc;
        }, {});

        // Find the stage with the highest count
        const mostCommon = Object.keys(stageCounts).reduce((max, stage) =>
            stageCounts[stage] > stageCounts[max] ? stage : max
        );

        return mostCommon;
    }

    const getAllGrowth = async () => {
        try {
            const token = await getToken();
            const response = await fetch("https://flower-backend-latest-8vkl.onrender.com/growth", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok)
                throw new Error("failed to fetch growth");

            const growthData = await response.json();
            const commonStage = getMostCommonStage(growthData);
            setMostStage(commonStage);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getAllGrowth();
    }, []);

    return (
        <>
            <div className={styles.mostStages}>
                {loading ? (
                    "Loading..."
                ) : mostStage ? (
                    `Most plants are in ${mostStage} stage`
                ) : (
                    "No plant yet."
                )}
            </div>
        </>
    );
}