import { useState } from "react";
import "./MedicalRecordsSection.scss";

export default function MedicalRecordsSection({ records }) {

    const [open, setOpen] = useState(false);
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

    return (
        <div className="accordion-card">

            {/* HEADER */}
            <div className="accordion-header" onClick={() => setOpen(!open)}>

                <div>
                    <h3>Амбулаторна медична картка</h3>

                    <p className="records-count">
                        {records.length > 0
                            ? `Записів: ${records.length}`
                            : "Записів поки немає"}
                    </p>
                </div>



            </div>

            {/* BODY */}


                <div className="accordion-body">

                    {records.length === 0 && (
                        <div className="empty">Немає записів</div>
                    )}

                    {records.length > 0 && (

                        <div className="timeline">

                            {records.map((record) => {

                                const recordOpen = expandedRecords.includes(record.id);
                                const labsOpen = expandedLabs.includes(record.id);

                                const doctorName = record.appointment?.doctor
                                    ? `${record.appointment.doctor.last_name} ${record.appointment.doctor.first_name}`
                                    : "Лікар не вказаний";

                                const date = record.appointment?.date || "Дата не вказана";

                                return (

                                    <div className="timeline-item" key={record.id}>

                                        <div className="timeline-dot"></div>

                                        <div className="timeline-content">

                                            {/* HEADER */}
                                            <div className="timeline-header">

                                                <div className="doctor-info">

                                                    <span className="doctor">
                                                        {record.doctor_specialization}: {doctorName}
                                                    </span>

                                                    <span className="date">
                                                        {date}
                                                    </span>

                                                </div>

                                                <span
                                                    className="record-toggle"
                                                    onClick={() => toggleRecord(record.id)}
                                                >
                                                    {recordOpen ? "−" : "+"}
                                                </span>

                                            </div>


                                            {/* DETAILS */}
                                            {recordOpen && (

                                                <div className="record-details">

                                                    <div className="record-grid">

                                                        <div className="record-card complaint">
                                                            <div className="card-title">Скарга</div>
                                                            <div className="card-value">
                                                                {record.chief_complaint || "Не вказано"}
                                                            </div>
                                                        </div>

                                                        <div className="record-card anamnesis">
                                                            <div className="card-title">Анамнез</div>
                                                            <div className="card-value">
                                                                {record.anamnesis || "Не вказано"}
                                                            </div>
                                                        </div>
                                                        <div className="record-card anamnesis">
                                                            <div className="card-title">Первиний огляд</div>
                                                            <div className="card-value">
                                                                {record.initial_review  || "Не вказано"}
                                                            </div>
                                                        </div>
                                                        <div className="record-card diagnosis">
                                                            <div className="card-title">Діагноз</div>
                                                            <div className="card-value">
                                                                {record.diagnosis || "Не вказано"}
                                                            </div>
                                                        </div>

                                                        <div className="record-card treatment">
                                                            <div className="card-title">Лікування</div>
                                                            <div className="card-value">
                                                                {record.treatment || "Не вказано"}
                                                            </div>
                                                        </div>

                                                        <div className="record-card prescription">
                                                            <div className="card-title">Призначення</div>
                                                            <div className="card-value">
                                                                {record.prescriptions || "Не вказано"}
                                                            </div>
                                                        </div>

                                                        <div className="record-card notes">
                                                            <div className="card-title">Рекомендації</div>
                                                            <div className="card-value">
                                                                {record.notes || "Не вказано"}
                                                            </div>
                                                        </div>

                                                    </div>
                                                    {/* LABS */}
                                                    {record.services?.length > 0 && (

                                                        <div className="labs-section">

                                                            <div
                                                                className="labs-header"
                                                                onClick={() => toggleLabs(record.id)}>

                                                <span className="labs-title">
                                                    Аналізи
                                                </span>
                                                                <span className={`labs-arrow ${labsOpen ? "open" : ""}`}></span>
                                                            </div>

                                                            {labsOpen && (

                                                                <div className="labs-list">

                                                                    {record.services.map((service) => (

                                                                        service.labs?.map((lab) =>
                                                                            lab.files?.map((file) => (

                                                                                <a
                                                                                    key={file.id}
                                                                                    href={file.path}
                                                                                    download
                                                                                    className="download-btn lab-download"
                                                                                >
                                                                                    {service.name}
                                                                                </a>

                                                                            ))
                                                                        )

                                                                    ))}

                                                                </div>

                                                            )}

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