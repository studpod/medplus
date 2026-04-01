import "./styles.module.scss";

export default function AppointmentsSection({ appointments, joinOnlineCall }) {

    if (!appointments || appointments.length === 0) return null;

    const getStatusLabel = (status) => {
        switch (status) {
            case "expected": return "Очікується";
            case "completed": return "Завершено";
            case "cancelled": return "Скасовано";
            default: return status;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "expected": return "expected";
            case "completed": return "completed";
            case "cancelled": return "cancelled";
            default: return "";
        }
    };

    return (
        <div className="appointments-section">
            <h2 className="section-title">Мої записи на прийоми</h2>

            <div className="appointments-list">
                {appointments.map(app => {
                    const showJoinBtn =
                        app.is_online === 1 &&
                        app.status === "expected" &&
                        app.video_call?.room_id;

                    return (
                        <div
                            key={app.id}
                            className={`appointment-item ${app.status === "completed" ? "completed" : ""}`}
                        >

                            {/* LEFT */}
                            <div className="appointment-left">

                                {app.doctor?.specialization?.name && (
                                    <div className="specialization">{app.doctor.specialization.name}: {app.doctor?.last_name} {app.doctor?.first_name}
                                        <span className={`type ${app.is_online === 1 ? "online" : "offline"}`}>
                                             {app.is_online === 1 ? "Онлайн консультація" : "Очний прийом"}
                                        </span>
                                    </div>
                                )}

                                {/*<div className="doctor">*/}
                                {/*    {app.doctor?.last_name} {app.doctor?.first_name}*/}
                                {/*</div>*/}

                                <div className="datetime">
                                    <span>{app.date}</span>
                                    <span className="dot">•</span>
                                    <span>{app.time}</span>
                                    <span className={`status ${getStatusClass(app.status)}`}>
                                            {getStatusLabel(app.status)}
                                        </span>
                                </div>

                                {app.services?.length > 0 && (
                                    <div className="services">
                                        {app.services.map(service => (
                                            <span key={service.id} className="service-tag">{service.name}</span>
                                        ))}
                                    </div>
                                )}


                            </div>

                            {/* RIGHT */}
                            {showJoinBtn && (
                                <div className="appointment-right">
                                    <button
                                        className="btn-join"
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