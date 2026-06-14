import styles from "../../../styles/ReceptionistPatientsPage.module.scss";

export default function ReceptionistPatientsSkeleton() {

    return (
        <div className={styles.skeleton}>

            {[1,2,3,4,5,6].map(i => (

                <div
                    key={i}
                    className={styles.skeletonRow}
                >

                    <div className={styles.skName}></div>
                    <div className={styles.skText}></div>
                    <div className={styles.skText}></div>
                    <div className={styles.skBadge}></div>

                </div>

            ))}

        </div>
    );
}