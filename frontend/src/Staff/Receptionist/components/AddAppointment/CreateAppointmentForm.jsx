import PatientAutocomplete from "./PatientAutocomplete";
import styles from "../../styles/CreateAppointmentPage.module.scss";

import {
    FaUserInjured,
    FaPhoneAlt,
    FaMapMarkerAlt,
    FaUserMd,
    FaCalendarAlt,
    FaClock,
    FaStethoscope,
    FaClipboardList,
    FaVenusMars
} from "react-icons/fa";

/* AGE */
const calcAge = (dateString) => {
    if (!dateString) return "—";

    const [y, m, d] = dateString.split("-");
    const birth = new Date(+y, +m - 1, +d);

    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();

    const diff = today.getMonth() - birth.getMonth();

    if (diff < 0 || (diff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age;
};
function formatPhone(phone) {
    if (!phone) return "";

    const cleaned = phone.replace(/\D/g, "");

    if (cleaned.length === 12 && cleaned.startsWith("380")) {

        return `+${cleaned.slice(0,2)} (${cleaned.slice(2,5)}) ${cleaned.slice(5,8)}-${cleaned.slice(8,10)}-${cleaned.slice(10,12)}`;
    }

    return phone;
}


    const PHONE_PREFIX = "+38 (0";
    const formatPhoneInput = (value) => {
        let digits = value.replace(/\D/g, "");


        if (!digits.startsWith("380")) {
            digits = "380" + digits;
        }

        // обрізаємо зайве
        digits = digits.slice(0, 12);

        const country = "+38 (0";
        const part1 = digits.slice(3, 5);
        const part2 = digits.slice(5, 8);
        const part3 = digits.slice(8, 10);
        const part4 = digits.slice(10, 12);

        let result = country;

        if (part1) result += part1;
        if (part1.length === 2) result += ") ";

        if (part2) result += part2;
        if (part2.length === 3) result += "-";

        if (part3) result += part3;
        if (part3.length === 2) result += "-";

        if (part4) result += part4;

        return result;
    };
function formatGender(gender) {
    if (gender === "male") return "Чоловік";
    if (gender === "female") return "Жінка";
    return "Не вказано";
}
export default function CreateAppointmentForm({
                                                  form,
                                                  setForm,
                                                  specializations,
                                                  doctors,
                                                  services,
                                                  selectedPatient,
                                                  setSelectedPatient,
                                                  handleChange,
                                                  toggleService,
                                                  handleSubmit,
                                                  availableTimes,
                                                  isNewPatient,
                                                  setIsNewPatient
                                              }) {

    return (
        <form className={styles.form} onSubmit={handleSubmit}>

            {/* PATIENT */}
            <div className={`${styles.field} ${styles.large}`}>

                <label>
                    <FaUserInjured />
                    Пацієнт
                </label>

                <PatientAutocomplete
                    onSelect={(p) => {

                        setIsNewPatient(false);

                        setSelectedPatient(p);

                        setForm(prev => ({
                            ...prev,

                            new_patient: false,

                            patient_id: p.id,

                            last_name: "",
                            first_name: "",
                            middle_name: "",
                            gender: "",
                            address: "",
                            date_of_birth: "",
                            phone: "",
                            notes: ""
                        }));
                    }}

                    onCreateNewPatient={(data) => {

                        setIsNewPatient(true);

                        setSelectedPatient(data);

                        setForm(prev => ({
                            ...prev,

                            new_patient: true,
                            patient_id: "",

                            last_name: data.last_name || "",
                            first_name: data.first_name || "",
                            middle_name: data.middle_name || ""
                        }));

                    }}
                />
                {isNewPatient && (
                    <div className={styles.newPatientBox}>

                        <h4>Новий пацієнт</h4>

                        <div className={styles.newPatientGrid}>

                            <input
                                type="text"
                                placeholder="Прізвище"
                                value={form.last_name}
                                onChange={(e) =>
                                    setForm(prev => ({
                                        ...prev,
                                        last_name: e.target.value
                                    }))
                                }
                            />

                            <input
                                type="text"
                                placeholder="Ім’я"
                                value={form.first_name}
                                onChange={(e) =>
                                    setForm(prev => ({
                                        ...prev,
                                        first_name: e.target.value
                                    }))
                                }
                            />

                            <input
                                type="text"
                                placeholder="По батькові"
                                value={form.middle_name}
                                onChange={(e) =>
                                    setForm(prev => ({
                                        ...prev,
                                        middle_name: e.target.value
                                    }))
                                }
                            />

                            <select
                                value={form.gender}
                                onChange={(e) =>
                                    setForm(prev => ({
                                        ...prev,
                                        gender: e.target.value
                                    }))
                                }
                            >
                                <option value="">Стать</option>
                                <option value="male">Чоловік</option>
                                <option value="female">Жінка</option>
                            </select>

                            <input
                                type="date"
                                value={form.date_of_birth}
                                onChange={(e) =>
                                    setForm(prev => ({
                                        ...prev,
                                        date_of_birth: e.target.value
                                    }))
                                }
                            />

                            <input
                                type="text"
                                placeholder="+38 (0__) ___-__-__"
                                value={form.phone}
                                onChange={(e) => {

                                    const formatted = formatPhoneInput(e.target.value);

                                    setForm(prev => ({
                                        ...prev,
                                        phone: formatted
                                    }));
                                }}
                                onKeyDown={(e) => {

                                    const value = form.phone;

                                    if (
                                        (value.length <= 6) &&
                                        (e.key === "Backspace" || e.key === "Delete")
                                    ) {
                                        e.preventDefault();
                                    }
                                }}
                            />

                            <input
                                type="text"
                                placeholder="Адреса"
                                className={styles.fullWidth}
                                value={form.address}
                                onChange={(e) =>
                                    setForm(prev => ({
                                        ...prev,
                                        address: e.target.value
                                    }))
                                }
                            />

                            <textarea
                                placeholder="Нотатки про пацієнта"
                                className={styles.fullWidth}
                                value={form.notes}
                                onChange={(e) =>
                                    setForm(prev => ({
                                        ...prev,
                                        notes: e.target.value
                                    }))
                                }
                            />

                        </div>

                    </div>
                )}
                {/* CARD */}
                {selectedPatient && !isNewPatient && (
                    <div className={styles.patientCard}>

                        <div className={styles.patientRow}>

                            <strong>
                                <FaUserInjured />

                                {selectedPatient.last_name}{" "}
                                {selectedPatient.first_name}{" "}
                                {selectedPatient.middle_name}

                            </strong>

                            <span>
                                {calcAge(selectedPatient.date_of_birth)} років
                            </span>

                        </div>

                        <div className={styles.patientInfo}>
                            <div>
                                <FaVenusMars />
                                {formatGender(selectedPatient.gender)}, {calcAge(selectedPatient.date_of_birth)} років
                            </div>
                            <div>
                                <FaPhoneAlt />
                                {formatPhone(selectedPatient.phone)}
                            </div>

                            <div>
                                <FaMapMarkerAlt />
                                {selectedPatient.address}
                            </div>

                        </div>

                        <div className={styles.familyDoctor}>

                            <FaUserMd />

                            <span>
                                Сімейний лікар:{" "}
                                {selectedPatient?.doctor_full_name || "не призначено"}
                            </span>

                        </div>

                        {selectedPatient.notes && (
                            <div className={styles.notes}>

                                <FaClipboardList />

                                <span>
                                    {selectedPatient.notes}
                                </span>

                            </div>
                        )}

                    </div>
                )}
            </div>

            {/* GRID */}
            <div className={styles.grid}>

                <div className={`${styles.field} ${styles.small}`}>

                    <label>
                        <FaStethoscope />
                        Спеціалізація
                    </label>

                    <select
                        name="specialization_id"
                        value={form.specialization_id}
                        onChange={handleChange}
                    >
                        <option value="">Оберіть</option>

                        {specializations.map(s => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>

                </div>

                <div className={`${styles.field} ${styles.small}`}>

                    <label>
                        <FaUserMd />
                        Лікар
                    </label>

                    <select
                        name="doctor_id"
                        value={form.doctor_id}
                        onChange={handleChange}
                    >
                        <option value="">Оберіть</option>

                        {doctors.map(d => (
                            <option key={d.id} value={d.id}>
                                {d.last_name} {d.first_name}
                            </option>
                        ))}
                    </select>

                </div>

                <div className={`${styles.field} ${styles.small}`}>

                    <label>
                        <FaCalendarAlt />
                        Дата
                    </label>

                    <input
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                    />

                </div>

                <div className={`${styles.field} ${styles.small}`}>

                    <label>
                        <FaClock />
                        Час
                    </label>

                    <select
                        name="time"
                        value={form.time}
                        onChange={handleChange}
                    >
                        <option value="">
                            Обрати час
                        </option>

                        {availableTimes.map(time => (
                            <option key={time} value={time}>
                                {time}
                            </option>
                        ))}
                    </select>

                </div>

            </div>

            {/* SERVICES */}
            <div className={styles.services}>

                <h4>
                    <FaClipboardList />
                    Послуги
                </h4>

                <div className={styles.servicesGrid}>

                    {services.map(s => (
                        <label key={s.id} className={styles.serviceItem}>

                            <input
                                type="checkbox"
                                checked={form.services.includes(s.id)}
                                onChange={() => toggleService(s.id)}
                            />

                            <span>{s.name}</span>

                            <small>{s.price} ₴</small>

                        </label>
                    ))}

                </div>
            </div>

            <div className={styles.actions}>
                <button type="submit">
                    {form.id ? "Оновити прийом" : "Створити прийом"}
                </button>
            </div>

        </form>
    );
}