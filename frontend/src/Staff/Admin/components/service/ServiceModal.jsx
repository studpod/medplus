import { useState, useEffect } from "react";
import styles from "../../styles/services.module.scss";

const empty = {
    specialization_id: "",
    name: "",
    description: "",
    price: "",
    type: "consultation"
};

export default function ServiceModal({
                                         service,
                                         specializations = [],
                                         onClose,
                                         onSave
                                     }) {

    const [form, setForm] = useState(empty);

    useEffect(() => {

        if (service) {
            setForm({
                specialization_id:
                    service.specialization_id ??
                    service.specialization?.id ??
                    "",

                name: service.name || "",
                description: service.description || "",
                price: service.price || "",
                type: service.type || "consultation"
            });
        } else {
            setForm(empty);
        }

    }, [service]);

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>

                <h2>
                    {service ? "Редагування" : "Створення"} послуги
                </h2>

                {/* 🔥 FIXED REQUIRED FIELD */}
                <select
                    value={form.specialization_id}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            specialization_id: e.target.value
                        })
                    }
                >
                    <option value="">
                        Оберіть спеціалізацію
                    </option>

                    {specializations.map(s => (
                        <option key={s.id} value={s.id}>
                            {s.name}
                        </option>
                    ))}
                </select>

                <input
                    placeholder="Назва"
                    value={form.name}
                    onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                    }
                />

                <textarea
                    placeholder="Опис"
                    value={form.description}
                    onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                    }
                />

                <input
                    type="number"
                    placeholder="Ціна"
                    value={form.price}
                    onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                    }
                />

                <select
                    value={form.type}
                    onChange={(e) =>
                        setForm({ ...form, type: e.target.value })
                    }
                >
                    <option value="consultation">Консультація</option>
                    <option value="lab_test">Аналіз</option>
                    <option value="procedure">Процедура</option>
                    <option value="checkup">Огляд</option>
                    <option value="diagnostics">Діагностика</option>
                </select>

                <div className={styles.modalActions}>
                    <button onClick={onClose}>Закрити</button>
                    <button onClick={() => onSave(form)}>
                        Зберегти
                    </button>
                </div>

            </div>
        </div>
    );
}