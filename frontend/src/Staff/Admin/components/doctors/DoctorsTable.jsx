import styles from "../../styles/doctors.module.scss";

export default function DoctorsTable({
                                         doctors = [],
                                         onEdit,
                                         onDelete
                                     }) {
    return (
        <div className={styles.tableCard}>

            <table>

                <thead>
                <tr>
                    <th>ПІБ</th>
                    <th>Спеціалізація</th>
                    <th>Телефон</th>
                    <th>Дії</th>
                </tr>
                </thead>

                <tbody>

                {doctors.length === 0 ? (
                    <tr>
                        <td colSpan="4">Немає лікарів</td>
                    </tr>
                ) : (
                    doctors.map(doc => (
                        <tr key={doc.id}>

                            <td>
                                {doc.last_name} {doc.first_name} {doc.middle_name}
                            </td>

                            <td>
                                {doc.specialization?.name || "—"}
                            </td>

                            <td>{doc.phone}</td>

                            <td>
                                <button
                                    className={styles.editBtn}
                                    onClick={() => onEdit(doc)}
                                >
                                    Редагувати
                                </button>

                                <button
                                    className={styles.deleteBtnTable}
                                    onClick={() => onDelete(doc.id)}
                                >
                                    Видалити
                                </button>
                            </td>

                        </tr>
                    ))
                )}

                </tbody>

            </table>

        </div>
    );
}