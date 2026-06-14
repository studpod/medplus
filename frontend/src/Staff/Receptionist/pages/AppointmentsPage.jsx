import { useEffect, useState } from "react";
import API from "../../../api";

import AppointmentsTable from "../components/Appointment/AppointmentsTable";
import styles from "../styles/Appointments.module.scss";
import ReceptionistSkeleton from "../components/Skeleton/Appointments/ReceptionistSkeleton";

export default function AppointmentsPage() {

    const [receptions, setReceptions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [doctors, setDoctors] = useState([]);

    const [search, setSearch] = useState("");
    const [doctorId, setDoctorId] = useState("");
    const [status, setStatus] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    // =====================
    // LOAD DOCTORS
    // =====================
    const fetchDoctors = async () => {
        try {
            const res = await API.get("/receptionist/view/doctors");
            setDoctors(res.data.doctors || []);
        } catch (e) {
            console.error(e);
        }
    };

    // =====================
    // LOAD APPOINTMENTS
    // =====================
    const fetchAppointments = async () => {
        try {
            setLoading(true);

            const res = await API.get("/receptionist/view/appointments", {
                params: {
                    search,
                    doctor_id: doctorId,
                    status,
                    date_from: dateFrom,
                    date_to: dateTo
                }
            });

            setReceptions(res.data.receptions || []);

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // =====================
    // INIT
    // =====================
    useEffect(() => {
        fetchDoctors();
        fetchAppointments();
    }, []);

    return (
        <div className={styles.page}>

            <div className={styles.header}>
                <h2>Усі прийоми</h2>
                <p>Керування записами пацієнтів</p>
            </div>

            {/* FILTERS */}
            <div className={styles.filters}>

                <input
                    placeholder="Пошук ПІБ..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                >
                    <option value="">Всі лікарі</option>

                    {doctors.map(d => (
                        <option key={d.id} value={d.id}>
                            {d.full_name} — {d.specialization}
                        </option>
                    ))}
                </select>

                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option value="">Всі статуси</option>
                    <option value="expected">Очікується</option>
                    <option value="completed">Завершено</option>
                    <option value="cancelled">Скасовано</option>
                </select>

                <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                />

                <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                />

                <button onClick={fetchAppointments}>
                    Застосувати
                </button>

            </div>

            {/* TABLE */}
            {loading ? (
                <ReceptionistSkeleton />
            ) : (
                <AppointmentsTable
                    receptions={receptions}
                    setReceptions={setReceptions}

                />
            )}

        </div>
    );
}