import styles from "../../pages/Departments/DoctorsPage.module.scss";

export default function DoctorsSidebar({
                                           specializations,
                                           selectedSpec,
                                           onSelect,
                                           onShowAll,
                                       }) {
    return (
        <aside className={styles.sidebar}>
            <h3 className={styles.sidebarTitle}>
                Спеціалізації
            </h3>

            <div
                className={`${styles.item} ${
                    !selectedSpec ? styles.active : ""
                }`}
                onClick={onShowAll}
            >
                Усі лікарі
            </div>

            {specializations.map((spec) => (
                <div
                    key={spec.id}
                    className={`${styles.item} ${
                        selectedSpec === spec.id
                            ? styles.active
                            : ""
                    }`}
                    onClick={() => onSelect(spec.id)}
                >
                    {spec.name}
                </div>
            ))}
        </aside>
    );
}