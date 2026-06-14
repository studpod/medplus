import styles from "./styles/AppointmentsSection.module.scss";

export default function AppointmentsSection({ appointments, joinOnlineCall }) {

    if (!appointments || appointments.length === 0) return null;

    const getStatusLabel = (status) => {
        switch (status) {
            case "expected": return "Очікується";
            case "completed": return "Завершено";
            case "cancelled": return "Скасовано";
            case "no_show": return "Не з’явився";
            default: return status;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "expected": return styles.expected;
            case "completed": return styles.completed;
            case "cancelled": return styles.cancelled;
            case "no_show": return styles.noShow;
            default: return "";
        }
    };

    const formatDate = (date) => {
        if (!date) return "";
        const d = new Date(date);

        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();

        return `${day}.${month}.${year}`;
    };

    return (
        <div className={styles.appointmentsSection}>
            <h2 className={styles.sectionTitle}>Мої записи на прийоми</h2>

            <div className={styles.appointmentsList}>
                {appointments.map(app => {
                    const showJoinBtn =
                        app.is_online === 1 &&
                        app.status === "expected" &&
                        app.video_call?.room_id;

                    return (
                        <div
                            key={app.id}
                            className={`${styles.appointmentItem} ${app.status === "completed" ? styles.completed : ""}`}
                        >
                            <div className={styles.appointmentLeft}>

                                {app.doctor?.specialization?.name && (
                                    <div className={styles.specialization}>
                                        {app.doctor.specialization.name}:{" "}
                                        {app.doctor?.last_name} {app.doctor?.first_name}

                                        <span className={`${styles.type} ${app.is_online === 1 ? styles.online : styles.offline}`}>
                                            {app.is_online === 1 ? "Онлайн консультація" : "Очний прийом"}
                                        </span>
                                    </div>
                                )}

                                <div className={styles.datetime}>
                                    <span>{formatDate(app.date)}</span>
                                    <span className={styles.dot}>•</span>
                                    <span>{app.time}</span>

                                    <span className={getStatusClass(app.status)}>
                                        {getStatusLabel(app.status)}
                                    </span>
                                </div>

                                {app.services?.length > 0 && (
                                    <div className={styles.services}>
                                        {app.services.map(service => (
                                            <span key={service.id} className={styles.serviceTag}>
                                                {service.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {showJoinBtn && (
                                <div className={styles.appointmentRight}>
                                    <button
                                        className={styles.joinBtn}
                                        onClick={() => joinOnlineCall(app.video_call.room_id)}
                                    >
                                        Підключитися
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}