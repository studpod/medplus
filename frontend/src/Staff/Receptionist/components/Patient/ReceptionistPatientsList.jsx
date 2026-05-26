import { useState } from "react";
import API from "../../../../api";
import { toast } from "react-toastify";


import {
    FaChevronDown,
    FaChevronUp,
    FaUserMd,
    FaPhoneAlt,
    FaMapMarkerAlt,
    FaUserCheck,
    FaUserTimes,
    FaEdit,
    FaSave,
    FaTimes
} from "react-icons/fa";

import styles from "../../styles/ReceptionistPatientsPage.module.scss";

function formatGender(gender) {

    if (gender === "male") return "Чоловік";
    if (gender === "female") return "Жінка";

    return "Не вказано";
}

function formatDate(date) {

    return new Date(date).toLocaleDateString("uk-UA");
}

export default function ReceptionistPatientsList({
                                                     patients,
                                                     setPatients
                                                 }) {

    const [expanded, setExpanded] = useState(null);

    const [editingPatient, setEditingPatient] = useState(null);

    const [editForm, setEditForm] = useState({
        last_name: "",
        first_name: "",
        middle_name: "",
        gender: "",
        phone: "",
        address: "",
        date_of_birth: "",
        notes: ""
    });

    const startEdit = (patient) => {

        setEditingPatient(patient.id);

        setEditForm({
            last_name: patient.last_name || "",
            first_name: patient.first_name || "",
            middle_name: patient.middle_name || "",
            gender: patient.gender || "",
            phone: patient.phone || "",
            address: patient.address || "",
            date_of_birth: patient.date_of_birth || "",
            notes: patient.notes || ""
        });
    };

    const cancelEdit = () => {

        setEditingPatient(null);

        setEditForm({
            last_name: "",
            first_name: "",
            middle_name: "",
            gender: "",
            phone: "",
            address: "",
            date_of_birth: "",
            notes: ""
        });
    };

    const savePatient = async (patientId) => {

        try {

            const res = await API.put(
                `/receptionist/control/patients/${patientId}`,
                editForm
            );

            setPatients(prev =>
                prev.map(p => {

                    if (p.id !== patientId) {
                        return p;
                    }

                    return {
                        ...p,

                        last_name: editForm.last_name,
                        first_name: editForm.first_name,
                        middle_name: editForm.middle_name,
                        gender: editForm.gender,
                        phone: editForm.phone,
                        address: editForm.address,
                        date_of_birth: editForm.date_of_birth,
                        notes: editForm.notes,

                        full_name:
                            `${editForm.last_name} ${editForm.first_name} ${editForm.middle_name}`
                    };
                })
            );

            toast.success("Дані пацієнта оновлено");

            setEditingPatient(null);

        } catch (e) {

            console.log(e);

            toast.error("Помилка оновлення пацієнта");
        }
    };

    return (
        <div className={styles.table}>

            <div className={styles.tableHeader}>

                <div>ПІБ</div>
                <div>Дата народження</div>
                <div>Стать</div>
                <div>Аккаунт</div>
                <div></div>

            </div>

            {patients.map(patient => {

                const isOpen = expanded === patient.id;

                const isEditing =
                    editingPatient === patient.id;

                return (
                    <div
                        key={patient.id}
                        className={styles.rowWrapper}
                    >

                        <div className={styles.tableRow}>

                            <div>
                                {patient.full_name}
                            </div>

                            <div>
                                {formatDate(patient.date_of_birth)}
                            </div>

                            <div>
                                {formatGender(patient.gender)}
                            </div>

                            <div>

                                {patient.has_account ? (
                                    <span className={styles.hasAccount}>
                                        <FaUserCheck />
                                        Має аккаунт
                                    </span>
                                ) : (
                                    <span className={styles.noAccount}>
                                        <FaUserTimes />
                                        Немає аккаунта
                                    </span>
                                )}

                            </div>

                            <div className={styles.actions}>

                                {!patient.has_account && (
                                    <button
                                        className={styles.editBtn}
                                        onClick={() =>
                                            startEdit(patient)
                                        }
                                    >
                                        <FaEdit />
                                    </button>
                                )}

                                <button
                                    className={styles.expandBtn}
                                    onClick={() =>
                                        setExpanded(
                                            isOpen
                                                ? null
                                                : patient.id
                                        )
                                    }
                                >

                                    {isOpen
                                        ? <FaChevronUp />
                                        : <FaChevronDown />
                                    }

                                </button>

                            </div>

                        </div>

                        {isOpen && (
                            <div className={styles.details}>

                                {isEditing ? (

                                    <div className={styles.editForm}>

                                        <div className={styles.editGrid}>

                                            <input
                                                type="text"
                                                placeholder="Прізвище"
                                                value={editForm.last_name}
                                                onChange={(e) =>
                                                    setEditForm(prev => ({
                                                        ...prev,
                                                        last_name: e.target.value
                                                    }))
                                                }
                                            />

                                            <input
                                                type="text"
                                                placeholder="Ім'я"
                                                value={editForm.first_name}
                                                onChange={(e) =>
                                                    setEditForm(prev => ({
                                                        ...prev,
                                                        first_name: e.target.value
                                                    }))
                                                }
                                            />

                                            <input
                                                type="text"
                                                placeholder="По батькові"
                                                value={editForm.middle_name}
                                                onChange={(e) =>
                                                    setEditForm(prev => ({
                                                        ...prev,
                                                        middle_name: e.target.value
                                                    }))
                                                }
                                            />

                                            <select
                                                value={editForm.gender}
                                                onChange={(e) =>
                                                    setEditForm(prev => ({
                                                        ...prev,
                                                        gender: e.target.value
                                                    }))
                                                }
                                            >
                                                <option value="">
                                                    Стать
                                                </option>

                                                <option value="male">
                                                    Чоловік
                                                </option>

                                                <option value="female">
                                                    Жінка
                                                </option>
                                            </select>

                                            <input
                                                type="date"
                                                value={editForm.date_of_birth}
                                                onChange={(e) =>
                                                    setEditForm(prev => ({
                                                        ...prev,
                                                        date_of_birth: e.target.value
                                                    }))
                                                }
                                            />

                                            <input
                                                type="text"
                                                placeholder="Телефон"
                                                value={editForm.phone}
                                                onChange={(e) =>
                                                    setEditForm(prev => ({
                                                        ...prev,
                                                        phone: e.target.value
                                                    }))
                                                }
                                            />

                                        </div>

                                        <input
                                            type="text"
                                            placeholder="Адреса"
                                            className={styles.fullWidth}
                                            value={editForm.address}
                                            onChange={(e) =>
                                                setEditForm(prev => ({
                                                    ...prev,
                                                    address: e.target.value
                                                }))
                                            }
                                        />

                                        <textarea
                                            placeholder="Нотатки"
                                            className={styles.fullWidth}
                                            value={editForm.notes}
                                            onChange={(e) =>
                                                setEditForm(prev => ({
                                                    ...prev,
                                                    notes: e.target.value
                                                }))
                                            }
                                        />

                                        <div className={styles.editActions}>

                                            <button
                                                className={styles.saveBtn}
                                                onClick={() =>
                                                    savePatient(patient.id)
                                                }
                                            >
                                                <FaSave />
                                                Зберегти
                                            </button>

                                            <button
                                                className={styles.cancelBtn}
                                                onClick={cancelEdit}
                                            >
                                                <FaTimes />
                                                Скасувати
                                            </button>

                                        </div>

                                    </div>

                                ) : (

                                    <>
                                        <div className={styles.detailItem}>
                                            <FaPhoneAlt />
                                            {patient.phone}
                                        </div>

                                        <div className={styles.detailItem}>
                                            <FaMapMarkerAlt />
                                            {patient.address}
                                        </div>

                                        <div className={styles.detailItem}>
                                            <FaUserMd />

                                            Сімейний лікар:{" "}
                                            {patient.family_doctor || "не призначений"}
                                        </div>

                                        {patient.notes && (
                                            <div className={styles.notes}>
                                                {patient.notes}
                                            </div>
                                        )}
                                    </>

                                )}

                            </div>
                        )}

                    </div>
                );
            })}
        </div>
    );
}