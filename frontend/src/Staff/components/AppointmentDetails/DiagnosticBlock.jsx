import { useEffect, useState } from "react";
import API from "../../../api";
import { toast } from "react-toastify";
import { FaRegSave } from "react-icons/fa";

export default function DiagnosticBlock({ item, refresh }) {

    const hasReport = !!item.diagnostic_report;

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

            await API.post(
                "/doctor/control/diagnostics/create",
                data,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            toast.success("Діагностику збережено!");
            refresh();

        } catch (e) {
            toast.error(e.response?.data?.error || "Помилка");
        } finally {
            setLoading(false);
        }
    };

    if (item.service?.type !== "diagnostics") return null;

    return (
        <div className="card medical-card">

            <div className="medical-header">
                <div>
                    <h3>Діагностика</h3>
                    <p>{item.service?.name}</p>
                </div>

                {!hasReport && (
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

                <div className="medical-field full">
                    <label>Опис</label>
                    <textarea
                        name="description"
                        value={form.description || ""}
                        onChange={handleChange}
                        disabled={hasReport}
                    />
                </div>

                <div className="medical-field full">
                    <label>Результати</label>
                    <textarea
                        name="results"
                        value={form.results || ""}
                        onChange={handleChange}
                        disabled={hasReport}
                    />
                </div>

                <div className="medical-field full">
                    <label>Висновок</label>
                    <textarea
                        name="conclusion"
                        value={form.conclusion || ""}
                        onChange={handleChange}
                        disabled={hasReport}
                    />
                </div>

                <div className="medical-field full">
                    <label>Рекомендації</label>
                    <textarea
                        name="recommendations"
                        value={form.recommendations || ""}
                        onChange={handleChange}
                        disabled={hasReport}
                    />
                </div>

                <div className="medical-field full">
                    <label>Файли (рентген / МРТ / фото)</label>
                    <input
                        type="file"
                        multiple
                        onChange={handleFiles}
                        disabled={hasReport}
                    />
                </div>

            </div>
        </div>
    );
}