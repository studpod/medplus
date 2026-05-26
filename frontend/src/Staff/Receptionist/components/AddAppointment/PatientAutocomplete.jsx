import { useEffect, useRef, useState } from "react";
import API from "../../../../api";
import styles from "../../styles/CreateAppointmentPage.module.scss";
import { FaUserPlus } from "react-icons/fa";

export default function PatientAutocomplete({
                                                onSelect,
                                                onCreateNewPatient
                                            }) {

    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [open, setOpen] = useState(false);
    const [searched, setSearched] = useState(false);

    const wrapperRef = useRef(null);

    const formatDate = (date) => {
        if (!date) return "";

        const d = new Date(date);

        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = String(d.getFullYear()).slice(-2);

        return `${day}.${month}.${year}`;
    };

    useEffect(() => {

        if (query.length < 2) {
            setResults([]);
            setOpen(false);
            setSearched(false);
            return;
        }

        const timeout = setTimeout(() => {

            API.get(`/receptionist/view/patients/search?q=${query}`)
                .then(res => {

                    setResults(res.data || []);
                    setOpen(true);
                    setSearched(true);

                })
                .catch(() => {

                    setResults([]);
                    setOpen(false);
                    setSearched(true);

                });

        }, 300);

        return () => clearTimeout(timeout);

    }, [query]);

    useEffect(() => {

        const handleClickOutside = (e) => {

            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };

    }, []);

    const selectPatient = (p) => {

        setQuery(
            `${p.last_name} ${p.first_name} ${p.middle_name || ""}`
        );

        setResults([]);
        setOpen(false);

        onSelect(p);
    };

    const handleCreatePatient = () => {

        const parts = query.trim().split(" ");

        onCreateNewPatient({
            last_name: parts[0] || "",
            first_name: parts[1] || "",
            middle_name: parts[2] || ""
        });

        setOpen(false);
    };

    return (
        <div
            ref={wrapperRef}
            className={styles.autocomplete}
        >

            <input
                type="text"
                placeholder="Введіть ПІБ пацієнта..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => results.length > 0 && setOpen(true)}
                className={styles.autocompleteInput}
            />

            {open && (
                <div className={styles.autocompleteDropdown}>

                    {/* RESULTS */}
                    {results.length > 0 && results.map(p => (
                        <div
                            key={p.id}
                            className={styles.autocompleteItem}
                            onClick={() => selectPatient(p)}
                        >

                            <div className={styles.autocompleteName}>
                                {p.last_name} {p.first_name} {p.middle_name}
                            </div>

                            <div className={styles.autocompleteMeta}>
                                Дата народження: {formatDate(p.date_of_birth)}
                            </div>

                        </div>
                    ))}

                    {/* NOT FOUND */}
                    {searched && results.length === 0 && (
                        <div className={styles.noResults}>

                            <div className={styles.noResultsText}>
                                Пацієнта не знайдено
                            </div>

                            <button
                                type="button"
                                className={styles.createPatientBtn}
                                onClick={handleCreatePatient}
                            >
                                <FaUserPlus />
                                Створити нового пацієнта
                            </button>

                        </div>
                    )}

                </div>
            )}

        </div>
    );
}