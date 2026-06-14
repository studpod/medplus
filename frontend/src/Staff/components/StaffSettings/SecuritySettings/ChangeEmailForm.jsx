import { useState } from "react";
import { auth } from "../../../../firebase";
import { verifyBeforeUpdateEmail } from "firebase/auth";
import { toast } from "react-toastify";
import styles from "../../../styles/staffSettings.module.scss";

export default function ChangeEmailForm({ onClose }) {
    const [newEmail, setNewEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChangeEmail = async () => {
        if (!newEmail) {
            toast.error("Введіть email");
            return;
        }

        try {
            setLoading(true);

            const user = auth.currentUser;

            if (!user) {
                toast.error("Користувач не авторизований");
                return;
            }

            await verifyBeforeUpdateEmail(user, newEmail);

            toast.success("Лист для підтвердження надіслано");
            setNewEmail("");

        } catch (err) {
            toast.error(err.message || "Помилка зміни email");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modal}>

            <h3 className={styles.modalTitle}>Зміна Email</h3>

            <input
                className={styles.input}
                type="email"
                placeholder="Новий email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
            />

            <div className={styles.actions}>
                <button
                    className={styles.btn}
                    onClick={handleChangeEmail}
                    disabled={loading}
                >
                    {loading ? "..." : "Надіслати підтвердження"}
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