import { useState, useEffect } from "react";
import { FaCamera } from "react-icons/fa";
import styles from "../../styles/staffSettings.module.scss";

export default function ProfileForm({ doctor, onSave, onAvatarUpload, loading }) {

    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        middle_name: "",
        phone: ""
    });

    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        setForm({
            first_name: doctor.first_name || "",
            last_name: doctor.last_name || "",
            middle_name: doctor.middle_name || "",
            phone: doctor.phone || ""
        });
    }, [doctor]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFile = (e) => {
        const f = e.target.files[0];
        if (!f) return;

        setFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const avatarSrc =
        preview ||
        (doctor.avatar ? `http://localhost:8000/storage/${doctor.avatar}` : "/images/default-avatar.png");

    return (
        <div className={styles.card}>

            <h2 className={styles.title}>Профіль</h2>

            {/* AVATAR */}
            <div className={styles.avatarWrapper}>
                <div className={styles.avatarBox}>
                    <img src={avatarSrc} className={styles.avatarImg} />

                    <label className={styles.avatarHover}>
                        <FaCamera />
                        <input type="file" hidden onChange={handleFile} />
                    </label>
                </div>

                {file && (
                    <button
                        className={styles.button}
                        onClick={() => onAvatarUpload(file)}
                    >
                        Завантажити аватар
                    </button>
                )}
            </div>

            {/* FORM */}
            <div className={styles.formGrid}>

                <input className={styles.input} name="last_name" value={form.last_name} onChange={handleChange} placeholder="Прізвище" />
                <input className={styles.input} name="first_name" value={form.first_name} onChange={handleChange} placeholder="Ім'я" />
                <input className={styles.input} name="middle_name" value={form.middle_name} onChange={handleChange} placeholder="По батькові" />
                <input className={styles.input} name="phone" value={form.phone} onChange={handleChange} placeholder="Телефон" />

                <input className={styles.input} value={doctor.specialization?.name} disabled />

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