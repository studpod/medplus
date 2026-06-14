import { useState } from "react";
import { auth } from "../../../../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { toast } from "react-toastify";
import styles from "../../../styles/staffSettings.module.scss";

export default function ChangePasswordForm({ onClose }) {
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async () => {
        try {
            setLoading(true);

            const user = auth.currentUser;

            if (!user?.email) {
                toast.error("Email не знайдено");
                return;
            }

            await sendPasswordResetEmail(auth, user.email);

            toast.success("Лист для зміни пароля відправлено");

        } catch (err) {
            toast.error("Помилка при відправці листа");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modal}>

            <h3 className={styles.modalTitle}>Зміна пароля</h3>

            <p className={styles.hint}>
                Ми надішлемо лист на вашу пошту для зміни пароля.
            </p>

            <div className={styles.actions}>
                <button
                    className={styles.btn}
                    onClick={handleResetPassword}
                    disabled={loading}
                >
                    {loading ? "..." : "Надіслати лист"}
                </button>

                <button
                    className={styles.secondary}
                    onClick={onClose}
                >
                    Скасувати
                </button>
            </div>

        </div>
    );
}