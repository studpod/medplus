import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api";
import "../styles/patient.scss";
import { toast } from "react-toastify";
import { FaUser, FaPhoneAlt, FaEnvelope, FaBirthdayCake, FaMars, FaVenus, FaRegTrashAlt,
    FaSave, FaRegListAlt, FaPlus } from "react-icons/fa";
import { FcPlus } from "react-icons/fc"
export default function PatientsPage() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFamilyDoctor, setIsFamilyDoctor] = useState(false);
    const [isSelecting, setIsSelecting] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const res = await API.get("/doctor/view/patient/all");

            setPatients(res.data.patients || []);
            setIsFamilyDoctor(res.data.is_family_doctor);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return "";

        const d = new Date(date);

        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = String(d.getFullYear()).slice(-2);

        return `${day}.${month}.${year}`;
    };


    const formatGender = (gender) => {
        if (!gender) return "-";

        switch (gender) {
            case "male":
                return "Чоловік";
            case "female":
                return "Жінка";
            default:
                return gender;
        }
    };
    const getGenderIcon = (gender) => {
        if (gender === "male") return <FaMars />;
        if (gender === "female") return <FaVenus />;
        return null;
    };
    useEffect(() => {
        if (isSelecting) {
            setIsSelecting(false);
            return;
        }

        const delay = setTimeout(() => {
            if (search.length >= 3) {
                handleSearch();
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delay);
    }, [search]);

    const handleSearch = async () => {
        try {
            const res = await API.get(`/doctor/view/patient/search?query=${search}`);
            setSearchResults(res.data.patients || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSelect = (p) => {
        setIsSelecting(true);
        setSelectedPatient(p);
        setSearchResults([]);
        setSearch(`${p.last_name} ${p.first_name} ${p.middle_name}`);
    };

    const handleAddPatient = async () => {
        try {
            await API.get(`/doctor/control/patient/assign?patient_id=${selectedPatient.id}`);

            toast.success("Пацієнта додано");

            setShowModal(false);
            setSelectedPatient(null);
            setSearch("");
            setSearchResults([]);

            fetchPatients();

        } catch (err) {
            if (err.response?.status === 400) {
                toast.error(err.response.data.error);
            } else {
                toast.error("Помилка");
            }
        }
    };
    const handleRemovePatient = async (id) => {


        try {
            await API.delete(`/doctor/control/patient/unassign?patient_id=${id}`);

            toast.success("Пацієнта відкріплено");

            fetchPatients();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || "Помилка");
        }
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest(".search-box")) {
                setSearchResults([]);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    if (loading) {
        return (
            <div className="patients-page">
                <div className="patients-header">
                    <div className="skeleton-title"></div>
                    <div className="skeleton-btn"></div>
                </div>

                <div className="skeleton-table">
                    {[1,2,3,4,5].map(i => (
                        <div key={i} className="skeleton-row"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="patients-page">
            <div className="patients-header">
                <h2>Список пацієнтів</h2>
                {isFamilyDoctor && (
                    <button
                        className="add-patient-btn"
                        onClick={() => setShowModal(true)}
                    >
                        <FaPlus /> Додати пацієнта
                    </button>
                )}
            </div>

            <table className="patients-table">
                <thead>
                <tr>
                    <th>ПІБ</th>
                    <th>Дата народження</th>
                    <th>Телефон</th>
                    <th>Email</th>
                    <th>Дії</th>
                </tr>
                </thead>
                <tbody>
                {patients.map((p) => (
                    <tr key={p.id}>
                        <td>
                            <div className="td-with-icon">
                                <FaUser />
                                {p.last_name} {p.first_name} {p.middle_name}
                            </div>
                        </td>

                        <td>
                            <div className="td-with-icon">
                                <FaBirthdayCake />
                                {formatDate(p.date_of_birth)}
                            </div>
                        </td>

                        <td>
                            <div className="td-with-icon">
                                <FaPhoneAlt />
                                {p.phone}
                            </div>
                        </td>

                        <td>
                            <div className="td-with-icon">
                                <FaEnvelope />
                                {p.email || "-"}
                            </div>
                        </td>

                        <td>
                            <div className="actions">
                                <Link to={`/staff/patient/${p.id}/medical-card`}>
                                    <button className="btn-med">
                                        <FaRegListAlt /> Мед. карта
                                    </button>
                                </Link>

                                {isFamilyDoctor && (
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleRemovePatient(p.id)}
                                    >
                                        <FaRegTrashAlt /> Видалити
                                    </button>
                                )}
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>


            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Пошук пацієнта</h3>


                        <div className="search-box">
                            <input
                                className="modal-input"
                                type="text"
                                placeholder="Введіть ПІБ (мін 3 символи)"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />

                            {searchResults.length > 0 && (
                                <div className="search-dropdown">
                                    {searchResults.map((p) => (
                                        <div
                                            key={p.id}
                                            className="search-item"
                                            onClick={() => handleSelect(p)}
                                        >
                                            <span className="name">
                                                {p.last_name} {p.first_name} {p.middle_name}
                                            </span>
                                            <span className="sub">
                                                {formatDate(p.date_of_birth)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>


                        {selectedPatient && (
                            <div className="patient-preview">
                                <div className="preview-header">
                                    <div className="avatar">
                                        <FaUser />
                                    </div>

                                    <div className="preview-name">
                                        {selectedPatient.last_name} {selectedPatient.first_name} {selectedPatient.middle_name}
                                        <div className="preview-sub">
                                            {getGenderIcon(selectedPatient.gender)} {formatGender(selectedPatient.gender)}
                                        </div>
                                    </div>
                                </div>

                                <div className="preview-info">
                                    <div className="info-row">
                <span className="label">
                    <FaPhoneAlt /> Телефон
                </span>
                                        <span>{selectedPatient.phone || "-"}</span>
                                    </div>

                                    <div className="info-row">
                <span className="label">
                    <FaEnvelope /> Email
                </span>
                                        <span>{selectedPatient.email || "-"}</span>
                                    </div>

                                    <div className="info-row">
                <span className="label">
                    <FaBirthdayCake /> Дата народження
                </span>
                                        <span>{formatDate(selectedPatient.date_of_birth)}</span>
                                    </div>
                                </div>

                                <button
                                    className="confirm-btn"
                                    onClick={handleAddPatient}
                                >
                                    Додати пацієнта
                                </button>
                            </div>
                        )}

                        <button
                            className="cancel-btn"
                            onClick={() => setShowModal(false)}
                        >
                            Закрити
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}