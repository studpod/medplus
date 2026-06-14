import React, { useEffect, useState } from "react";
import API from "../../api";
import styles from "./video.module.scss";

export default function StaffVideoRoom() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const res = await API.get("/doctor/view/appointments/online");
            setAppointments(res.data.appointments || []);
        } finally {
            setLoading(false);
        }
    };

    const startCall = async (appointment) => {
        const res = await API.post("/doctor/control/video-call/start", {
            appointment_id: appointment.id
        });

        const roomId = res.data.room_id;

        window.open(
            `/staff/video/waiting/${appointment.id}?room=${roomId}`,
            "_blank"
        );
    };

    const formatTime = (t) => (t ? t.slice(0, 5) : "");

    const formatDate = (date) => {
        const d = new Date(date);
        return `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()}`;
    };

    const getStatus = (status) => {
        switch (status) {
            case "expected":
                return { label: "Очікується", className: styles.expected };
            case "completed":
                return { label: "Завершено", className: styles.done };
            case "cancelled":
                return { label: "Скасовано", className: styles.cancel };
            default:
                return { label: status, className: styles.status };
        }
    };

    return (
        <div className={styles.onlinePage}>
            <h1>Онлайн консультації</h1>

            {loading ? (
                <div>Loading...</div>
            ) : appointments.length === 0 ? (
                <div className={styles.emptyState}>
                    Немає онлайн записів
                </div>
            ) : (
                <div className={styles.videoTable}>

                    <div className={styles.tableHeader}>
                        <div>Пацієнт</div>
                        <div>Дата</div>
                        <div>Статус</div>
                        <div>Дії</div>
                    </div>

                    {appointments.map(a => {
                        const status = getStatus(a.status);

                        return (
                            <div key={a.id} className={styles.tableRow}>

                                <div className={styles.patient}>
                                    <div className={styles.avatar}>👤</div>
                                    <div>
                                        <div className={styles.name}>{a.patient_name}</div>
                                        <div className={styles.time}>🕒 {formatTime(a.time)}</div>
                                    </div>
                                </div>

                                <div>📅 {formatDate(a.date)}</div>

                                <div>
                                    <span className={`${styles.status} ${status.className}`}>
                                        {status.label}
                                    </span>
                                </div>

                                <div>
                                    <button
                                        className={styles.startBtn}
                                        onClick={() => startCall(a)}
                                    >
                                        ▶ Почати
                                    </button>
                                </div>

                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}