import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from "recharts";

import styles from "../styles/admin-dashboard.module.scss";

export default function AppointmentsChart({ data }) {

    return (
        <div className={styles.chartCard}>

            <h2>Прийоми за тиждень</h2>

            <ResponsiveContainer width="100%" height={300}>

                <LineChart data={data}>

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="day" />


                    <YAxis allowDecimals={false}/>

                    <Tooltip />

                    <Line
                        type="monotone"
                        dataKey="appointments"
                        stroke="#2563eb"
                        strokeWidth={3}
                    />

                </LineChart>

            </ResponsiveContainer>

        </div>
    );
}