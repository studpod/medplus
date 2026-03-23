import { useState, useEffect } from "react";
import API from "../../api";
import "./Cabinet.scss";

import PersonalSection from "../../components/Cabinet/PersonalSection";
import MedicalRecordsSection from "../../components/Cabinet/MedicalRecordsSection";

export default function Cabinet() {
    const [patientData, setPatientData] = useState({});
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profileRes = await API.get("/patient/view/profile");
                setPatientData(profileRes.data.patient || {});
            } catch (err) {
                console.error("Помилка профілю", err);
                setPatientData({});
            }
        };

        const fetchMedical = async () => {
            try {
                const medicalRes = await API.get("/patient/view/medical-records");
                setMedicalRecords(medicalRes.data.medical_records || []);
            } catch (err) {
                console.error("Помилка медичних записів", err);
                setMedicalRecords([]);
            }
        };

        const fetchAppointments = async () => {
            try {
                const res = await API.get("/patient/view/receptions");
                setAppointments(res.data.receptions || []);
            } catch (err) {
                console.error("Помилка завантаження прийомів", err);
                setAppointments([]);
            }
        };

        Promise.all([fetchProfile(), fetchMedical(), fetchAppointments()])
            .finally(() => setLoading(false));
    }, []);

    const joinOnlineCall = (roomId) => {
        window.open(`/patient/video/${roomId}`, "_blank");
    };

    if (loading) return <p>Завантаження...</p>;

    return (
        <div className="cabinet-page">
            <div className="cabinet-content">
                <PersonalSection patientData={patientData} />
                <MedicalRecordsSection records={medicalRecords} />

                <div className="appointments-section">
                    <h2>Мої прийоми</h2>
                    {appointments.length === 0 && <p>Немає записів</p>}

                    {appointments.map(app => (
                        <div key={app.id} className="appointment-card">
                            <div>
                                <strong>Лікар: {app.doctor.user.first_name} {app.doctor.user.last_name}</strong>
                                <p>Дата: {app.date} | Час: {app.time}</p>
                                <p>Статус: {app.status}</p>
                            </div>

                            {app.is_online && app.status === "expected" && (
                                <button
                                    className="join-btn"
                                    onClick={() => joinOnlineCall(app.video_call?.room_id)}
                                >
                                    Підключитися до онлайн консультації
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}