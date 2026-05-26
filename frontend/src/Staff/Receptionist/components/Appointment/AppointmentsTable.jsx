import { Link } from "react-router-dom";
import { FcAlarmClock, FcPlanner } from "react-icons/fc";
import styles from "../../styles/Appointments.module.scss";
import { useState } from "react";
import API from "../../../../api";

export default function AppointmentsTable({ receptions, setReceptions }) {

    const [sortField, setSortField] = useState("date");
    const [sortDir, setSortDir] = useState("asc");

    const formatTime = (time) => time ? time.slice(0, 5) : "";

    const formatDate = (date) => {
        if (!date) return "";
        const d = new Date(date);

        return `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()}`;
    };

    const toggleSort = (field) => {
        const dir =
            sortField === field && sortDir === "asc"
                ? "desc"
                : "asc";

        setSortField(field);
        setSortDir(dir);

        fetchSorted(field, dir);
    };

    const fetchSorted = async (field, dir) => {
        const res = await API.get("/receptionist/view/appointments", {
            params: {
                sort_field: field,
                sort_dir: dir
            }
        });

        setReceptions(res.data.receptions || []);
    };

    const getStatus = (status) => {
        switch (status) {
            case "expected":
                return { label: "Очікується", class: styles.expected };
            case "completed":
                return { label: "Завершено", class: styles.done };
            case "cancelled":
                return { label: "Скасовано", class: styles.cancel };
            case "no_show":
                return { label: "Не з’явився", class: styles.noShow };
            default:
                return { label: status, class: styles.default };
        }
    };

    return (
        <div className={styles.table}>

            {/* HEADER */}
            <div className={styles.header}>

                <div onClick={() => toggleSort("patient")}>
                    Пацієнт {sortField === "patient" && (sortDir === "asc" ? "↑" : "↓")}
                </div>

                <div onClick={() => toggleSort("doctor")}>
                    Лікар {sortField === "doctor" && (sortDir === "asc" ? "↑" : "↓")}
                </div>

                <div>Спеціалізація</div>

                <div onClick={() => toggleSort("date")}>
                    Дата {sortField === "date" && (sortDir === "asc" ? "↑" : "↓")}
                </div>

                <div onClick={() => toggleSort("status")}>
                    Статус {sortField === "status" && (sortDir === "asc" ? "↑" : "↓")}
                </div>

                <div>Дії</div>
            </div>

            {/* ROWS */}
            {receptions.map(r => {
                const status = getStatus(r.status);

                return (
                    <div key={r.id} className={styles.row}>

                        <div className={styles.patient}>
                            <div className={styles.avatar}>👤</div>

                            <div>
                                <div className={styles.name}>
                                    {r.patient?.last_name} {r.patient?.first_name} {r.patient?.middle_name}
                                </div>

                                <div className={styles.time}>
                                    <FcAlarmClock /> {formatTime(r.time)}
                                </div>
                            </div>
                        </div>

                        <div className={styles.doctor}>
                            {r.doctor?.last_name} {r.doctor?.first_name} {r.doctor?.middle_name}
                        </div>

                        <div className={styles.spec}>
                            {r.doctor?.specialization?.name || "—"}
                        </div>

                        <div className={styles.date}>
                            <FcPlanner /> {formatDate(r.date)}
                        </div>

                        <div>
                            <span className={`${styles.status} ${status.class}`}>
                                {status.label}
                            </span>
                        </div>

                        <div className={styles.actions}>
                            <Link to={`/staff/receptionist/appointments/${r.id}/edit`} className={styles.btn}>
                                Детальніше
                            </Link>
                        </div>

                    </div>
                );
            })}
        </div>
    );
}