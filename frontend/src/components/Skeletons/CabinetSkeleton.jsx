import styles from "./CabinetSkeleton.module.scss";

export default function CabinetSkeleton() {
    return (
        <div className={styles.wrapper}>

            {/* TABS */}
            <div className={styles.tabs}>
                <div className={styles.tab}></div>
                <div className={styles.tab}></div>
                <div className={styles.tab}></div>
            </div>

            <div className={styles.content}>

                {/* PERSONAL CARD */}
                <div className={styles.card}>
                    <div className={styles.header}>
                        <div className={styles.title}></div>
                        <div className={styles.btn}></div>
                    </div>

                    <div className={styles.line}></div>
                    <div className={styles.line}></div>
                    <div className={styles.line}></div>
                </div>

                {/* RECORDS */}
                <div className={styles.card}>
                    <div className={styles.header}>
                        <div className={styles.title}></div>
                    </div>

                    <div className={styles.record}>
                        <div className={styles.block}></div>
                        <div className={styles.block}></div>
                    </div>

                    <div className={styles.record}>
                        <div className={styles.block}></div>
                        <div className={styles.block}></div>
                    </div>
                </div>

                {/* APPOINTMENTS */}
                <div className={styles.card}>
                    <div className={styles.header}>
                        <div className={styles.title}></div>
                    </div>

                    <div className={styles.appointment}></div>
                    <div className={styles.appointment}></div>
                    <div className={styles.appointment}></div>
                </div>

            </div>
        </div>
    );
}