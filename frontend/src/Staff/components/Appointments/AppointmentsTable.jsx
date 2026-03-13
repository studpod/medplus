import { Link } from "react-router-dom";
import "../../styles/appointments.scss";
import API from "../../../api";
import { useState } from "react";

export default function AppointmentsTable({ receptions, setReceptions }) {
    const [loadingIds, setLoadingIds] = useState([]);

    const formatDate = (date) => {
        if (!date) return "-";
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}.${month}.${year}`;
    };

    const formatTime = (time) => {
        if (!time) return "-";
        return time.slice(0, 5);
    };

    const getDisplayStatus = (appointment) => {
        const lastLog = appointment.status_logs?.[appointment.status_logs.length - 1];
        const currentStatus = lastLog?.new_status || appointment.status;

        switch (currentStatus) {
            case "expected":
                return { label: "Очікування", class: "status-expected" };

            case "completed":
            case "closed":
                return { label: "Закритий", class: "status-completed" };

            case "cancelled":
                return {
                    label: "Відмінено пацієнтом",
                    class: "status-cancelled",
                    warning: true,
                    tooltip: "Пацієнт відмінив прийом"
                };

            case "no_show":
                return {
                    label: "Пацієнт не з’явився",
                    class: "status-cancelled",
                    warning: true,
                    tooltip: "Пацієнт не прийшов на прийом"
                };

            default:
                return { label: currentStatus, class: "" };
        }
    };

    const markNoShow = async (appointmentId) => {
        try {
            setLoadingIds(prev => [...prev, appointmentId]);
            const res = await API.put(`/doctor/control/update-status-appointment/${appointmentId}/cancelled`);

            setReceptions(prev =>
                prev.map(r =>
                    r.id === appointmentId
                        ? { ...r, status: "no_show", status_logs: res.data.logs }
                        : r
                )
            );

            localStorage.removeItem("receptions_list");

        } catch (err) {
            console.error("Помилка при відмітці неявки:", err);
        } finally {
            setLoadingIds(prev => prev.filter(id => id !== appointmentId));
        }
    };

    if (!receptions.length) {
        return <div className="appointments-empty">Прийомів немає</div>;
    }

    return (
        <div className="appointments-page">
            <div className="appointments-header">
                <h2>Прийоми</h2>
            </div>

            <div className="appointments-card">
                <table className="appointments-table">
                    <thead>
                    <tr>
                        <th>Пацієнт</th>
                        <th>Дата</th>
                        <th>Час</th>
                        <th>Статус</th>
                        <th>Дії</th>
                    </tr>
                    </thead>
                    <tbody>
                    {receptions.map((r) => {
                        const display = getDisplayStatus(r);
                        const isNoShowBtn = r.status === "expected";

                        return (
                            <tr key={r.id}>
                                <td>{r.patient ? `${r.patient.last_name} ${r.patient.first_name}` : "Не вказано"}</td>
                                <td>{formatDate(r.date)}</td>
                                <td>{formatTime(r.time)}</td>
                                <td className="status-cell">
                                        <span className={`status ${display.class}`} title={display.tooltip || ""}>
                                            {display.label} {display.warning ? "!" : ""}
                                        </span>
                                </td>
                                <td className="actions-cell">
                                    {r.patient && (
                                        <Link to={`/staff/patient/${r.patient.id}/medical-card`}>
                                            <button className="view-btn">Медична картка</button>
                                        </Link>
                                    )}
                                    {isNoShowBtn && (
                                        <button
                                            className="no-show-btn"
                                            disabled={loadingIds.includes(r.id)}
                                            title="Позначити, що пацієнт не з’явився на прийом"
                                            onClick={() => markNoShow(r.id)}
                                        >
                                            Не з’явився
                                        </button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}