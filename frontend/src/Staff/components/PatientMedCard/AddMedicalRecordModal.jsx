import React, { useEffect, useState } from "react";
import API from "../../../api";
import { toast } from "react-toastify";
import "../../../Staff/styles/MedicalCardPage.scss";

export default function AddMedicalRecordModal({ isOpen, onClose,patientId, record, onSaved, records }) {

    const [loading, setLoading] = useState(false);
    const [appointments, setAppointments] = useState([]);

    const emptyForm = {
        appointment_id: "",
        chief_complaint: "",
        initial_review: "",
        anamnesis: "",
        diagnosis: "",
        treatment: "",
        prescriptions: "",
        notes: ""
    };

    const [form, setForm] = useState(emptyForm);

    // завантаження прийомів
    useEffect(() => {

        const fetchAppointments = async () => {
            try {

                const res = await API.get(`/doctor/view/patient/${patientId}/appointments`);

                console.log("APPOINTMENTS:", res.data);

                setAppointments(res.data.appointments || []);

            } catch (err) {
                console.error("Помилка завантаження прийомів", err);
                toast.error("Не вдалося завантажити прийоми");
            }
        };

        if (isOpen) {
            fetchAppointments();
        }

    }, [patientId, isOpen]);

    useEffect(() => {

        if (record) {

            setForm({
                appointment_id: record.appointment_id || "",
                chief_complaint: record.chief_complaint || "",
                anamnesis: record.anamnesis || "",
                diagnosis: record.diagnosis || "",
                treatment: record.treatment || "",
                prescriptions: record.prescriptions || "",
                notes: record.notes || "",
                initial_review: record.initial_review || ""
            });

        } else {

            setForm(emptyForm);

        }

    }, [record]);

    if (!isOpen) return null;

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async () => {
        if (!form.appointment_id) {
            toast.error("Оберіть прийом");
            return;
        }
        setLoading(true);
        try {
            let res;
            if (record) {
                res = await API.put(`/doctor/control/patient/${patientId}/medical-card/${record.id}/update`, form);
                toast.success("Запис медичної карти оновлено");
            } else {
                res = await API.post(`/doctor/control/patient/${patientId}/medical-card/add`, form);
                toast.success("Запис медичної карти створено");
            }

            if (onSaved) onSaved(res.data.invalidateCache || false);
            setForm(emptyForm);
            onClose();
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.error || "Помилка збереження");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">

            <div className="modal">

                <div className="modal-header">

                    <h3>
                        {record
                            ? "Редагування запису"
                            : "Новий запис медичної картки"}
                    </h3>

                    <button
                        className="close-btn"
                        onClick={onClose}
                    >
                        ✕
                    </button>

                </div>

                <div className="modal-body-grid">

                    <div className="form-group full">
                        <label>Прийом</label>
                        <select
                            name="appointment_id"
                            value={form.appointment_id}
                            onChange={handleChange}
                        >
                            <option value="">Оберіть прийом</option>

                            {appointments
                                .filter(a => !records.some(r => r.appointment_id === a.id))
                                .map(a => (
                                    <option key={a.id} value={a.id}>
                                        {a.date} — {a.doctor?.last_name} {a.doctor?.first_name}
                                    </option>
                                ))
                            }
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Скарга</label>
                        <textarea
                            name="chief_complaint"
                            value={form.chief_complaint}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Анамнез</label>
                        <textarea
                            name="anamnesis"
                            value={form.anamnesis}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Первинний огляд</label>
                        <textarea
                            name="initial_review"
                            value={form.initial_review}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Діагноз</label>
                        <textarea
                            name="diagnosis"
                            value={form.diagnosis}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Лікування</label>
                        <textarea
                            name="treatment"
                            value={form.treatment}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Призначення</label>
                        <textarea
                            name="prescriptions"
                            value={form.prescriptions}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group full">
                        <label>Рекомендації</label>
                        <textarea
                            name="notes"
                            value={form.notes}
                            onChange={handleChange}
                        />
                    </div>

                </div>

                <div className="modal-footer">

                    <button
                        className="cancel-btn"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Скасувати
                    </button>

                    <button
                        className="save-btn"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? "Збереження..." : "Зберегти"}
                    </button>

                </div>

            </div>

        </div>
    );
}