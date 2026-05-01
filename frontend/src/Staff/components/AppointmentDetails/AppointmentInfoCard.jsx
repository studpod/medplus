import { FaCheck, FaNotesMedical } from "react-icons/fa";
import { FcClock, FcOvertime } from "react-icons/fc";

export default function AppointmentInfoCard({
                                                appointment,
                                                onMedicalCard,
                                                onComplete,
                                                formatDate,
                                                formatTime
                                            }) {
    return (
        <div className="card info-card">
            <div className="info-header">

                <div className="left">
                    <div className="avatar">👨‍⚕️</div>

                    <div>
                        <div className="patient-name">
                            {appointment.patient.last_name} {appointment.patient.first_name} {appointment.patient.middle_name}
                        </div>

                        <div className="meta">
                            <FcOvertime/> {formatDate(appointment.date)}
                            &nbsp;
                            <FcClock /> {formatTime(appointment.time)}
                        </div>

                        <button
                            className="btn secondary"
                            onClick={onMedicalCard}
                        >
                            <FaNotesMedical style={{ marginRight: 6 }} />
                            Медкарта
                        </button>
                    </div>
                </div>

                <div className="right">
                    {appointment.status === "expected" && (
                        <button
                            className="btn success"
                            onClick={onComplete}
                        >
                            <FaCheck style={{ marginRight: 6 }} />
                            Завершити
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}