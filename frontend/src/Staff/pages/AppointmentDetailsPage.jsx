import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api";
import { toast } from "react-toastify";

import AppointmentSkeleton from "../components/Skeletons/AppointmentSkeleton";
import AppointmentHeader from "../components/AppointmentDetails/AppointmentHeader";
import AppointmentInfoCard from "../components/AppointmentDetails/AppointmentInfoCard";
import AppointmentServices from "../components/AppointmentDetails/AppointmentServices";
import ConsultationBlock from "../components/AppointmentDetails/ConsultationBlock";


import "../styles/appointments.scss";

export default function AppointmentDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [appointment, setAppointment] = useState(null);

    const fetchData = async () => {
        const res = await API.get(`/doctor/view/appointment/${id}`);
        setAppointment(res.data.appointment);
    };

    const completeAppointment = async () => {
        try {
            await API.post(`/doctor/control/appointments/${id}/complete`);
            toast.success("Прийом закритий!");
            fetchData();
        } catch (e) {
            toast.error(e.response?.data?.error || "Помилка");
        }
    };

    const formatDate = (date) => {
        const d = new Date(date);
        return `${String(d.getDate()).padStart(2, "0")}.${String(
            d.getMonth() + 1
        ).padStart(2, "0")}.${d.getFullYear()}`;
    };

    const formatTime = (time) => time?.slice(0, 5);

    useEffect(() => {
        fetchData();
    }, [id]);

    if (!appointment) return <AppointmentSkeleton />;

    const goToMedicalCard = () => {
        navigate(`/staff/patient/${appointment.patient.id}/medical-card`);
    };

    const getStatus = () => {
        switch (appointment.status) {
            case "expected":
                return { label: "Очікується", class: "status-expected" };
            case "completed":
                return { label: "Завершено", class: "status done" };
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
    const hasMedicalRecordService = appointment.appointment_services?.some(
        s =>
            ["consultation", "checkup", "diagnostics"].includes(
                s.service?.type
            )
    );



    return (
        <div className="appointment-page">

            <AppointmentHeader status={status} />

            <AppointmentInfoCard
                appointment={appointment}
                onMedicalCard={goToMedicalCard}
                onComplete={completeAppointment}
                formatDate={formatDate}
                formatTime={formatTime}
            />

            <AppointmentServices
                appointment={appointment}
                navigate={navigate}
            />
            {hasMedicalRecordService &&
                ["expected", "completed", "closed"].includes(appointment.status) && (
                <ConsultationBlock
                    appointment={appointment}
                    refresh={fetchData}
                />
            )}


        </div>
    );
}