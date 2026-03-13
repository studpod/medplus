import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api";
import "../styles/patient.scss";

export default function PatientsPage() {
    const [patients, setPatients] = useState(() => {
        const cached = localStorage.getItem("patients_list");
        return cached ? JSON.parse(cached) : [];
    });
    const [loading, setLoading] = useState(!patients.length);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                // Якщо кешу немає або він старий, робимо запит
                if (!patients.length) {
                    const res = await API.get("/doctor/view/patient/all");
                    setPatients(res.data.patients || []);


                    localStorage.setItem(
                        "patients_list",
                        JSON.stringify(res.data.patients || [])
                    );
                }
            } catch (err) {
                console.error("Помилка завантаження пацієнтів:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, [patients.length]);

    if (loading) return <div>Завантаження пацієнтів...</div>;
    if (!patients.length) return <div>Пацієнтів немає</div>;

    return (
        <div className="patients-page" style={{ padding: "20px" }}>
            <h2>Список пацієнтів</h2>
            <table className="patients-table">
                <thead>
                <tr>
                    <th>ПІБ</th>
                    <th>Дата народження</th>
                    <th>Телефон</th>
                    <th>Email</th>
                    <th>Дії</th>
                </tr>
                </thead>
                <tbody>
                {patients.map((p) => (
                    <tr key={p.id}>
                        <td>{p.last_name} {p.first_name} {p.middle_name}</td>
                        <td>{p.date_of_birth}</td>
                        <td>{p.phone}</td>
                        <td>{p.user?.email || "-"}</td>
                        <td>
                            <Link to={`/staff/patient/${p.id}/medical-card`}>
                                <button>Медична картка</button>
                            </Link>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}