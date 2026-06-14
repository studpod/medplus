import styles from "../../pages/Services/ServicesPage.module.scss";
export default function ServicesTableSkeleton() {
    return (
        <tbody>
        {Array(6).fill(0).map((_, i) => (
            <tr key={i} className={styles.skeletonRow}>
                <td><div className={styles.skeletonLine} /></td>
                <td><div className={styles.skeletonLine} /></td>
                <td><div className={styles.skeletonLineLong} /></td>
                <td><div className={styles.skeletonLine} /></td>
            </tr>
        ))}
        </tbody>
    );
}