import { useEffect, useState } from "react";
import API from "../../api";
import { toast } from "react-toastify";

import styles from "./ServicesPage.module.scss";

import ServicesSidebar from "../../components/Services/ServicesSidebar";
import ServicesSidebarSkeleton from "../../components/Skeletons/ServicesSidebarSkeleton";
import ServicesTableSkeleton from "../../components/Skeletons/ServicesTableSkeleton";

export default function ServicesPage() {
    const [services, setServices] = useState([]);
    const [specializations, setSpecializations] = useState([]);
    const [selectedSpec, setSelectedSpec] = useState(null);

    const [loadingServices, setLoadingServices] = useState(false);
    const [loadingSidebar, setLoadingSidebar] = useState(false);

    useEffect(() => {
        loadSpecializations();
        loadServices();
    }, []);

    const loadSpecializations = async () => {
        setLoadingSidebar(true);
        try {
            const res = await API.get("/public/view/specializations");
            setSpecializations(res.data);
        } catch {
            toast.error("Помилка завантаження спеціалізацій");
        } finally {
            setLoadingSidebar(false);
        }
    };

    const loadServices = async (specId = null) => {
        setLoadingServices(true);
        try {
            const url = specId
                ? `/public/view/services/${specId}`
                : "/public/view/services";

            const res = await API.get(url);

            setServices(res.data.services || res.data);
        } catch {
            toast.error("Помилка завантаження послуг");
        } finally {
            setLoadingServices(false);
        }
    };

    const handleSelectSpec = (id) => {
        setSelectedSpec(id);
        loadServices(id);
    };

    const translateType = (type) => {
        const types = {
            consultation: "Консультація",
            lab_test: "Лабораторне дослідження",
            procedure: "Процедура",
            checkup: "Огляд",
            diagnostics: "Діагностика",
        };
        return types[type] || type;
    };

    return (
        <div className={styles.wrapper}>

            {/* SIDEBAR */}

                {/*<h3 className={styles.sidebarTitle}>Спеціалізації</h3>*/}

                {loadingSidebar ? (
                    <ServicesSidebarSkeleton />
                ) : (
                    <ServicesSidebar
                        specializations={specializations}
                        selectedSpec={selectedSpec}
                        onSelect={handleSelectSpec}
                        onShowAll={() => {
                            setSelectedSpec(null);
                            loadServices();
                        }}
                    />
                )}


            {/* CONTENT */}
            <main className={styles.content}>
                <h2>Послуги та ціни</h2>

                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>Послуга</th>
                            <th>Тип</th>
                            <th>Опис</th>
                            <th>Ціна</th>
                        </tr>
                        </thead>

                        {loadingServices ? (
                            <ServicesTableSkeleton />
                        ) : (
                            <tbody>
                            {services.map((service) => (
                                <tr key={service.id}>
                                    <td className={styles.serviceName}>
                                        {service.name}
                                    </td>
                                    <td>{translateType(service.type)}</td>
                                    <td>{service.description}</td>
                                    <td className={styles.price}>
                                        {Number(service.price).toFixed(0)} грн
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        )}
                    </table>
                </div>
            </main>
        </div>
    );
}