import { useEffect, useState } from "react";

import styles from "../../../styles/staffSettings.module.scss";

export default function ReceptionistProfileForm({
                                                    receptionist,
                                                    onSave,
                                                    loading
                                                }) {

    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        middle_name: "",
        phone: ""
    });

    useEffect(() => {

        setForm({
            first_name:
                receptionist.first_name || "",

            last_name:
                receptionist.last_name || "",

            middle_name:
                receptionist.middle_name || "",

            phone:
                receptionist.phone || ""
        });

    }, [receptionist]);

    const handleChange = (e) => {

        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <div className={styles.card}>

            <h2 className={styles.title}>
                Профіль
            </h2>

            <div className={styles.formGrid}>

                <input
                    className={styles.input}
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    placeholder="Прізвище"
                />

                <input
                    className={styles.input}
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    placeholder="Ім'я"
                />

                <input
                    className={styles.input}
                    name="middle_name"
                    value={form.middle_name}
                    onChange={handleChange}
                    placeholder="По батькові"
                />

                <input
                    className={styles.input}
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Телефон"
                />

                <input
                    className={styles.input}
                    value="Працівник реєстратури"
                    disabled
                />

            </div>

            <button
                className={styles.button}
                onClick={() => onSave(form)}
                disabled={loading}
            >
                {loading ? "..." : "Зберегти"}
            </button>

        </div>
    );
}