import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../api";
import "../styles/labForm.scss";
import {toast} from "react-toastify";

export default function LabPage() {
    const { appointmentServiceId } = useParams();

    const isFromAppointment = !!appointmentServiceId;

    const [loading, setLoading] = useState(false);
    const [patients, setPatients] = useState([]);
    const [appointmentServices, setAppointmentServices] = useState([]);
    const formatDateTime = (dateString, timeString) => {
        if (!dateString) return "";

        const date = new Date(dateString);

        const dd = String(date.getDate()).padStart(2, "0");
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const yyyy = date.getFullYear();

        const formattedDate = `${dd}.${mm}.${yyyy}`;

        let formattedTime = "";
        if (timeString) {
            const [h, m] = timeString.split(":");
            formattedTime = `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
        }

        return `${formattedDate} ${formattedTime}`;
    };
    const [form, setForm] = useState({
        patient_id: "",
        appointment_service_id: "",
        labNumber: "",
        files: []
    });

    // 🔹 загрузка пациентов
    useEffect(() => {
        API.get("/doctor/view/patient/all")
            .then(res => setPatients(res.data.patients || []));
    }, []);

    // 🔹 загрузка анализов пациента
    useEffect(() => {
        if (!form.patient_id) return;

        API.get(`/doctor/view/appointment-services/by-patient/${form.patient_id}`)
            .then(res => setAppointmentServices(res.data.services || []));
    }, [form.patient_id]);

    // 🔹 если пришли с приема
    useEffect(() => {
        if (!appointmentServiceId) return;

        API.get(`/doctor/view/appointment-service/${appointmentServiceId}`)
            .then(res => {
                const data = res.data;

                setForm(prev => ({
                    ...prev,
                    patient_id: data.appointment.patient_id,
                    appointment_service_id: appointmentServiceId
                }));
            })
            .catch(console.error);

    }, [appointmentServiceId]);

    // 🔹 изменения
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFiles = (e) => {
        setForm({ ...form, files: e.target.files });
    };

    // 🔹 отправка
    const submit = async () => {
        setLoading(true);

        try {
            const data = new FormData();

            data.append("patient_id", form.patient_id);
            data.append("labNumber", form.labNumber);

            // 🔥 ВСЕГДА отправляем это поле
            data.append("appointment_service_id", form.appointment_service_id);

            if (form.files.length) {
                for (let file of form.files) {
                    data.append("files[]", file);
                }
            }

            await API.post("/doctor/control/labs/create", data);

            toast.success("Аналізи успіщно додано!")

        } catch (e) {
            console.error(e);
            toast.error("Сталась помилка. Спробуйте ще раз!")
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="lab-container">
            <div className="lab-card">
                <h2 className="lab-title">Аналізи</h2>

                {/* Пациент */}
                {!isFromAppointment && (
                    <div className="lab-group">
                        <label>Пацієнт</label>
                        <select
                            name="patient_id"
                            value={form.patient_id}
                            onChange={handleChange}
                            className="lab-input"
                        >
                            <option value="">Оберіть</option>
                            {patients.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.last_name} {p.first_name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Анализы */}
                {!isFromAppointment && (
                    <div className="lab-group">
                        <label>Аналіз</label>
                        <select
                            name="appointment_service_id"
                            value={form.appointment_service_id}
                            onChange={handleChange}
                            className="lab-input"
                        >
                            <option value="">Оберіть</option>
                            {appointmentServices.map(s => (
                                <option key={s.id} value={s.id}>
                                    {formatDateTime(s.appointment?.date, s.appointment?.time)} - {s.service?.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Номер */}
                <div className="lab-group">
                    <label>Номер аналізу</label>
                    <input
                        name="labNumber"
                        value={form.labNumber}
                        onChange={handleChange}
                        className="lab-input"
                    />
                </div>

                {/* Файлы */}
                <div className="lab-group">
                    <label>Файли</label>
                    <input type="file" multiple onChange={handleFiles} />
                </div>

                <button onClick={submit} disabled={loading} className="lab-button">
                    {loading ? "Збереження..." : "Зберегти"}
                </button>
            </div>
        </div>
    );
}