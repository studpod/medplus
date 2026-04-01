import { useEffect, useState } from "react";
import API from "../../../api";
import {toast} from "react-toastify";

const fields = [
    { name: "chief_complaint", label: "Скарги" },
    { name: "anamnesis", label: "Анамнез" },
    { name: "initial_review", label: "Огляд" },
    { name: "diagnosis", label: "Діагноз" },
    { name: "treatment", label: "Лікування" },
    { name: "prescriptions", label: "Призначення" },
    { name: "notes", label: "Рекомендації", full: true }
];

export default function ConsultationBlock({ appointment, refresh }) {
    const [loading, setLoading] = useState(false);

    const hasMedicalRecord = !!appointment?.medical_record;

    const [form, setForm] = useState({
        chief_complaint: "",
        anamnesis: "",
        initial_review: "",
        diagnosis: "",
        treatment: "",
        prescriptions: "",
        notes: ""
    });

    useEffect(() => {
        if (appointment?.medical_record) {
            setForm(appointment.medical_record);
        }
    }, [appointment]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const save = async () => {
        setLoading(true);

        try {
            await API.post(
                `/doctor/control/patient/${appointment.patient.id}/medical-card/add`,
                {
                    ...form,
                    appointment_id: appointment.id
                }
            );
            toast.success("Запис успішно доданий!")

            refresh();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card medical-card">

            <div className="medical-header">
                <div>
                    <h3>Медична карта</h3>
                    <span>
                        {hasMedicalRecord
                            ? "Запис вже створено"
                            : "Заповніть дані прийому"}
                    </span>
                </div>

                {!hasMedicalRecord && (
                    <button
                        className="save-btn"
                        onClick={save}
                        disabled={loading}
                    >
                        {loading ? "..." : "💾 Зберегти"}
                    </button>
                )}
            </div>

            <div className="medical-grid">
                {fields.map(field => (
                    <div
                        key={field.name}
                        className={`medical-field ${field.full ? "full" : ""}`}
                    >
                        <label>{field.label}</label>

                        <textarea
                            name={field.name}
                            value={form[field.name] || ""}
                            onChange={handleChange}
                            placeholder={`Введіть ${field.label.toLowerCase()}...`}
                            disabled={hasMedicalRecord}
                        />
                    </div>
                ))}
            </div>

        </div>
    );
}