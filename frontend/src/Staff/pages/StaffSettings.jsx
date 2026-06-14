import { useEffect, useState } from "react";
import API from "../../api";
import { toast } from "react-toastify";

import ProfileForm from "../components/StaffSettings/ProfileForm";
import SecuritySettings from "../components/StaffSettings/SecuritySettings/SecuritySettings";
import SettingsSkeleton from "../components/Skeletons/SettingsSkeleton";

import styles from "../styles/staffSettings.module.scss";

export default function StaffSettings() {

    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchMe = async () => {
        try {
            const res = await API.get("/doctor/view/me");
            setDoctor(res.data.doctor);
        } catch {
            toast.error("Помилка завантаження профілю");
        }
    };

    useEffect(() => {
        fetchMe();
    }, []);

    const updateProfile = async (form) => {
        setLoading(true);

        try {
            await API.put("/doctor/control/me/update", form);
            toast.success("Профіль оновлено!");
            fetchMe();
        } catch (e) {
            toast.error(e.response?.data?.error || "Помилка");
        } finally {
            setLoading(false);
        }
    };

    const updateAvatar = async (file) => {
        try {
            const data = new FormData();
            data.append("avatar", file);

            await API.post("/doctor/control/me/avatar", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            toast.success("Аватар оновлено!");
            fetchMe();

        } catch {
            toast.error("Помилка завантаження аватару");
        }
    };

    if (!doctor) return <SettingsSkeleton />;

    return (
        <div className={styles.page}>

            <ProfileForm
                doctor={doctor}
                onSave={updateProfile}
                onAvatarUpload={updateAvatar}
                loading={loading}
            />

            <SecuritySettings />

        </div>
    );
}