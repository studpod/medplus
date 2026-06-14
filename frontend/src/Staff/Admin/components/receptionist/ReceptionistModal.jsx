import { useState, useEffect } from "react";
import styles from "../../styles/doctors.module.scss";

const emptyForm = {
    firebase_uid: "",

    first_name: "",
    last_name: "",
    middle_name: "",
    phone: ""
};

export default function ReceptionistModal({
                                              receptionist,
                                              onClose,
                                              onSave
                                          }) {

    const [form, setForm] =
        useState(emptyForm);

    useEffect(() => {

        if (receptionist) {

            setForm({
                firebase_uid:
                    receptionist.user?.firebase_uid || "",

                first_name:
                    receptionist.first_name || "",

                last_name:
                    receptionist.last_name || "",

                middle_name:
                    receptionist.middle_name || "",

                phone:
                    receptionist.phone || ""
            });

        } else {

            setForm(emptyForm);
        }

    }, [receptionist]);

    return (
        <div className={styles.modalOverlay}>

            <div className={styles.modal}>

                <h2>
                    {receptionist
                        ? "Редагувати"
                        : "Створити"} працівника
                </h2>

                {!receptionist && (
                    <input
                        placeholder="Firebase UID"
                        value={form.firebase_uid}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                firebase_uid:
                                e.target.value
                            })
                        }
                    />
                )}

                <input
                    placeholder="Прізвище"
                    value={form.last_name}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            last_name:
                            e.target.value
                        })
                    }
                />

                <input
                    placeholder="Ім'я"
                    value={form.first_name}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            first_name:
                            e.target.value
                        })
                    }
                />

                <input
                    placeholder="По батькові"
                    value={form.middle_name}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            middle_name:
                            e.target.value
                        })
                    }
                />

                <input
                    placeholder="Телефон"
                    value={form.phone}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            phone:
                            e.target.value
                        })
                    }
                />

                <div className={styles.modalActions}>

                    <button onClick={onClose}>
                        Закрити
                    </button>

                    <button
                        onClick={() => onSave(form)}
                    >
                        Зберегти
                    </button>

                </div>

            </div>

        </div>
    );
}