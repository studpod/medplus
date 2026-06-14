import { useEffect, useState } from "react";
import API from "../../api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import styles from "./DoctorsPage.module.scss";

import DoctorCard from "../../components/Doctors/DoctorCard";
import DoctorsSidebar from "../../components/Doctors/DoctorsSidebar";

import DoctorCardSkeleton from "../../components/Skeletons/DoctorCardSkeleton";
import SidebarSkeleton from "../../components/Skeletons/SidebarSkeleton";

export default function DoctorsPage() {
    const navigate = useNavigate();

    const [specializations, setSpecializations] = useState([]);
    const [doctors, setDoctors] = useState([]);

    const [loadingDoctors, setLoadingDoctors] = useState(false);
    const [loadingSpecs, setLoadingSpecs] = useState(false);

    const [selectedSpec, setSelectedSpec] = useState(null);

    useEffect(() => {
        loadSpecializations();
        loadDoctors();
    }, []);

    const loadSpecializations = async () => {
        setLoadingSpecs(true);

        try {
            const res = await API.get("/public/view/specializations");
            setSpecializations(res.data);
        } catch {
            toast.error("Помилка завантаження спеціалізацій");
        } finally {
            setLoadingSpecs(false);
        }
    };

    const loadDoctors = async (specId = null) => {
        setLoadingDoctors(true);

        try {
            const url = specId
                ? `/public/view/doctors/specialization/${specId}`
                : "/public/view/doctors/list";

            const res = await API.get(url);
            setDoctors(res.data);
        } catch {
            toast.error("Помилка завантаження лікарів");
        } finally {
            setLoadingDoctors(false);
        }
    };

    const handleSelectSpec = (id) => {
        setSelectedSpec(id);
        loadDoctors(id);
    };

    const handleBook = (doc) => {
        navigate("/reception", {
            state: {
                doctorId: doc.id,
                specializationId: doc.specialization_id,
            },
        });
    };

    return (
        <div className={styles.wrapper}>
            {loadingSpecs ? (
                <aside className={styles.sidebar}>
                    <SidebarSkeleton />
                </aside>
            ) : (
                <DoctorsSidebar
                    specializations={specializations}
                    selectedSpec={selectedSpec}
                    onSelect={handleSelectSpec}
                    onShowAll={() => {
                        setSelectedSpec(null);
                        loadDoctors();
                    }}
                />
            )}

            <main className={styles.content}>
                <h2>Наші лікарі</h2>

                <div className={styles.grid}>
                    {loadingDoctors ? (
                        Array.from({ length: 6 }).map((_, index) => (
                            <DoctorCardSkeleton key={index} />
                        ))
                    ) : (
                        doctors.map((doctor) => (
                            <DoctorCard
                                key={doctor.id}
                                doctor={doctor}
                                onBook={handleBook}
                            />
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}