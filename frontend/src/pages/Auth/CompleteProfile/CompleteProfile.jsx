import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../api";
import { toast } from "react-toastify";

import styles from "./CompleteProfile.module.scss";

import {
    FaUser,
    FaPhone,
    FaVenusMars,
    FaMapMarkerAlt,
    FaBirthdayCake,
    FaStickyNote,
} from "react-icons/fa";

export default function CompleteProfile({ user }) {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        last_name: "",
        first_name: "",
        middle_name: "",
        phone: "",
        gender: "",
        address: "",
        date_of_birth: "",
        notes: "",
    });

    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const res = await API.get("/patient/view/me");

                const patient = res.data?.patient;

                if (!patient) return;

                setForm({
                    last_name: patient.last_name || "",
                    first_name: patient.first_name || "",
                    middle_name: patient.middle_name || "",
                    phone: patient.phone || "",
                    gender: patient.gender || "",
                    address: patient.address || "",
                    date_of_birth: patient.date_of_birth || "",
                    notes: patient.notes || "",
                });

            } catch (err) {
                console.log("No existing profile");
            }
        };

        if (user) {
            loadProfile();
        }
    }, [user]);
    useEffect(() => {
        if (!user) return;
    }, [user]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !form.last_name ||
            !form.first_name ||
            !form.phone ||
            !form.gender ||
            !form.address ||
            !form.date_of_birth
        ) {
            toast.error("Заповніть обов’язкові поля");
            return;
        }

        try {
            setLoading(true);

            await API.post("/patient/control/profile/personal-info/complete", form);

            toast.success("Профіль заповнено");
            navigate("/");
        } catch (err) {
            toast.error("Помилка збереження");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.card}>

                <h2>Завершення профілю</h2>
                <p>Заповніть особисті дані для продовження</p>

                <form onSubmit={handleSubmit} className={styles.form}>

                    <div className={styles.row}>
                        <FaUser />
                        <input
                            name="last_name"
                            placeholder="Прізвище *"
                            value={form.last_name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.row}>
                        <FaUser />
                        <input
                            name="first_name"
                            placeholder="Ім'я *"
                            value={form.first_name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.row}>
                        <FaUser />
                        <input
                            name="middle_name"
                            placeholder="По батькові"
                            value={form.middle_name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.row}>
                        <FaPhone />
                        <input
                            name="phone"
                            placeholder="Телефон *"
                            value={form.phone}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.row}>
                        <FaVenusMars />
                        <select
                            name="gender"
                            value={form.gender}
                            onChange={handleChange}
                        >
                            <option value="">Стать *</option>
                            <option value="male">Чоловіча</option>
                            <option value="female">Жіноча</option>
                        </select>
                    </div>

                    <div className={styles.row}>
                        <FaMapMarkerAlt />
                        <input
                            name="address"
                            placeholder="Адреса *"
                            value={form.address}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.row}>
                        <FaBirthdayCake />
                        <input
                            type="date"
                            name="date_of_birth"
                            value={form.date_of_birth}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.row}>
                        <FaStickyNote />
                        <textarea
                            name="notes"
                            placeholder="Нотатки (необов’язково)"
                            value={form.notes}
                            onChange={handleChange}
                        />
                    </div>

                    <button disabled={loading} className={styles.button}>
                        {loading ? "Збереження..." : "Завершити"}
                    </button>

                </form>
            </div>
        </div>
    );
}