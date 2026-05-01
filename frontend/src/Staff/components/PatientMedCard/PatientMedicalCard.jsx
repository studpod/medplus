import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../../api";
import "../../../components/Cabinet/MedicalRecordsSection.scss";
import AddMedicalRecordModal from "./AddMedicalRecordModal";
import { FaPlus } from "react-icons/fa";

export default function PatientMedicalCard() {
    const { patientId } = useParams();

    const [patient, setPatient] = useState(null);
    const [appointments, setAppointments] = useState([]);

    const [open, setOpen] = useState(true);
    const [expandedRecords, setExpandedRecords] = useState([]);
    const [expandedDiagnostics, setExpandedDiagnostics] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);

    const formatDate = (date) => {
        if (!date) return "";
        const d = new Date(date);
        return `${String(d.getDate()).padStart(2, "0")}.${String(
            d.getMonth() + 1
        ).padStart(2, "0")}.${d.getFullYear()}`;
    };

    const getAge = (date) => {
        if (!date) return "";
        const today = new Date();
        const birth = new Date(date);

        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await API.get(
                    `/doctor/view/patient/${patientId}/medical-card`
                );

                setPatient(res.data.patient);
                setAppointments(res.data.appointments || []);
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, [patientId]);

    const toggleRecord = (id) => {
        setExpandedRecords((prev) =>
            prev.includes(id)
                ? prev.filter((r) => r !== id)
                : [...prev, id]
        );
    };

    const toggleDiagnostics = (id) => {
        setExpandedDiagnostics((prev) =>
            prev.includes(id)
                ? prev.filter((r) => r !== id)
                : [...prev, id]
        );
    };

    if (!patient) return <div>Пацієнт не знайдений</div>;

    return (
        <div className="accordion-card">

            {/* PATIENT */}
            <div className="patient-info-block">
                <h2>Інформація про пацієнта</h2>

                <div className="patient-meta">
                    <span>
                        <b>Пацієнт:</b> {patient.last_name} {patient.first_name} {patient.middle_name}
                    </span>
                    <span>
                        <b>Дата народження:</b> {formatDate(patient.date_of_birth)} ({getAge(patient.date_of_birth)} р.)
                    </span>
                    <span><b>Телефон:</b> {patient.phone}</span>
                    <span><b>Email:</b> {patient.email}</span>
                    <span><b>Адреса:</b> {patient.address}</span>
                    <span><b>Нотатки:</b> {patient.notes}</span>
                </div>
            </div>

            {/* HEADER */}
            <div className="accordion-header">
                <div>
                    <h3>Амбулаторна медична картка</h3>
                    <p className="records-count">
                        {appointments.length > 0
                            ? `Записів: ${appointments.length}`
                            : "Записів поки немає"}
                    </p>
                </div>

                <div className="header-actions">
                    <button
                        className="add-record-btn"
                        onClick={() => setShowAddModal(true)}
                    >
                        <FaPlus /> Додати запис
                    </button>

                    <span className="arrow" onClick={() => setOpen(!open)}>
                        {open ? "−" : "+"}
                    </span>
                </div>
            </div>

            {/* BODY */}
            {open && (
                <div className="accordion-body">

                    {appointments.length === 0 && (
                        <div className="empty">Немає записів</div>
                    )}

                    {appointments.length > 0 && (
                        <div className="timeline">

                            {appointments.map((item) => {
                                const record = item;

                                const recordOpen = expandedRecords.includes(record.id);
                                const diagnosticsOpen =
                                    expandedDiagnostics.includes(`diag_${record.id}`);

                                const hasDiagnostics =
                                    record.appointment_services?.some(
                                        (s) => s.service?.type === "diagnostics"
                                    );

                                const hasAnyContent =
                                    record.medical_record || hasDiagnostics;

                                return (
                                    <div className="timeline-item" key={record.id}>
                                        <div className="timeline-dot"></div>

                                        <div className="timeline-content">

                                            {/* HEADER */}
                                            <div className="timeline-header">
                                                <div className="doctor-info">
                                                    <span>
                                                        {record.doctor ? (
                                                            <>
                                                                <b>{record.doctor.specialization?.name}</b>:{" "}
                                                                {record.doctor.last_name} {record.doctor.first_name} {record.doctor.middle_name}
                                                            </>
                                                        ) : (
                                                            "Не вказано"
                                                        )}
                                                    </span>

                                                    <span className="date">{formatDate(record.date)}</span>
                                                </div>

                                                <div className="record-actions">
                                                    <span
                                                        className="record-toggle"
                                                        onClick={() => toggleRecord(record.id)}
                                                    >
                                                        {recordOpen ? "−" : "+"}
                                                    </span>
                                                </div>
                                            </div>
                                            {recordOpen && hasAnyContent && (
                                                <div className="record-details">

                                                    {/* MEDICAL RECORD */}
                                                    {record.medical_record && (
                                                        <div className="record-grid">

                                                            <div className="record-card complaint">
                                                                <div className="card-title">Скарга</div>
                                                                <div className="card-value">
                                                                    {record.medical_record.chief_complaint}
                                                                </div>
                                                            </div>

                                                            <div className="record-card anamnesis">
                                                                <div className="card-title">Анамнез</div>
                                                                <div className="card-value">
                                                                    {record.medical_record.anamnesis}
                                                                </div>
                                                            </div>

                                                            <div className="record-card diagnosis">
                                                                <div className="card-title">Діагноз</div>
                                                                <div className="card-value">
                                                                    {record.medical_record.diagnosis}
                                                                </div>
                                                            </div>

                                                            <div className="record-card treatment">
                                                                <div className="card-title">Лікування</div>
                                                                <div className="card-value">
                                                                    {record.medical_record.treatment}
                                                                </div>
                                                            </div>

                                                            <div className="record-card prescription">
                                                                <div className="card-title">Призначення</div>
                                                                <div className="card-value">
                                                                    {record.medical_record.prescriptions}
                                                                </div>
                                                            </div>

                                                            <div className="record-card notes">
                                                                <div className="card-title">Рекомендації</div>
                                                                <div className="card-value">
                                                                    {record.medical_record.notes}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* DIAGNOSTICS */}
                                                    {hasDiagnostics && (
                                                        <div className="diagnostics-section">

                                                            <div
                                                                className="diagnostics-header"
                                                                onClick={() =>
                                                                    toggleDiagnostics(`diag_${record.id}`)
                                                                }
                                                            >
                                                                <span className="diagnostics-title">
                                                                    Діагностика
                                                                </span>

                                                                <span className={`diagnostics-arrow ${diagnosticsOpen ? "open" : ""}`}>
                                                                    ▼
                                                                </span>
                                                            </div>

                                                            {diagnosticsOpen && (
                                                                <div className="diagnostics-list">

                                                                    {record.appointment_services
                                                                        .filter(
                                                                            (s) => s.service?.type === "diagnostics"
                                                                        )
                                                                        .map((service) => {
                                                                            const report = service.diagnostic_report;

                                                                            return (
                                                                                <div key={service.id} className="diagnostic-card">

                                                                                    <div className="diagnostic-name">
                                                                                        {service.service?.name}
                                                                                    </div>

                                                                                    {report ? (
                                                                                        <>
                                                                                            <div className="diagnostic-field">
                                                                                                <b>Опис:</b> {report.description}
                                                                                            </div>
                                                                                            <div className="diagnostic-field">
                                                                                                <b>Результати:</b> {report.results}
                                                                                            </div>
                                                                                            <div className="diagnostic-field">
                                                                                                <b>Висновок:</b> {report.conclusion}
                                                                                            </div>
                                                                                            <div className="diagnostic-field">
                                                                                                <b>Рекомендації:</b> {report.recommendations}
                                                                                            </div>
                                                                                        </>
                                                                                    ) : (
                                                                                        <div className="diagnostic-empty">
                                                                                            Діагностику ще не додано
                                                                                        </div>
                                                                                    )}

                                                                                </div>
                                                                            );
                                                                        })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                </div>
                                            )}
                                            {recordOpen && !hasAnyContent && (
                                                <div className="record-details">
                                                    <div className="diagnostic-empty">
                                                        Немає даних по цьому прийому
                                                    </div>
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
                records={appointments}
            />
        </div>
    );
}