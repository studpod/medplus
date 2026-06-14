import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import styles from "../styles/services.module.scss";

import {
    getServices,
    createService,
    updateService,
    deleteService
} from "../../../api/admin/services";

import { getSpecializations } from "../../../api/admin/specializations";

import ServicesTable from "../components/service/ServicesTable";
import ServiceModal from "../components/service/ServiceModal";

export default function ServicesPage() {

    const [services, setServices] = useState([]);
    const [specializations, setSpecializations] = useState([]);

    const [search, setSearch] = useState("");

    const [selected, setSelected] = useState(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        load();
    }, [search]);

    useEffect(() => {
        loadSpecializations();
    }, []);

    const load = async () => {
        try {
            const res = await getServices({ search });
            setServices(res.data.services);
        } catch {
            toast.error("Помилка завантаження послуг");
        }
    };

    const loadSpecializations = async () => {
        try {
            const res = await getSpecializations();
            setSpecializations(res.data.specializations || []);
        } catch {
            toast.error("Помилка завантаження спеціалізацій");
        }
    };

    const handleSave = async (data) => {
        try {


            const payload = {
                ...data,
                specialization_id: data.specialization_id || null
            };

            if (!payload.specialization_id) {
                toast.error("Оберіть спеціалізацію");
                return;
            }

            if (selected) {
                await updateService(selected.id, payload);
                toast.success("Оновлено");
            } else {
                await createService(payload);
                toast.success("Створено");
            }

            setOpen(false);
            setSelected(null);
            load();

        } catch (err) {
            console.log(err);
            toast.error("Помилка збереження");
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteService(id);
            toast.success("Видалено");
            load();
        } catch {
            toast.error("Помилка видалення");
        }
    };

    return (
        <div className={styles.page}>

            <div className={styles.header}>
                <h1>Послуги</h1>

                <button
                    className={styles.addBtn}
                    onClick={() => {
                        setSelected(null);
                        setOpen(true);
                    }}
                >
                    + Додати
                </button>
            </div>

            <div className={styles.searchBox}>
                <input
                    placeholder="Пошук..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <ServicesTable
                services={services}
                onEdit={(s) => {
                    setSelected(s);
                    setOpen(true);
                }}
                onDelete={handleDelete}
            />

            {open && (
                <ServiceModal
                    service={selected}
                    specializations={specializations}
                    onClose={() => {
                        setOpen(false);
                        setSelected(null);
                    }}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}