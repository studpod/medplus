import { useEffect, useState } from "react";
import API from "../../../api";
import { toast } from "react-toastify";
import { FaRegSave, FaEdit } from "react-icons/fa";

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

    const hasMedicalRecord = !!appointment?.medical_record;

    const [isEditing, setIsEditing] = useState(!hasMedicalRecord);
    const [loading, setLoading] = useState(false);

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
            setIsEditing(false);
        }
    }, [appointment]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const save = async () => {
        setLoading(true);

        try {
            if (hasMedicalRecord) {

                await API.put(
                    `/doctor/control/patient/${appointment.patient.id}/medical-card/${appointment.medical_record.id}`,
                    form
                );
                toast.success("Запис оновлено!");
            } else {

                await API.post(
                    `/doctor/control/patient/${appointment.patient.id}/medical-card/add`,
                    {
                        ...form,
                        appointment_id: appointment.id
                    }
                );
                toast.success("Запис створено!");
            }

            setIsEditing(false);
            refresh();

        } catch (e) {
            toast.error("Помилка");
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
                            ? "Запис створено"
                            : "Заповніть дані"}
                    </span>
                </div>


                {hasMedicalRecord && !isEditing && (
                    <button
                        className="save-btn"
                        onClick={() => setIsEditing(true)}
                    >
                        <FaEdit style={{ marginRight: 8 }} />
                        Редагувати
                    </button>
                )}

                {isEditing && (
                    <button
                        className="save-btn"
                        onClick={save}
                        disabled={loading}
                    >
                        <FaRegSave style={{ marginRight: 8 }} />
                        {loading ? "..." : "Зберегти"}
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
                            disabled={!isEditing}
                        />
                    </div>
                ))}
            </div>

        </div>
    );
}