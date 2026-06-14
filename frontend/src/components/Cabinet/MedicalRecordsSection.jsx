import { useState } from "react";
import styles from "./MedicalRecordsSection.module.scss";

export default function MedicalRecordsSection({ records }) {
    const [expandedRecords, setExpandedRecords] = useState([]);
    const [expandedLabs, setExpandedLabs] = useState([]);

    const toggleRecord = (id) => {
        setExpandedRecords((prev) =>
            prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
        );
    };

    const toggleLabs = (id) => {
        setExpandedLabs((prev) =>
            prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
        );
    };

    const formatDate = (date) => {
        if (!date) return "";
        const d = new Date(date);

        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = String(d.getFullYear()).slice(-2);

        return `${day}.${month}.${year}`;
    };

    return (
        <div className={styles.accordion}>

            <div className={styles.header}>
                <div>
                    <h3>Амбулаторна медична картка</h3>
                    <p className={styles.count}>
                        {records?.length > 0
                            ? `Записів: ${records.length}`
                            : "Записів поки немає"}
                    </p>
                </div>
            </div>

            <div className={styles.body}>

                {(!records || records.length === 0) && (
                    <div className={styles.empty}>Немає записів</div>
                )}

                {records?.length > 0 && (
                    <div className={styles.timeline}>

                        {records.map((record) => {
                            const recordOpen = expandedRecords.includes(record.id);

                            const labsOpen = expandedLabs.includes(record.id);

                            const doctorName = record.doctor_full_name || "Лікар не вказаний";

                            const date = record.date || "";

                            return (
                                <div className={styles.item} key={record.id}>

                                    <div className={styles.dot}></div>

                                    <div className={styles.content}>

                                        {/* TOP */}
                                        <div className={styles.top}>
                                            <div>
                                                <div className={styles.doctor}>
                                                    {record.doctor_specialization}: {doctorName}
                                                </div>

                                                <div className={styles.date}>
                                                    {formatDate(date)}
                                                </div>
                                            </div>

                                            <div
                                                className={styles.toggle}
                                                onClick={() => toggleRecord(record.id)}
                                            >
                                                {recordOpen ? "−" : "+"}
                                            </div>
                                        </div>

                                        {/* DETAILS */}
                                        {recordOpen && (
                                            <div className={styles.details}>

                                                {/* MEDICAL RECORD */}
                                                {record.has_medical_record && (
                                                    <div className={styles.grid}>

                                                        <div className={`${styles.card} ${styles.complaint}`}>
                                                            <div className={styles.title}>Скарга</div>
                                                            <div className={styles.value}>
                                                                {record.medical_record?.chief_complaint || "Не вказано"}
                                                            </div>
                                                        </div>

                                                        <div className={`${styles.card} ${styles.anamnesis}`}>
                                                            <div className={styles.title}>Анамнез</div>
                                                            <div className={styles.value}>
                                                                {record.medical_record?.anamnesis || "Не вказано"}
                                                            </div>
                                                        </div>

                                                        <div className={`${styles.card} ${styles.initial}`}>
                                                            <div className={styles.title}>Первинний огляд</div>
                                                            <div className={styles.value}>
                                                                {record.medical_record?.initial_review || "Не вказано"}
                                                            </div>
                                                        </div>

                                                        <div className={`${styles.card} ${styles.diagnosis}`}>
                                                            <div className={styles.title}>Діагноз</div>
                                                            <div className={styles.value}>
                                                                {record.medical_record?.diagnosis || "Не вказано"}
                                                            </div>
                                                        </div>

                                                        <div className={`${styles.card} ${styles.treatment}`}>
                                                            <div className={styles.title}>Лікування</div>
                                                            <div className={styles.value}>
                                                                {record.medical_record?.treatment || "Не вказано"}
                                                            </div>
                                                        </div>

                                                        <div className={`${styles.card} ${styles.prescriptions}`}>
                                                            <div className={styles.title}>Призначення</div>
                                                            <div className={styles.value}>
                                                                {record.medical_record?.prescriptions || "Не вказано"}
                                                            </div>
                                                        </div>

                                                        <div className={`${styles.card} ${styles.notes}`}>
                                                            <div className={styles.title}>Рекомендації</div>
                                                            <div className={styles.value}>
                                                                {record.medical_record?.notes || "Не вказано"}
                                                            </div>
                                                        </div>

                                                    </div>
                                                )}

                                                {/* DIAGNOSTICS */}
                                                {record.has_diagnostics && (
                                                    <div className={styles.diagnostics}>

                                                        <div className={styles.diagnosticsHeader}>
                                                            Діагностика
                                                        </div>

                                                        <div className={styles.diagnosticsList}>

                                                            {record.services?.map((service) =>
                                                                    service.diagnostic && (
                                                                        <div
                                                                            key={service.diagnostic.id}
                                                                            className={styles.diagnosticCard}
                                                                        >

                                                                            <div className={styles.diagnosticName}>
                                                                                {service.name}
                                                                            </div>

                                                                            {service.diagnostic.description && (
                                                                                <div className={styles.diagnosticField}>
                                                                                    <b>Опис:</b> {service.diagnostic.description}
                                                                                </div>
                                                                            )}

                                                                            {service.diagnostic.results && (
                                                                                <div className={styles.diagnosticField}>
                                                                                    <b>Результати:</b> {service.diagnostic.results}
                                                                                </div>
                                                                            )}

                                                                            {service.diagnostic.conclusion && (
                                                                                <div className={styles.diagnosticField}>
                                                                                    <b>Висновок:</b> {service.diagnostic.conclusion}
                                                                                </div>
                                                                            )}

                                                                            {service.diagnostic.recommendations && (
                                                                                <div className={styles.diagnosticField}>
                                                                                    <b>Рекомендації:</b> {service.diagnostic.recommendations}
                                                                                </div>
                                                                            )}

                                                                        </div>
                                                                    )
                                                            )}

                                                        </div>
                                                    </div>
                                                )}

                                            </div>
                                        )}

                                    </div>
                                </div>
                            );
                        })}

                    </div>
                )}

            </div>
        </div>
    );
}