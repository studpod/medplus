import { useEffect, useState } from "react";
import API from "../../../api";
import { toast } from "react-toastify";

import ReceptionistProfileForm from "../components/Settings/ReceptionistProfileForm";
import SecuritySettings from "../../components/StaffSettings/SecuritySettings/SecuritySettings";
import SettingsSkeleton from "../../components/Skeletons/SettingsSkeleton";

import styles from "../../styles/staffSettings.module.scss";

export default function ReceptionistSettingsPage() {

    const [receptionist, setReceptionist] = useState(null);

    const [loading, setLoading] = useState(false);

    const fetchMe = async () => {

        try {

            const res = await API.get(
                "/receptionist/view/me"
            );

            setReceptionist(
                res.data.receptionist
            );

        } catch {

            toast.error(
                "Помилка завантаження профілю"
            );
        }
    };

    useEffect(() => {
        fetchMe();
    }, []);

    const updateProfile = async (form) => {

        setLoading(true);

        try {

            await API.put(
                "/receptionist/control/me/update",
                form
            );

            toast.success(
                "Профіль оновлено!"
            );

            fetchMe();

        } catch (e) {

            toast.error(
                e.response?.data?.error || "Помилка"
            );

        } finally {

            setLoading(false);
        }
    };

    if (!receptionist) {
        return <SettingsSkeleton />;
    }

    return (
        <div className={styles.page}>

            <ReceptionistProfileForm
                receptionist={receptionist}
                onSave={updateProfile}
                loading={loading}
            />

            <SecuritySettings />

        </div>
    );
}