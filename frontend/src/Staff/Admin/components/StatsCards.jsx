import {
    FaUserMd,
    FaUsers,
    FaCalendarCheck,
    FaFlask
} from "react-icons/fa";

import styles from "../styles/admin-dashboard.module.scss";

export default function StatsCards({ stats }) {

    const items = [
        {
            title: "Лікарі",
            value: stats.doctors,
            icon: <FaUserMd />
        },
        {
            title: "Пацієнти",
            value: stats.patients,
            icon: <FaUsers />
        },
        {
            title: "Прийоми сьогодні",
            value: stats.appointments_today,
            icon: <FaCalendarCheck />
        },
        {
            title: "Аналізи",
            value: stats.labs,
            icon: <FaFlask />
        }
    ];

    return (
        <div className={styles.statsGrid}>

            {items.map((item, index) => (

                <div
                    className={styles.statCard}
                    key={index}
                >

                    <div className={styles.statIcon}>
                        {item.icon}
                    </div>

                    <div>

                        <h3>{item.value}</h3>

                        <p>{item.title}</p>

                    </div>

                </div>

            ))}

        </div>
    );
}