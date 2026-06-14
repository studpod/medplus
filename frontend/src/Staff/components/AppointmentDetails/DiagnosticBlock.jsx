import { useEffect, useState } from "react";
import API from "../../../api";
import { toast } from "react-toastify";
import { FaRegSave, FaEdit } from "react-icons/fa";

export default function DiagnosticBlock({ item, refresh }) {

    const hasReport = !!item.diagnostic_report;

    const [isEditing, setIsEditing] = useState(!hasReport);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        description: "",
        results: "",
        conclusion: "",
        recommendations: ""
    });

    const [files, setFiles] = useState([]);

    useEffect(() => {
        if (item?.diagnostic_report) {
            setForm(item.diagnostic_report);
            setIsEditing(false);
        }
    }, [item]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFiles = (e) => {
        setFiles(Array.from(e.target.files));
    };

    const save = async () => {
        setLoading(true);

        try {
            const data = new FormData();

            data.append("appointment_service_id", item.id);
            data.append("description", form.description || "");
            data.append("results", form.results || "");
            data.append("conclusion", form.conclusion || "");
            data.append("recommendations", form.recommendations || "");

            files.forEach(file => {
                data.append("files[]", file);
            });

            if (hasReport) {
                await API.put(
                    `/doctor/control/diagnostics/${item.diagnostic_report.id}/update`,
                    data,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );
                toast.success("Оновлено!");
            } else {
                await API.post(
                    "/doctor/control/diagnostics/create",
                    data,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );
                toast.success("Створено!");
            }

            setIsEditing(false);
            refresh();

        } catch (e) {
            toast.error("Помилка");
        } finally {
            setLoading(false);
        }
    };

    if (item.service?.type !== "diagnostics") return null;

    return (
        <div className="card medical-card">

            <div className="medical-header">
                <div>
                    <h3>{item.service?.name}</h3>
                    <p>Діагностика</p>
                </div>

                {hasReport && !isEditing && (
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

                {["description", "results", "conclusion", "recommendations"].map(field => (
                    <div key={field} className="medical-field full">
                        <label>{field}</label>
                        <textarea
                            name={field}
                            value={form[field] || ""}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </div>
                ))}

                <div className="medical-field full">
                    <label>Файли</label>
                    <input
                        type="file"
                        multiple
                        onChange={handleFiles}
                        disabled={!isEditing}
                    />
                </div>

            </div>
        </div>
    );
}