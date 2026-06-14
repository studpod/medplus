import styles from "../styles/admin-dashboard.module.scss";

export default function TopDoctors({ doctors }) {

    return (
        <div className={styles.tableCard}>

            <h2>Топ лікарів</h2>

            <table>

                <thead>

                <tr>
                    <th>Лікар</th>
                    <th>Прийомів</th>
                </tr>

                </thead>

                <tbody>

                {doctors.map((doctor) => (

                    <tr key={doctor.id}>

                        <td>
                            {doctor.last_name} {doctor.first_name}
                        </td>

                        <td>
                            {doctor.appointments_count}
                        </td>

                    </tr>

                ))}

                </tbody>

            </table>

        </div>
    );
}