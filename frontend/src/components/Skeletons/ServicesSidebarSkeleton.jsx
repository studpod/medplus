import styles from "../../pages/Services/ServicesPage.module.scss";

export default function ServicesSidebarSkeleton() {
    return (
        <>
            {Array(6).fill(0).map((_, i) => (
                <div key={i} className={styles.skeletonItem} />
            ))}
        </>
    );
}