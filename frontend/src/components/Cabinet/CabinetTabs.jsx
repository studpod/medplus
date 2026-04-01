export default function CabinetTabs({ activeTab, setActiveTab }) {
    const tabs = [
        { key: "personal", label: "Особиста інформація" },
        { key: "medical", label: "Медична карта" },
        { key: "appointments", label: "Записи на прийом" },
    ];

    return (
        <div className="cabinet-tabs">
            {tabs.map(tab => (
                <button
                    key={tab.key}
                    className={`tab-btn ${activeTab === tab.key ? "active" : ""}`}
                    onClick={() => setActiveTab(tab.key)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}