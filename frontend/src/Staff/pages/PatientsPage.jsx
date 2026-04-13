import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api";
import "../styles/patient.scss";
import { toast } from "react-toastify";

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
                            {p.last_name} {p.first_name} {p.middle_name}
                        </td>
                        <td>{p.date_of_birth}</td>
                        <td>{p.phone}</td>
                        <td>{p.email || "-"}</td>
                        <td>
                            <Link to={`/staff/patient/${p.id}/medical-card`}>
                                <button>Мед. карта</button>
                            </Link>
                            {isFamilyDoctor && (
                                <button
                                    className="add-patient-btn"
                                    onClick={() => setShowModal(true)}
                                >
                                    + Додати пацієнта
                                </button>
                            )}
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
                                                {p.date_of_birth}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>


                        {selectedPatient && (
                            <div className="patient-preview">
                                <p>
                                    <b>ПІБ:</b> {selectedPatient.last_name} {selectedPatient.first_name} {selectedPatient.middle_name}
                                </p>
                                <p><b>Телефон:</b> {selectedPatient.phone}</p>
                                <p><b>Email:</b> {selectedPatient.email}</p>
                                <p><b>Дата народження:</b> {selectedPatient.date_of_birth}</p>

                                <button
                                    className="confirm-btn"
                                    onClick={handleAddPatient}
                                >
                                    Додати
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