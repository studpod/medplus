import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api";

import ConsultationBlock from "../components/AppointmentDetails/ConsultationBlock";

import "../../Staff/styles/appointments.scss";

export default function AppointmentDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [appointment, setAppointment] = useState(null);

    const fetchData = async () => {
        const res = await API.get(`/doctor/view/appointment/${id}`);
        setAppointment(res.data.appointment);

    };

    useEffect(() => {
        fetchData();
    }, [id]);

    if (!appointment) return <div>Завантаження...</div>;

    const goToMedicalCard = () => {
        navigate(`/staff/patient/${appointment.patient.id}/medical-card`);
    };

    const getStatus = () => {
        switch (appointment.status) {
            case "expected":
                return { label: "Очікується", class: "status-expected" };
            case "completed":
                return { label: "Завершено", class: "status-done" };
            case "cancelled":
                return { label: "Скасовано", class: "status-cancel" };
            case "no_show":
                return { label: "Не з’явився", class: "status-noShow" };
            case "closed":
                return { label: "Закрито", class: "status-noShow" };
            default:
                return { label: appointment.status, class: "" };
        }
    };

    const status = getStatus();

    return (
        <div className="appointment-page">


            <div className="card info-card">

                <div className="info-header">

                    <div className="left">
                        <div className="avatar">👨‍⚕️</div>

                        <div>
                            <div className="patient-name">
                                {appointment.patient.last_name} {appointment.patient.first_name}
                            </div>

                            <div className="meta">
                                📅 {appointment.date} &nbsp; 🕒 {appointment.time}
                            </div>
                        </div>
                    </div>

                    <div className="right">
                        <div className={`status ${status.class}`}>
                            {status.label}
                        </div>

                        <button
                            className="medical-card-btn"
                            onClick={goToMedicalCard}
                        >
                            📄 Вся медкарта
                        </button>
                    </div>

                </div>

            </div>


            <div className="card services-card">
                <div className="card-title">Послуги</div>

                <div className="services-list">
                    {appointment.appointment_services.map(item => {
                        const isLab = item.service?.type === "lab_test";
                        const hasLab = item.labs_results && item.labs_results.length > 0;

                        return (
                            <div key={item.id} className="service-row">

                                <div>
                                    <div className="service-name">
                                        {item.service?.name}
                                    </div>

                                    <div className="service-type">
                                        {isLab ? "Аналіз" : "Консультація"}
                                    </div>
                                </div>

                                <div className="service-status">


                                    {isLab ? (
                                        hasLab ? (
                                            <span className="done">✅</span>
                                        ) : (
                                            <button
                                                className="add-lab-btn"
                                                onClick={() =>
                                                    navigate(`/staff/analyses/${item.id}`)
                                                }
                                            >
                                                ➕ Додати
                                            </button>
                                        )
                                    ) : (

                                        appointment.medical_record ? "✅" : "⏳"
                                    )}

                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <ConsultationBlock
                appointment={appointment}
                refresh={fetchData}
            />

        </div>
    );
}