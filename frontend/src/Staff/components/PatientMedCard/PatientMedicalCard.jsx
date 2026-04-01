import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../../api";
import "../../../components/Cabinet/MedicalRecordsSection.scss";
import AddMedicalRecordModal from "./AddMedicalRecordModal";



export default function PatientMedicalCard() {
    const { patientId } = useParams();


    const [patient, setPatient] = useState(null);
    const [records, setRecords] = useState([]);


    const [open, setOpen] = useState(true);
    const [expandedRecords, setExpandedRecords] = useState([]);
    const [expandedLabs, setExpandedLabs] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await API.get(`/doctor/view/patient/${patientId}/medical-card`);

                setPatient(res.data.patient);
                setRecords(res.data.medical_records);
                console.log(res.data.patient);

            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, [patientId]);

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

    if (!patient) return <div>Пацієнт не знайдений</div>;

    return (
        <div className="accordion-card">
            {/* --- Блок інформації про пацієнта --- */}
            <div className="patient-info-block">
                <h2>Інформація про пацієнта</h2>

                <div className="patient-meta">

                    <span>
            <b>Пацієнт:</b> {patient.last_name} {patient.first_name} {patient.middle_name}
          </span>
                    <span><b>Дата народження:</b> {patient.date_of_birth}</span>
                    <span><b>Телефон:</b> {patient.phone}</span>
                    <span><b>Email:</b> {patient.email}</span>
                    <span><b>Адреса проживання:</b>{patient.address}</span>
                    <span><b>Нотатки до пацієнта:</b>{patient.notes}</span>

                </div>

            </div>

            {/* --- Акордеон з медичною карткою --- */}
            <div className="accordion-header">
                <div>
                    <h3>Амбулаторна медична картка</h3>
                    <p className="records-count">
                        {records.length > 0 ? `Записів: ${records.length}` : "Записів поки немає"}
                    </p>
                </div>

                <div className="header-actions">

                    <button
                        className="add-record-btn"
                        onClick={() => setShowAddModal(true)}
                    >
                        ➕ Додати запис
                    </button>

                    <span
                        className="arrow"
                        onClick={() => setOpen(!open)}
                    >
            {open ? "−" : "+"}
        </span>

                </div>
            </div>

            {open && (
                <div className="accordion-body">
                    {records.length === 0 && <div className="empty">Немає записів</div>}
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
                                            <div className="timeline-header">
                                                <div className="doctor-info">
                                                    {/*<span className="doctor">*/}
                                                    {/*  {record.doctor_specialization}: {doctorName}*/}
                                                    {/*</span>*/}
                                                    <span>
    {record.appointment?.doctor ? (
        <>
            <b>{record.appointment.doctor.specialization?.name}</b>:{" "}
            {record.appointment.doctor.last_name} {record.appointment.doctor.first_name}
        </>
    ) : (
        "Не вказано"
    )}
</span>
                                                    <span className="date">{date}</span>
                                                </div>

                                                <div className="record-actions">

                                                    <button
                                                        className="edit-record-btn"
                                                        onClick={() => {
                                                            setEditingRecord(record);
                                                            setShowAddModal(true);
                                                        }}
                                                    >
                                                        🖊 Редагувати
                                                    </button>

                                                    <span
                                                        className="record-toggle"
                                                        onClick={() => toggleRecord(record.id)}
                                                    >
        {recordOpen ? "−" : "+"}
    </span>

                                                </div>
                                            </div>

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
                                                            <div className="card-title">Первинний огляд</div>
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

                                                    {record.services?.length > 0 && (
                                                        <div className="labs-section">
                                                            <div
                                                                className="labs-header"
                                                                onClick={() => toggleLabs(record.id)}
                                                            >
                                                                <span className="labs-title">Аналізи</span>
                                                                <span className={`labs-arrow ${labsOpen ? "open" : ""}`}></span>
                                                            </div>

                                                            {labsOpen && (
                                                                <div className="labs-list">
                                                                    {record.services.map((service) =>
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
                                                                    )}
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
            )}
            <AddMedicalRecordModal
                isOpen={showAddModal}
                onClose={() => {
                    setShowAddModal(false);
                    setEditingRecord(null);
                }}
                patientId={patientId}
                record={editingRecord}
                records={records}
            />

        </div>

    );
}
