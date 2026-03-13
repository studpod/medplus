import React, { useEffect, useState } from "react";
import API from "../../api";
import AppointmentsTable from "../components/Appointments/AppointmentsTable";

export default function AppointmentsPage() {
    const [receptions, setReceptions] = useState(() => {
        const cached = localStorage.getItem("receptions_list");
        return cached ? JSON.parse(cached) : [];
    });

    const [loading, setLoading] = useState(!receptions.length);

    useEffect(() => {
        const fetchReceptions = async () => {
            try {
                if (!receptions.length) {
                    const res = await API.get("/doctor/view/appointments");
                    console.log(res.data.receptions)

                    setReceptions(res.data.receptions || []);

                    localStorage.setItem(
                        "receptions_list",
                        JSON.stringify(res.data.receptions || [])
                    );
                }
            } catch (err) {
                console.error("Помилка завантаження прийомів:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchReceptions();
    }, [receptions.length]);

    if (loading) return <div>Завантаження прийомів...</div>;

    return <AppointmentsTable receptions={receptions} setReceptions={setReceptions}  />;
}