import React, { useEffect, useState } from "react";
import API from "../../api";
import "./video.scss";

export default function StaffVideoRoom() {
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await API.get("/doctor/view/appointments/online");
            setAppointments(res.data.appointments || []);
        } catch (e) {
            console.error("Ошибка загрузки онлайн приемов", e);
        }
    };

    const startCall = async (appointment) => {
        try {
           
            const res = await API.post("/doctor/control/video-call/start", {
                appointment_id: appointment.id
            });

            const roomId = res.data.room_id;

            
            window.open(`/staff/video/waiting/${appointment.id}?room=${roomId}`, "_blank");

        } catch (err) {
            console.error("Не удалось создать звонок", err);
            alert("Не удалось создать видео звонок");
        }
    };

    return (
        <div className="online-page">
            <h1>Онлайн консультації</h1>
            <div className="patients-list">
                {appointments.length === 0 && <p>Немає онлайн записів</p>}

                {appointments.map(a => (
                    <div key={a.id} className="patient-card">
                        <div>
                            <strong>{a.patient_name}</strong>
                            <p>{a.date} | {a.time}</p>
                            <p>Статус: {a.status}</p>
                        </div>
                        <button
                            className="start-btn"
                            onClick={() => startCall(a)}
                        >
                            Почати
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}