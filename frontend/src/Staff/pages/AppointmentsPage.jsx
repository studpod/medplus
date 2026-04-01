import { useEffect, useState } from "react";
import API from "../../api";
import AppointmentsTable from "../components/Appointments/AppointmentsTable";

export default function AppointmentsPage() {
    const [receptions, setReceptions] = useState([]);

    const fetchData = async () => {
        try {
            const res = await API.get("/doctor/view/appointments");
            setReceptions(res.data.receptions || []);
            console.log(res.data.receptions)
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="appointments-page">
            <h2>Прийоми</h2>

            <AppointmentsTable
                receptions={receptions}
                refresh={fetchData}
            />
        </div>
    );
}