import styles from "../../styles/doctors.module.scss";

export default function ReceptionistsTable({
                                               receptionists = [],
                                               onEdit,
                                               onDelete
                                           }) {

    return (
        <div className={styles.tableCard}>

            <table>

                <thead>
                <tr>
                    <th>ПІБ</th>
                    <th>Телефон</th>
                    <th>Дії</th>
                </tr>
                </thead>

                <tbody>

                {receptionists.length === 0 ? (

                    <tr>
                        <td colSpan="3">
                            Немає працівників
                        </td>
                    </tr>

                ) : (

                    receptionists.map(item => (

                        <tr key={item.id}>

                            <td>
                                {item.last_name}
                                {" "}
                                {item.first_name}
                                {" "}
                                {item.middle_name}
                            </td>

                            <td>
                                {item.phone}
                            </td>

                            <td>

                                <button
                                    className={styles.editBtn}
                                    onClick={() =>
                                        onEdit(item)
                                    }
                                >
                                    Редагувати
                                </button>

                                <button
                                    className={styles.deleteBtnTable}
                                    onClick={() =>
                                        onDelete(item.id)
                                    }
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