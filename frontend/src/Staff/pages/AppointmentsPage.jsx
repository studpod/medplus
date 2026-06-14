import { useEffect, useState } from "react";
import API from "../../api";
import AppointmentsTable from "../components/Appointments/AppointmentsTable";

export default function AppointmentsPage() {
    const [receptions, setReceptions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);

            const res = await API.get("/doctor/view/appointments");
            setReceptions(res.data.receptions || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="appointments-page">
            <h2>Прийоми</h2>

            {loading ? (
                <AppointmentsSkeleton />
            ) : (
                <AppointmentsTable
                    receptions={receptions}
                    refresh={fetchData}
                />
            )}
        </div>
    );
}

function AppointmentsSkeleton() {
    return (
        <div className="appointments-skeleton">
            {[1,2,3,4,5].map(i => (
                <div key={i} className="skeleton-row">
                    <div className="sk sk-patient"></div>
                    <div className="sk sk-date"></div>
                    <div className="sk sk-services"></div>
                    <div className="sk sk-status"></div>
                    <div className="sk sk-actions"></div>
                </div>
            ))}
        </div>
    );
}