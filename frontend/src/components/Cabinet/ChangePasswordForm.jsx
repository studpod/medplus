import { useState } from "react";
import { auth } from "../../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { toast } from "react-toastify";

export default function ChangePasswordForm({ onClose }) {
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async () => {
        try {
            setLoading(true);

            const user = auth.currentUser;
            if (!user || !user.email) {
                throw new Error("Немає email");
            }

            await sendPasswordResetEmail(auth, user.email);

            toast.success("Лист для зміни пароля надіслано");

        } catch (err) {
            console.error(err);
            toast.error("Помилка при відправці листа");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h3>Зміна пароля</h3>

            <p style={{ fontSize: "14px", marginBottom: "12px" }}>
                Ми надішлемо лист на вашу пошту для зміни пароля.
            </p>

            <button onClick={handleResetPassword} disabled={loading}>
                {loading ? "Зачекайте..." : "Надіслати лист"}
            </button>

            <button onClick={onClose} style={{ marginLeft: "10px" }}>
                Закрити
            </button>
        </div>
    );
}