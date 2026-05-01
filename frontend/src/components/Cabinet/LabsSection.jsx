import { useState } from "react";
import { FaFlask, FaDownload, FaUserMd, FaCalendarAlt } from "react-icons/fa";

export default function LabsSection({ labs }) {
    const [sort, setSort] = useState("desc");
    const [filterDate, setFilterDate] = useState("");

    const filtered = labs
        .filter(l => {
            if (!filterDate) return true;
            return l.created_at.slice(0, 10) === filterDate;
        })
        .sort((a, b) => {
            return sort === "desc"
                ? new Date(b.created_at) - new Date(a.created_at)
                : new Date(a.created_at) - new Date(b.created_at);
        });

    const getFileLabel = (file) => {
        const type = file.file_type || "";

        if (type.includes("pdf")) return "PDF";
        if (type.includes("word") || type.includes("doc")) return "DOCX";
        if (type.includes("excel") || type.includes("sheet")) return "XLSX";
        if (type.includes("image")) return "IMG";

        return "FILE";
    };

    return (
        <div className="labs-page">
            <h2 className="section-title">Аналізи</h2>

            <div className="labs-controls">
                <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                />

                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                    <option value="desc">Спочатку нові</option>
                    <option value="asc">Спочатку старі</option>
                </select>
            </div>

            <div className="labs-list">
                {filtered.map(lab => (
                    <div key={lab.id} className="lab-card">

                        {/* HEADER */}
                        <div className="lab-header">
                            <div className="lab-title">
                                <FaFlask />
                                <span className="service-name">
                                    {lab.appointment_service?.service?.name}
                                </span>
                            </div>

                            <div className="lab-number">
                                № {lab.labNumber}
                            </div>
                        </div>

                        {/* META */}
                        <div className="lab-meta">
                            <span className="meta-item">
                                <FaCalendarAlt />
                                {new Date(lab.created_at).toLocaleDateString()}
                            </span>

                            <span className="meta-item">
                                <FaUserMd />
                                {lab.appointment_service?.appointment?.doctor?.last_name}{" "}
                                {lab.appointment_service?.appointment?.doctor?.first_name}
                            </span>
                        </div>

                        {/* FILES */}
                        <div className="lab-files">
                            {lab.labs_files?.length > 0 ? (
                                lab.labs_files.map(file => (
                                    <a
                                        key={file.id}
                                        href={`http://localhost:8000/storage/${file.file_path}`}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="file-chip"
                                    >
                                        <FaDownload />
                                        <span>Завантажити</span>
                                        <span className="file-type">
                                            {getFileLabel(file)}
                                        </span>
                                    </a>
                                ))
                            ) : (
                                <span className="no-files">
                                    Немає файлів
                                </span>
                            )}
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
}