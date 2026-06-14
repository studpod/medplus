import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../../api";
import styles from "./Appointment.module.scss";
import { useAuth } from "../../context/AuthContext";
import { FaUser, FaPhone, FaIdCard } from "react-icons/fa";


export default function AppointmentForm() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [specializations, setSpecializations] = useState([]);
    const [services, setServices] = useState([]);
    const [doctors, setDoctors] = useState([]);

    const [selectedSpec, setSelectedSpec] = useState("");
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [selectedServices, setSelectedServices] = useState([]);

    const [date, setDate] = useState("");
    const [availableTimes, setAvailableTimes] = useState([]);
    const [selectedTime, setSelectedTime] = useState("");

    const location = useLocation();
    useEffect(() => {
        if (location.state?.doctorId) {
            setSelectedDoctor(location.state.doctorId);
        }

        if (location.state?.specializationId) {
            setSelectedSpec(location.state.specializationId);
        }
    }, []);

    const [patient, setPatient] = useState({
        fullName: "",
        phone: ""
    });
    const formatPhone = (value = "") => {
        const cleaned = normalizePhoneInput(value);

        const country = cleaned.slice(0, 2); // 38
        const code = cleaned.slice(2, 5);
        const part1 = cleaned.slice(5, 8);
        const part2 = cleaned.slice(8, 10);
        const part3 = cleaned.slice(10, 12);

        let result = `+${country}`;

        if (code) result += ` (${code}`;
        if (cleaned.length >= 5) result += `)`;
        if (part1) result += ` ${part1}`;
        if (part2) result += `-${part2}`;
        if (part3) result += `-${part3}`;

        return result;
    };

// для input (ОЦЕ ГОЛОВНЕ)
    const handlePhoneChange = (e) => {
        const raw = e.target.value;

        const normalized = normalizePhoneInput(raw);
        const formatted = formatPhone(normalized);

        setPatient(prev => ({
            ...prev,
            phone: formatted
        }));
    };
    const normalizePhoneInput = (value) => {
        let cleaned = value.replace(/\D/g, "");

        // якщо починається з 00 → 00380... → 380...
        if (cleaned.startsWith("00")) {
            cleaned = cleaned.slice(2);
        }

        // якщо починається з 8XXXXXXXXXX → 380XXXXXXXXX
        if (cleaned.startsWith("8") && cleaned.length === 11) {
            cleaned = "38" + cleaned.slice(1);
        }

        // якщо без коду країни → додаємо 38
        if (!cleaned.startsWith("38")) {
            cleaned = "38" + cleaned;
        }

        return cleaned.slice(0, 12);
    };
    const minDate = new Date().toISOString().split("T")[0];

    useEffect(() => {
        API.get("/public/view/specializations")
            .then(res => setSpecializations(res.data))
            .catch(() => toast.error("Помилка завантаження"));
    }, []);


    useEffect(() => {
        if (!selectedSpec) return;

        API.get(`/public/view/services/${selectedSpec}`)
            .then(res => setServices(res.data));

        API.get(`/public/view/doctors/specialization/${selectedSpec}`)
            .then(res => setDoctors(res.data));

        setSelectedDoctor("");
        setSelectedServices([]);
        setDate("");
        setAvailableTimes([]);
        setSelectedTime("");
    }, [selectedSpec]);

    // patient data
    useEffect(() => {
        if (!user) return;

        API.get("/patient/view/me")
            .then(res => {
                const p = res.data.patient;
                if (!p) return;

                setPatient({
                    fullName: `${p.last_name} ${p.first_name} ${p.middle_name}`,
                    phone: p.phone
                });
            })
            .catch(() => toast.error("Помилка даних пацієнта"));
    }, [user]);

    // time slots
    useEffect(() => {
        if (!selectedDoctor || !date) return;

        API.get(`/public/view/doctors/${selectedDoctor}/available-times`, {
            params: { date }
        }).then(res => setAvailableTimes(res.data));
    }, [selectedDoctor, date]);

    const addService = (id) => {
        if (!selectedServices.includes(id)) {
            setSelectedServices(prev => [...prev, id]);
        }
    };

    const removeService = (id) => {
        setSelectedServices(prev => prev.filter(s => s !== id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const rawPhone = normalizePhoneInput(patient.phone);

        try {
            if (user) {
                await API.post("/patient/control/reception/add", {
                    doctor_id: selectedDoctor,
                    service_ids: selectedServices,
                    date,
                    time: selectedTime
                });
            } else {
                await API.post("/public/control/reception/add-guest", {
                    full_name: patient.fullName,
                    phone: rawPhone,
                    doctor_id: selectedDoctor,
                    service_ids: selectedServices,
                    date,
                    time: selectedTime
                });
            }

            toast.success("Запис створено");
            navigate("/");
        } catch (err) {
            toast.error(err.response?.data?.error || "Помилка запису");
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>

                {/* LEFT */}
                <div className={styles.left}>
                    <h3 className={styles.title}>Інформація пацієнта</h3>

                    {user ? (
                        <div className={styles.profileCard}>

                            <div className={styles.row}>
                                <FaUser className={styles.icon} />
                                <div>
                                    <div className={styles.label}>ПІБ</div>
                                    <div className={styles.value}>{patient.fullName}</div>
                                </div>
                            </div>

                            <div className={styles.row}>
                                <FaPhone className={styles.icon} />
                                <div>
                                    <div className={styles.label}>Телефон</div>
                                    <div className={styles.value}>
                                        {formatPhone(patient.phone)}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.row}>
                                <FaIdCard className={styles.icon} />
                                <div>
                                    <div className={styles.label}>Статус</div>
                                    <div className={styles.valueActive}>Авторизований</div>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <>
                            <input
                                className={styles.input}
                                placeholder="ПІБ"
                                value={patient.fullName}
                                onChange={(e) =>
                                    setPatient({ ...patient, fullName: e.target.value })
                                }
                            />
                            <input
                                className={styles.input}
                                placeholder="+38 (0__) ___-__-__"
                                value={patient.phone}
                                onChange={handlePhoneChange}
                                inputMode="tel"
                                maxLength={19}
                            />
                        </>
                    )}
                </div>

                {/* RIGHT */}
                <div className={styles.right}>
                    <h2>Запис на прийом</h2>

                    <select
                        className={styles.select}
                        value={selectedSpec}
                        onChange={(e) => setSelectedSpec(e.target.value)}
                    >
                        <option value="">Спеціалізація</option>
                        {specializations.map(s => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>

                    <select
                        className={styles.select}
                        value={selectedDoctor}
                        onChange={(e) => setSelectedDoctor(e.target.value)}
                        disabled={!selectedSpec}
                    >
                        <option value="">Лікар</option>
                        {doctors.map(d => (
                            <option key={d.id} value={d.id}>
                                {d.last_name} {d.first_name} {d.middle_name}
                            </option>
                        ))}
                    </select>


                    <div className={styles.servicesBlock}>
                        <select
                            className={styles.select}
                            onChange={(e) => {
                                const id = Number(e.target.value);
                                if (id) addService(id);
                                e.target.value = "";
                            }}
                            disabled={!selectedDoctor}
                        >
                            <option value="">Додати послугу</option>
                            {services.map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>

                        <div className={styles.servicesList}>
                            {selectedServices.map(id => {
                                const s = services.find(x => x.id === id);
                                if (!s) return null;

                                return (
                                    <div key={id} className={styles.serviceItem}>
                                        {s.name}
                                        <button onClick={() => removeService(id)}>×</button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <input
                        className={styles.input}
                        type="date"
                        min={minDate}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />

                    <div className={styles.times}>
                        {availableTimes.map(t => (
                            <div
                                key={t}
                                className={`${styles.time} ${selectedTime === t ? styles.active : ""}`}
                                onClick={() => setSelectedTime(t)}
                            >
                                {t}
                            </div>
                        ))}
                    </div>

                    <button className={styles.submit} onClick={handleSubmit}>
                        Записатись
                    </button>
                </div>

            </div>
        </div>
    );
}