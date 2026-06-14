import { useEffect, useState } from "react";
import styles from "../styles/doctors.module.scss";
import { toast } from "react-toastify";

import {
    getReceptionists,
    createReceptionist,
    updateReceptionist,
    deleteReceptionist
} from "../../../api/admin/receptionists";
import ReceptionistsTable from "../components/receptionist/ReceptionistsTable";

import ReceptionistModal from "../components/receptionist/ReceptionistModal";

export default function ReceptionistsPage() {

    const [receptionists, setReceptionists] = useState([]);

    const [search, setSearch] = useState("");

    const [selectedReceptionist, setSelectedReceptionist] =
        useState(null);

    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        loadReceptionists();
    }, [search]);

    const loadReceptionists = async () => {

        try {

            const res = await getReceptionists({
                search
            });

            setReceptionists(
                res.data.receptionists
            );

        } catch {

            toast.error(
                "Не вдалося завантажити працівників"
            );
        }
    };

    const handleSave = async (data) => {

        try {

            if (selectedReceptionist) {

                await updateReceptionist(
                    selectedReceptionist.id,
                    data
                );

                toast.success(
                    "Працівника оновлено"
                );

            } else {

                await createReceptionist(data);

                toast.success(
                    "Працівника створено"
                );
            }

            setModalOpen(false);

            setSelectedReceptionist(null);

            loadReceptionists();

        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                "Помилка"
            );
        }
    };

    const handleDelete = async (id) => {

        try {

            await deleteReceptionist(id);

            toast.success(
                "Працівника видалено"
            );

            loadReceptionists();

        } catch {

            toast.error(
                "Помилка видалення"
            );
        }
    };

    return (
        <div className={styles.page}>

            <div className={styles.header}>

                <h1>Реєстратура</h1>

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

                            setSelectedReceptionist(null);

                            setModalOpen(true);
                        }}
                    >
                        + Додати працівника
                    </button>

                </div>

            </div>

            <ReceptionistsTable
                receptionists={receptionists}
                onEdit={(item) => {

                    setSelectedReceptionist(item);

                    setModalOpen(true);
                }}
                onDelete={handleDelete}
            />

            {modalOpen && (
                <ReceptionistModal
                    receptionist={selectedReceptionist}
                    onClose={() => {

                        setModalOpen(false);

                        setSelectedReceptionist(null);
                    }}
                    onSave={handleSave}
                />
            )}

        </div>
    );
}