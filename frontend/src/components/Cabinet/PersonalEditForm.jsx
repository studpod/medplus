import { useState } from "react";
import styles from "./Personal.module.scss";
import API from "../../api";
import {toast} from "react-toastify";

export default function PersonalEditForm({ data, onSave, onCancel }) {
    const [formData, setFormData] = useState({ ...data });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            const url = data.id
                ? "/patient/control/profile/personal-info/update"
                : "/patient/control/profile/personal-info/add";
            const method = data.id ? "put" : "post";
            toast.success("Особисті дані успішно оновленно!")
            const res = await API[method](url, formData);
            const result = res.data;

            onSave(result.patient || formData);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Помилка при оновленні даних");
        }
    };

    return (
        <>
            {/* HEADER */}
            <div className={styles.piHeader}>
                <div className={`${styles.piAvatar} ${styles[formData.gender]}`}>
                    {(formData.last_name?.[0] || "") + (formData.first_name?.[0] || "")}
                </div>
                <div className={styles.fioRow}>
                    <div className={styles.inputField}>
                        <label>Прізвище</label>
                        <input name="last_name" value={formData.last_name || ""} onChange={handleChange} />
                    </div>
                    <div className={styles.inputField}>
                        <label>Ім’я</label>
                        <input name="first_name" value={formData.first_name || ""} onChange={handleChange} />
                    </div>
                    <div className={styles.inputField}>
                        <label>По батькові</label>
                        <input name="middle_name" value={formData.middle_name || ""} onChange={handleChange} />
                    </div>
                </div>
            </div>

            {/* CONTACT */}
            <div className={styles.piSection}>
                <div className={styles.formGrid}>
                    <div className={styles.inputField}>
                        <label>Телефон</label>
                        <input name="phone" value={formData.phone || ""} onChange={handleChange} />
                    </div>
                    <div className={styles.inputField}>
                        <label>Адреса</label>
                        <input name="address" value={formData.address || ""} onChange={handleChange} />
                    </div>
                    <div className={styles.inputField}>
                        <label>Стать</label>
                        <select name="gender" value={formData.gender || ""} onChange={handleChange}>
                            <option value="">Не вказано</option>
                            <option value="male">Чоловік</option>
                            <option value="female">Жінка</option>
                        </select>
                    </div>
                    <div className={styles.inputField}>
                        <label>Дата народження</label>
                        <input type="date" name="date_of_birth" value={formData.date_of_birth || ""} onChange={handleChange} />
                    </div>
                    <div className={styles.inputFieldFull}>
                        <label>Примітки</label>
                        <textarea name="notes" value={formData.notes || ""} onChange={handleChange} />
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <div className={styles.piFooter}>
                <button className={styles.piEditBtn} onClick={handleSave}>Зберегти</button>
                <button className={styles.piEditBtn} onClick={onCancel}>Скасувати</button>
            </div>
        </>
    );
}