import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../../api";
import styles from "../../styles/PatientMedicalCard.module.scss"
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
        <div className={styles.wrapper}>

            {/* PATIENT */}
            <div className={styles.patientCard}>
                <h2 className={styles.patientTitle}>Інформація про пацієнта</h2>

                <div className={styles.patientGrid}>
                    <span className={styles.patientField}>
                        <b>Пацієнт:</b> {patient.last_name} {patient.first_name} {patient.middle_name}
                    </span>
                    <span className={styles.patientField}>
                        <b>Дата народження:</b> {formatDate(patient.date_of_birth)} ({getAge(patient.date_of_birth)} р.)
                    </span>
                    <span className={styles.patientField}><b>Телефон:</b> {patient.phone}</span>
                    <span className={styles.patientField}><b>Email:</b> {patient.email}</span>
                    <span className={styles.patientField}><b>Адреса:</b> {patient.address}</span>
                    <span className={styles.patientField}><b>Нотатки:</b> {patient.notes}</span>
                </div>
            </div>

            {/* HEADER */}
            <div className={styles.header}>
                <div>
                    <h3 className={styles.headerTitle}>Амбулаторна медична картка</h3>
                    <p className={styles.recordsCount}>
                        {appointments.length > 0
                            ? `Записів: ${appointments.length}`
                            : "Записів поки немає"}
                    </p>
                </div>

                <div className={styles.headerActions}>
                    <button
                        className={styles.addBtn}
                        onClick={() => setShowAddModal(true)}
                    >
                        <FaPlus /> Додати запис
                    </button>

                    <span className={styles.arrow} onClick={() => setOpen(!open)}>
                        {open ? "−" : "+"}
                    </span>
                </div>
            </div>

            {/* BODY */}
            {open && (
                <div className={styles.body}>

                    {appointments.length === 0 && (
                        <div className={styles.empty}>Немає записів</div>
                    )}

                    {appointments.length > 0 && (
                        <div className={styles.timeline}>

                            {appointments.map((record) => {

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
                                    <div className={styles.item} key={record.id}>

                                        <div className={styles.dot}></div>

                                        <div className={styles.content}>

                                            {/* HEADER */}
                                            <div className={styles.top}>
                                                <div>
                                                    <span className={styles.doctor}>
                                                        {record.doctor ? (
                                                            <>
                                                                <b>{record.doctor.specialization?.name}</b>:{" "}
                                                                {record.doctor.last_name} {record.doctor.first_name} {record.doctor.middle_name}
                                                            </>
                                                        ) : (
                                                            "Не вказано"
                                                        )}
                                                    </span>

                                                    <span className={styles.date}>
                                                        {formatDate(record.date)}
                                                    </span>
                                                </div>

                                                <span
                                                    className={styles.toggle}
                                                    onClick={() => toggleRecord(record.id)}
                                                >
                                                    {recordOpen ? "−" : "+"}
                                                </span>
                                            </div>

                                            {/* DETAILS */}
                                            {recordOpen && hasAnyContent && (
                                                <div className={styles.details}>

                                                    {/* MEDICAL RECORD */}
                                                    {record.medical_record && (
                                                        <div className={styles.grid}>

                                                            <div className={`${styles.cardItem} ${styles.complaint}`}>
                                                                <div className={styles.title}>Скарга</div>
                                                                <div className={styles.value}>
                                                                    {record.medical_record.chief_complaint}
                                                                </div>
                                                            </div>

                                                            <div className={`${styles.cardItem} ${styles.anamnesis}`}>
                                                                <div className={styles.title}>Анамнез</div>
                                                                <div className={styles.value}>
                                                                    {record.medical_record.anamnesis}
                                                                </div>
                                                            </div>

                                                            <div className={`${styles.cardItem} ${styles.diagnosis}`}>
                                                                <div className={styles.title}>Діагноз</div>
                                                                <div className={styles.value}>
                                                                    {record.medical_record.diagnosis}
                                                                </div>
                                                            </div>

                                                            <div className={`${styles.cardItem} ${styles.treatment}`}>
                                                                <div className={styles.title}>Лікування</div>
                                                                <div className={styles.value}>
                                                                    {record.medical_record.treatment}
                                                                </div>
                                                            </div>

                                                            <div className={`${styles.cardItem} ${styles.prescriptions}`}>
                                                                <div className={styles.title}>Призначення</div>
                                                                <div className={styles.value}>
                                                                    {record.medical_record.prescriptions}
                                                                </div>
                                                            </div>

                                                            <div className={`${styles.cardItem} ${styles.notes}`}>
                                                                <div className={styles.title}>Рекомендації</div>
                                                                <div className={styles.value}>
                                                                    {record.medical_record.notes}
                                                                </div>
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