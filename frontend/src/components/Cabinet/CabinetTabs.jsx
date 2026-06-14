import styles from "./styles/CabinetTabs.module.scss";

export default function CabinetTabs({ activeTab, setActiveTab }) {
    const tabs = [
        { key: "personal", label: "Особиста інформація" },
        { key: "medical", label: "Медична карта" },
        { key: "appointments", label: "Записи на прийом" },
        { key: "labs", label: "Аналізи" },
    ];

    return (
        <div className={styles.cabinetTabs}>
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    className={`${styles.tabBtn} ${
                        activeTab === tab.key ? styles.active : ""
                    }`}
                    onClick={() => setActiveTab(tab.key)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}