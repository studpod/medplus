import styles from "./SidebarSkeleton.module.scss";

export default function SidebarSkeleton() {
    return (
        <div className={styles.wrapper}>
            <div className={styles.title} />

            <div className={styles.item} />
            <div className={styles.item} />
            <div className={styles.item} />
            <div className={styles.item} />
            <div className={styles.item} />
        </div>
    );
}