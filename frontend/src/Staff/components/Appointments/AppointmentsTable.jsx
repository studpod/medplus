import { Link } from "react-router-dom";
import API from "../../../api";
import { FcAlarmClock, FcPlanner } from "react-icons/fc";
export default function AppointmentsTable({ receptions, refresh }) {

    const updateStatus = async (id, status) => {
        try {
            await API.put(
                `/doctor/control/update-status-appointment/${id}/cancelled`
            );

            refresh();
        } catch (e) {
            console.error(e);
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
        const year = d.getFullYear();

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
            case "no_show":
                return { label: "Не з’явився", class: "status no-show" };
            case "closed":
                return { label: "Закритий", class: "status closed" };
            default:
                return { label: status, class: "status" };
        }
    };

    return (
        <div className="appointments-table">

            <div className="table-header">
                <div>Пацієнт</div>
                <div>Дата</div>
                <div>Послуги</div>
                <div>Статус</div>
                <div>Дії</div>
            </div>

            {receptions.map(r => {
                const status = getStatus(r.status);

                return (
                    <div key={r.id} className="table-row">

                        {/* Пацієнт */}
                        <div className="patient">
                            <div className="avatar">👤</div>

                            <div>
                                <div className="name">
                                    {r.patient.last_name} {r.patient.first_name}
                                </div>
                                <div className="time">
                                    <FcAlarmClock /> {formatTime(r.time)}
                                </div>
                            </div>
                        </div>


                        <div className="date">
                            <FcPlanner /> {formatDate(r.date)}
                        </div>


                        <div className="services">
                            {r.appointment_services?.map(s => (
                                <span key={s.id} className="service-tag">
                                    {s.service?.name}
                                </span>
                            ))}
                        </div>


                        <div>
                            <span className={status.class}>
                                {status.label}
                            </span>
                        </div>


                        <div className="actions">

                            <Link
                                to={`/staff/appointments/${r.id}`}
                                className="btn open"
                            >
                                Відкрити
                            </Link>

                            {r.status === "expected" && (
                                <button
                                    className="btn danger"
                                    onClick={() => updateStatus(r.id, "no_show")}
                                >
                                    Не з’явився
                                </button>
                            )}

                        </div>

                    </div>
                );
            })}

        </div>
    );
}