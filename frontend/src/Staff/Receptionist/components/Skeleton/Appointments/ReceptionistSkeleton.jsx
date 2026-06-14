import styles from "../../../styles/Appointments.module.scss";

export default function ReceptionistSkeleton() {
    return (
        <div className={styles.skeletonTable}>

            <div className={styles.skeletonHeader}>
                <div className={styles.skText}></div>
                <div className={styles.skText}></div>
                <div className={styles.skText}></div>
                <div className={styles.skText}></div>
                <div className={styles.skText}></div>
                <div className={styles.skText}></div>
            </div>


            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={styles.skeletonRow}>

                    <div className={styles.skPatient}></div>
                    <div className={styles.skText}></div>
                    <div className={styles.skText}></div>
                    <div className={styles.skText}></div>
                    <div className={styles.skStatus}></div>
                    <div className={styles.skButton}></div>

                </div>
            ))}
        </div>
    );
}