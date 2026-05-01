import React, { useEffect, useState } from "react";
import API from "../../api";
import "./video.module.scss";

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
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const startCall = async (appointment) => {
        try {
            const res = await API.post("/doctor/control/video-call/start", {
                appointment_id: appointment.id
            });

            const roomId = res.data.room_id;

            window.open(
                `/staff/video/waiting/${appointment.id}?room=${roomId}`,
                "_blank"
            );
        } catch (err) {
            console.error(err);
            alert("Не вдалося створити дзвінок");
        }
    };

    const formatTime = (time) => {
        if (!time) return "";
        return time.slice(0, 5);
    };


    const formatDate = (date) => {
        if (!date) return "";

        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = String(d.getFullYear()).slice(-2);

        return `${day}.${month}.${year}`;
    };

    const getStatus = (status) => {
        switch (status) {
            case "expected":
                return { label: "Очікується", class: "status expected" };
            case "completed":
                return { label: "Завершено", class: "status done" };
            case "cancelled":
                return { label: "Скасовано", class: "status cancel" };
            default:
                return { label: status, class: "status" };
        }
    };

    return (
        <div className="online-page">
            <h1>Онлайн консультації</h1>

            {loading ? (
                <VideoSkeleton />
            ) : appointments.length === 0 ? (
                <div className="empty-state">
                    Немає онлайн записів
                </div>
            ) : (
                <div className="video-table">

                    {/* HEADER */}
                    <div className="table-header">
                        <div>Пацієнт</div>
                        <div>Дата</div>
                        <div>Статус</div>
                        <div>Дії</div>
                    </div>

                    {appointments.map(a => {
                        const status = getStatus(a.status);

                        return (
                            <div key={a.id} className="table-row">

                                {/* Пацієнт */}
                                <div className="patient">
                                    <div className="avatar">👤</div>
                                    <div>
                                        <div className="name">{a.patient_name}</div>
                                        <div className="time">
                                            🕒 {formatTime(a.time)}
                                        </div>
                                    </div>
                                </div>

                                {/* Дата */}
                                <div>
                                    📅 {formatDate(a.date)}
                                </div>

                                {/* Статус */}
                                <div>
                                    <span className={status.class}>
                                        {status.label}
                                    </span>
                                </div>

                                {/* Дії */}
                                <div>
                                    <button
                                        className="start-btn"
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


function VideoSkeleton() {
    return (
        <div className="video-table">
            {[1,2,3,4].map(i => (
                <div key={i} className="table-row skeleton">
                    <div className="sk sk-line"></div>
                    <div className="sk sk-line"></div>
                    <div className="sk sk-line"></div>
                    <div className="sk sk-btn"></div>
                </div>
            ))}
        </div>
    );
}