import styles from "./DoctorCardSkeleton.module.scss";

export default function DoctorCardSkeleton() {
    return (
        <div className={styles.card}>
            <div className={styles.photo} />

            <div className={styles.info}>
                <div className={styles.lineShort} />
                <div className={styles.lineMedium} />
                <div className={styles.lineLong} />
                <div className={styles.lineLong} />

                <div className={styles.button} />
            </div>
        </div>
    );
}