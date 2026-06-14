import { useEffect, useState } from "react";

import styles from "../styles/admin-dashboard.module.scss";

import StatsCards from "../components/StatsCards";
import AppointmentsChart from "../components/AppointmentsChart";
import PatientsChart from "../components/PatientsChart";
import TopDoctors from "../components/TopDoctors";

import { getDashboardStats } from "../../../api/admin";

export default function AdminDashboard({ user }) {

    const [dashboardData, setDashboardData] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadDashboard();

    }, []);

    const loadDashboard = async () => {

        try {

            const data = await getDashboardStats();

            setDashboardData(data);

        } catch (err) {

            console.log(err);

        } finally {

            setLoading(false);
        }
    };

    if (loading) {

        return (
            <div className={styles.loading}>
                Завантаження...
            </div>
        );
    }

    return (
        <div className={styles.adminDashboard}>

            <div className={styles.dashboardHeader}>

                <div>

                    <h1>Admin Dashboard</h1>

                    <p>
                        Вітаємо, ADMIN
                    </p>

                </div>

            </div>

            <StatsCards stats={dashboardData.stats} />

            <div className={styles.chartsGrid}>

                <AppointmentsChart
                    data={dashboardData.appointments_week}
                />

                <PatientsChart
                    data={dashboardData.patients_by_month}
                />

            </div>

            <TopDoctors
                doctors={dashboardData.top_doctors}
            />

        </div>
    );
}