import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../api";
import "../styles/labForm.scss";
import { toast } from "react-toastify";

export default function LabPage() {
    const { appointmentServiceId } = useParams();
    const isFromAppointment = !!appointmentServiceId;

    const [loading, setLoading] = useState(false);
    const [patients, setPatients] = useState([]);
    const [appointmentServices, setAppointmentServices] = useState([]);

    const [form, setForm] = useState({
        patient_id: "",
        appointment_service_id: "",
        labNumber: "",
        files: []
    });

    const formatDateTime = (dateString, timeString) => {
        if (!dateString) return "";

        const date = new Date(dateString);

        const dd = String(date.getDate()).padStart(2, "0");
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const yyyy = date.getFullYear();

        let formattedTime = "";
        if (timeString) {
            const [h, m] = timeString.split(":");
            formattedTime = `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
        }

        return `${dd}.${mm}.${yyyy} ${formattedTime}`;
    };

    useEffect(() => {
        API.get("/doctor/view/patient/all")
            .then(res => setPatients(res.data.patients || []));
    }, []);

    useEffect(() => {
        if (!form.patient_id) return;

        API.get(`/doctor/view/appointment-services/by-patient/${form.patient_id}`)
            .then(res => setAppointmentServices(res.data.services || []));
    }, [form.patient_id]);

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

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };


    const handleFiles = (e) => {
        const newFiles = Array.from(e.target.files);

        setForm(prev => ({
            ...prev,
            files: [...prev.files, ...newFiles]
        }));

        e.target.value = null;
    };


    const removeFile = (index) => {
        setForm(prev => ({
            ...prev,
            files: prev.files.filter((_, i) => i !== index)
        }));
    };

    const submit = async () => {
        setLoading(true);

        try {
            const data = new FormData();

            data.append("patient_id", form.patient_id);
            data.append("labNumber", form.labNumber);
            data.append("appointment_service_id", form.appointment_service_id);

            form.files.forEach(file => {
                data.append("files[]", file);
            });

            await API.post("/doctor/control/labs/create", data);

            toast.success("Аналізи успішно додано!");
        } catch (e) {
            console.error(e);
            toast.error("Сталась помилка. Спробуйте ще раз!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="lab-container">
            <div className="lab-card">
                <h2 className="lab-title">Аналізи</h2>

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

                <div className="lab-group">
                    <label>Номер аналізу</label>
                    <input
                        name="labNumber"
                        value={form.labNumber}
                        onChange={handleChange}
                        className="lab-input"
                    />
                </div>

                <div className="lab-group">
                    <label>Файли</label>

                    <label className="file-button">
                        Огляд...
                        <input
                            type="file"
                            multiple
                            onChange={handleFiles}
                            style={{ display: "none" }}
                        />
                    </label>

                    <div style={{ marginTop: "10px" }}>
                        {form.files.length === 0 && (
                            <span style={{ fontSize: "13px", color: "#9ca3af" }}>
                                Файли не вибрані.
                            </span>
                        )}

                        {form.files.map((file, idx) => {
                            const url = URL.createObjectURL(file);

                            return (
                                <div
                                    key={idx}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "6px 10px",
                                        background: "#f9fafb",
                                        borderRadius: "8px",
                                        marginTop: "6px",
                                        fontSize: "13px"
                                    }}
                                >
                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            textDecoration: "none",
                                            color: "#111827",
                                            flex: 1
                                        }}
                                    >
                                        📎 {file.name}
                                    </a>

                                    <button
                                        onClick={() => removeFile(idx)}
                                        style={{
                                            background: "transparent",
                                            border: "none",
                                            color: "#ef4444",
                                            cursor: "pointer",
                                            fontSize: "14px"
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* SUBMIT */}
                <button
                    onClick={submit}
                    disabled={loading}
                    className="lab-button"
                >
                    {loading ? "Збереження..." : "Зберегти"}
                </button>
            </div>
        </div>
    );
}