import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../../api";
import "./Appointment.scss";

export default function AppointmentForm() {
    const navigate = useNavigate();

    const [specializations, setSpecializations] = useState([]);
    const [services, setServices] = useState([]);
    const [doctors, setDoctors] = useState([]);

    const [selectedSpec, setSelectedSpec] = useState("");
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [selectedServices, setSelectedServices] = useState([]);
    const [date, setDate] = useState("");
    const [availableTimes, setAvailableTimes] = useState([]);
    const [selectedTime, setSelectedTime] = useState("");

    const [patient, setPatient] = useState({
        fullName: "Іваненко Іван Іванович",
        phone: "+380123456789"
    });

    const minDate = new Date().toISOString().split("T")[0];

    useEffect(() => {
        API.get("/public/view/specializations")
            .then(res => setSpecializations(res.data))
            .catch(err => toast.error("Помилка завантаження спеціалізацій"));
    }, []);

    useEffect(() => {
        if (!selectedSpec) {
            setServices([]);
            setDoctors([]);
            setSelectedDoctor("");
            setSelectedServices([]);
            setDate("");
            setAvailableTimes([]);
            setSelectedTime("");
            return;
        }

        API.get(`/public/view/services/${selectedSpec}`)
            .then(res => setServices(res.data))
            .catch(err => toast.error("Помилка завантаження послуг"));

        API.get(`/public/view/doctors/specialization/${selectedSpec}`)
            .then(res => setDoctors(res.data))
            .catch(err => toast.error("Помилка завантаження лікарів"));

        setSelectedDoctor("");
        setSelectedServices([]);
        setDate("");
        setAvailableTimes([]);
        setSelectedTime("");
    }, [selectedSpec]);

    // Завантаження доступних часів при зміні лікаря або дати
    useEffect(() => {
        if (!selectedDoctor || !date) return;

        API.get(`/public/view/doctors/${selectedDoctor}/available-times`, { params: { date } })
            .then(res => setAvailableTimes(res.data))
            .catch(err => toast.error("Помилка завантаження доступного часу"));

        setSelectedTime("");
    }, [selectedDoctor, date]);

    const addService = (serviceId) => {
        if (!selectedServices.includes(serviceId)) {
            setSelectedServices([...selectedServices, serviceId]);
        }
    };

    const removeService = (serviceId) => {
        setSelectedServices(selectedServices.filter(s => s !== serviceId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = [];
        if (!selectedSpec) errors.push("Оберіть спеціалізацію");
        if (selectedServices.length === 0) errors.push("Оберіть хоча б одну послугу");
        if (!selectedDoctor) errors.push("Оберіть лікаря");
        if (!date) errors.push("Оберіть дату");
        if (!selectedTime) errors.push("Оберіть час");

        if (errors.length > 0) {
            errors.forEach(err => toast.error(err));
            return;
        }

        try {
            await API.post("/patient/control/reception/add", {
                doctor_id: selectedDoctor,
                service_ids: selectedServices,
                date,
                time: selectedTime
            });

            toast.success("Запис на прийом успішно створено");

            // Скидання форми
            setSelectedSpec("");
            setSelectedDoctor("");
            setSelectedServices([]);
            setDate("");
            setAvailableTimes([]);
            setSelectedTime("");
            setDoctors([]);
            setServices([]);
            navigate("/");

        } catch (err) {
            const msg = err.response?.data?.error || "Помилка запису";
            toast.error(msg);
        }
    };

    return (
        <div className="appointment-section">
            <div className="appointment-container dual-blocks">

                {/* Ліва колонка – інформація пацієнта */}
                <div className="patient-info">
                    <h3>Інформація пацієнта</h3>
                    <p>Перевірте, чи дані актуальні:</p>
                    <div className="info-item"><strong>ПІБ:</strong> {patient.fullName}</div>
                    <div className="info-item"><strong>Телефон:</strong> {patient.phone}</div>
                    <button className="edit-btn">Редагувати</button>
                </div>

                {/* Права колонка – форма запису */}
                <div className="appointment-form">
                    <h2>Запис на прийом</h2>
                    <form onSubmit={handleSubmit}>

                        {/* Спеціалізація */}
                        <div className="form-group">
                            <label>Спеціалізація</label>
                            <select
                                value={selectedSpec}
                                onChange={e => setSelectedSpec(e.target.value)}
                            >
                                <option value="">Оберіть спеціалізацію</option>
                                {specializations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>

                        {/* Послуги */}
                        <div className="form-group">
                            <label>Додати послугу</label>
                            <select
                                className="add-service-select"
                                onChange={e => {
                                    const id = Number(e.target.value);
                                    if(id) addService(id);
                                    e.target.value = "";
                                }}
                                disabled={!selectedSpec}
                            >
                                <option value="">Оберіть послугу +</option>
                                {services.map(s => !selectedServices.includes(s.id) && (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>

                            {selectedServices.length > 0 && (
                                <div className="services-list">
                                    {selectedServices.map(id => {
                                        const s = services.find(s => s.id === id);
                                        return s ? (
                                            <div key={id} className="service-item">
                                                {s.name} <button type="button" onClick={() => removeService(id)}>×</button>
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Лікар */}
                        <div className="form-group">
                            <label>Лікар</label>
                            <select
                                value={selectedDoctor}
                                onChange={e => setSelectedDoctor(e.target.value)}
                                disabled={!selectedSpec || selectedServices.length === 0}
                            >
                                <option value="">Оберіть лікаря</option>
                                {doctors.map(d => (
                                    <option key={d.id} value={d.id}>{d.last_name} {d.first_name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Дата */}
                        <div className="form-group">
                            <label>Дата</label>
                            <input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                min={minDate}
                                disabled={!selectedDoctor}
                            />
                        </div>

                        {/* Час */}
                        <div className="form-group">
                            <label>Час (30 хв)</label>
                            <div className="time-slots">
                                {availableTimes.map(time => (
                                    <div
                                        key={time}
                                        className={`time-slot ${selectedTime === time ? "selected" : ""}`}
                                        onClick={() => setSelectedTime(time)}
                                    >
                                        {time}
                                    </div>
                                ))}
                                {availableTimes.length === 0 && <p>Виберіть лікаря та дату</p>}
                            </div>
                        </div>

                        <button type="submit" className="appointment-btn">Записатись</button>
                    </form>
                </div>
            </div>
        </div>
    );
}