import React from "react";
import "./video.scss";

export default function StaffVideoRoom() {
    const fakePatients = [
        { id: 1, name: "Іван Петренко" },
        { id: 2, name: "Марія Коваль" }
    ];

    const startCall = (patient) => {

        const url = `/staff/video/waiting/${patient.id}`;
        window.open(url, "_blank");
    };

    return (
        <div className="online-page">
            <h1>Онлайн консультації</h1>
            <div className="patients-list">
                {fakePatients.map(p => (
                    <div key={p.id} className="patient-card">
                        <div>
                            <strong>{p.name}</strong>
                            <p>Очікує онлайн прийом</p>
                        </div>
                        <button className="start-btn" onClick={() => startCall(p)}>
                            Почати
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}