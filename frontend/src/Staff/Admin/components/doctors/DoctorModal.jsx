import { useState, useEffect } from "react";
import styles from "../../styles/doctors.module.scss";

const emptyForm = {
    firebase_uid: "",

    first_name: "",
    last_name: "",
    middle_name: "",
    phone: "",
    specialization_id: "",
    schedule: []
};

const formatTime = (t) => (t ? t.slice(0, 5) : "");

export default function DoctorModal({
                                        doctor,
                                        specializations = [],
                                        onClose,
                                        onSave
                                    }) {

    const [form, setForm] = useState(emptyForm);

    useEffect(() => {

        if (doctor) {

            setForm({
                firebase_uid: doctor.user?.firebase_uid || "",

                first_name: doctor.first_name || "",
                last_name: doctor.last_name || "",
                middle_name: doctor.middle_name || "",
                phone: doctor.phone || "",
                specialization_id: doctor.specialization_id || "",

                schedule: doctor.schedules?.map(s => ({
                    id: s.id,
                    day_of_week: s.day_of_week,
                    start_time: formatTime(s.start_time),
                    end_time: formatTime(s.end_time)
                })) || []
            });

        } else {

            setForm(emptyForm);
        }

    }, [doctor]);

    const addRow = () => {

        setForm(prev => ({
            ...prev,

            schedule: [
                ...prev.schedule,
                {
                    day_of_week: "Monday",
                    start_time: "09:00",
                    end_time: "18:00"
                }
            ]
        }));
    };

    const update = (i, key, value) => {

        const copy = [...form.schedule];

        copy[i] = {
            ...copy[i],
            [key]: value
        };

        setForm({
            ...form,
            schedule: copy
        });
    };

    const remove = (i) => {

        setForm({
            ...form,
            schedule: form.schedule.filter((_, idx) => idx !== i)
        });
    };

    return (
        <div className={styles.modalOverlay}>

            <div className={styles.modal}>

                <h2>
                    {doctor ? "Редагувати" : "Створити"} лікаря
                </h2>

                {!doctor && (
                    <input
                        placeholder="Firebase UID"
                        value={form.firebase_uid}
                        onChange={e =>
                            setForm({
                                ...form,
                                firebase_uid: e.target.value
                            })
                        }
                    />
                )}

                <input
                    placeholder="Прізвище"
                    value={form.last_name}
                    onChange={e =>
                        setForm({
                            ...form,
                            last_name: e.target.value
                        })
                    }
                />

                <input
                    placeholder="Ім'я"
                    value={form.first_name}
                    onChange={e =>
                        setForm({
                            ...form,
                            first_name: e.target.value
                        })
                    }
                />

                <input
                    placeholder="По батькові"
                    value={form.middle_name}
                    onChange={e =>
                        setForm({
                            ...form,
                            middle_name: e.target.value
                        })
                    }
                />

                <input
                    placeholder="Телефон"
                    value={form.phone}
                    onChange={e =>
                        setForm({
                            ...form,
                            phone: e.target.value
                        })
                    }
                />

                <select
                    value={form.specialization_id}
                    onChange={e =>
                        setForm({
                            ...form,
                            specialization_id: e.target.value
                        })
                    }
                >
                    <option value="">
                        Спеціалізація
                    </option>

                    {specializations.map(s => (
                        <option
                            key={s.id}
                            value={s.id}
                        >
                            {s.name}
                        </option>
                    ))}
                </select>

                <div className={styles.scheduleBlock}>

                    <div className={styles.scheduleHeader}>

                        <h4>Графік роботи</h4>

                        <button
                            type="button"
                            className={styles.addBtn}
                            onClick={addRow}
                        >
                            + Додати день
                        </button>

                    </div>

                    <div className={styles.scheduleList}>

                        {form.schedule.map((s, i) => (

                            <div
                                key={i}
                                className={styles.scheduleRow}
                            >

                                <select
                                    value={s.day_of_week}
                                    onChange={e =>
                                        update(
                                            i,
                                            "day_of_week",
                                            e.target.value
                                        )
                                    }
                                >
                                    {[
                                        "Monday",
                                        "Tuesday",
                                        "Wednesday",
                                        "Thursday",
                                        "Friday",
                                        "Saturday",
                                        "Sunday"
                                    ].map(d => (
                                        <option
                                            key={d}
                                            value={d}
                                        >
                                            {d}
                                        </option>
                                    ))}
                                </select>

                                <input
                                    type="time"
                                    value={s.start_time}
                                    onChange={e =>
                                        update(
                                            i,
                                            "start_time",
                                            e.target.value
                                        )
                                    }
                                />

                                <input
                                    type="time"
                                    value={s.end_time}
                                    onChange={e =>
                                        update(
                                            i,
                                            "end_time",
                                            e.target.value
                                        )
                                    }
                                />

                                <button
                                    type="button"
                                    className={styles.deleteBtn}
                                    onClick={() => remove(i)}
                                >
                                    ✕
                                </button>

                            </div>
                        ))}

                    </div>
                </div>

                <div className={styles.modalActions}>

                    <button onClick={onClose}>
                        Закрити
                    </button>

                    <button onClick={() => onSave(form)}>
                        Зберегти
                    </button>

                </div>

            </div>
        </div>
    );
}