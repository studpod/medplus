import styles from "../../styles/services.module.scss";

export default function ServicesTable({ services, onEdit, onDelete }) {
    return (
        <table className={styles.table}>
            <thead>
            <tr>
                <th>Назва</th>
                <th>Тип</th>
                <th>Ціна</th>
                <th>Дії</th>
            </tr>
            </thead>

            <tbody>
            {services.length === 0 ? (
                <tr>
                    <td colSpan="4">Немає послуг</td>
                </tr>
            ) : (
                services.map(s => (
                    <tr key={s.id}>
                        <td>{s.name}</td>
                        <td>{s.type}</td>
                        <td>{s.price} грн</td>

                        <td>
                            <div className={styles.actions}>
                                <button
                                    className={styles.editBtn}
                                    onClick={() => onEdit(s)}
                                >
                                    Edit
                                </button>

                                <button
                                    className={styles.deleteBtn}
                                    onClick={() => onDelete(s.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </td>
                    </tr>
                ))
            )}
            </tbody>
        </table>
    );
}