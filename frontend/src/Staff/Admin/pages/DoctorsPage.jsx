import { useEffect, useState } from "react";
import styles from "../styles/doctors.module.scss";
import { toast } from "react-toastify";

import {
    getDoctors,
    createDoctor,
    updateDoctor,
    deleteDoctor
} from "../../../api/admin/doctors";

import { getSpecializations }
    from "../../../api/admin/specializations";

import DoctorsTable from "../components/doctors/DoctorsTable";
import DoctorModal from "../components/doctors/DoctorModal";

export default function DoctorsPage() {

    const [doctors, setDoctors] = useState([]);
    const [specializations, setSpecializations] = useState([]);

    const [search, setSearch] = useState("");

    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        loadDoctors();
        loadSpecializations();
    }, [search]);

    const loadDoctors = async () => {
        try {
            const res = await getDoctors({ search });
            setDoctors(res.data.doctors);
        } catch (err) {
            toast.error("Не вдалося завантажити лікарів");
        }
    };

    const loadSpecializations = async () => {
        try {
            const res = await getSpecializations();

            setSpecializations(
                res.data.specializations || []
            );

        } catch (err) {
            toast.error("Не вдалося завантажити спеціалізації");
        }
    };

    const handleSave = async (data) => {

        try {

            if (selectedDoctor) {

                await updateDoctor(selectedDoctor.id, data);

                toast.success("Лікаря оновлено");

            } else {

                await createDoctor(data);

                toast.success("Лікаря створено");
            }

            setModalOpen(false);
            setSelectedDoctor(null);

            loadDoctors();

        } catch (err) {

            console.log(err);

            toast.error(
                err.response?.data?.message ||
                "Помилка"
            );
        }
    };

    const handleDelete = async (id) => {

        try {

            await deleteDoctor(id);

            toast.success("Лікаря видалено");

            loadDoctors();

        } catch (err) {

            toast.error("Помилка при видаленні");
        }
    };

    return (
        <div className={styles.page}>

            <div className={styles.header}>

                <h1>Лікарі</h1>

                <div className={styles.actions}>

                    <input
                        placeholder="Пошук..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                    <button
                        onClick={() => {
                            setSelectedDoctor(null);
                            setModalOpen(true);
                        }}
                    >
                        + Додати лікаря
                    </button>

                </div>
            </div>

            <DoctorsTable
                doctors={doctors}
                onEdit={(doc) => {
                    setSelectedDoctor(doc);
                    setModalOpen(true);
                }}
                onDelete={handleDelete}
            />

            {modalOpen && (
                <DoctorModal
                    doctor={selectedDoctor}
                    specializations={specializations}
                    onClose={() => {
                        setModalOpen(false);
                        setSelectedDoctor(null);
                    }}
                    onSave={handleSave}
                />
            )}

        </div>
    );
}