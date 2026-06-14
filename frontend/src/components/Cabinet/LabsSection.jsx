import { useState } from "react";
import styles from "./styles/LabsSection.module.scss";
import { FaFlask, FaDownload, FaUserMd, FaCalendarAlt } from "react-icons/fa";

export default function LabsSection({ labs }) {
    const [sort, setSort] = useState("desc");
    const [filterDate, setFilterDate] = useState("");

    const filtered = (labs || [])
        .filter(l => {
            if (!filterDate) return true;
            return l.created_at?.slice(0, 10) === filterDate;
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
        <div className={styles.labsPage}>
            <h2 className={styles.sectionTitle}>Аналізи</h2>

            <div className={styles.labsControls}>
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

            <div className={styles.labsList}>
                {filtered.map(lab => (
                    <div key={lab.id} className={styles.labCard}>

                        {/* HEADER */}
                        <div className={styles.labHeader}>
                            <div className={styles.labTitle}>
                                <FaFlask />
                                <span className={styles.serviceName}>
                                    {lab.appointment_service?.service?.name}
                                </span>
                            </div>

                            <div className={styles.labNumber}>
                                № {lab.labNumber}
                            </div>
                        </div>

                        {/* META */}
                        <div className={styles.labMeta}>
                            <span className={styles.metaItem}>
                                <FaCalendarAlt />
                                {new Date(lab.created_at).toLocaleDateString()}
                            </span>

                            <span className={styles.metaItem}>
                                <FaUserMd />
                                {lab.appointment_service?.appointment?.doctor?.last_name}{" "}
                                {lab.appointment_service?.appointment?.doctor?.first_name}
                            </span>
                        </div>

                        {/* FILES */}
                        <div className={styles.labFiles}>
                            {lab.labs_files?.length > 0 ? (
                                lab.labs_files.map(file => (
                                    <a
                                        key={file.id}
                                        href={`http://localhost:8000/storage/${file.file_path}`}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.fileChip}
                                    >
                                        <FaDownload />
                                        <span>Завантажити</span>
                                        <span className={styles.fileType}>
                                            {getFileLabel(file)}
                                        </span>
                                    </a>
                                ))
                            ) : (
                                <span className={styles.noFiles}>
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