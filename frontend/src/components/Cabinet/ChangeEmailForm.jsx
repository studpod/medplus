import { useState } from "react";
import { auth } from "../../firebase";
import { verifyBeforeUpdateEmail } from "firebase/auth";
import { toast } from "react-toastify";

export default function ChangeEmailForm({ onClose }) {
    const [newEmail, setNewEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChangeEmail = async () => {
        try {
            setLoading(true);

            const user = auth.currentUser;
            if (!user) throw new Error("Користувач не авторизований");

            await verifyBeforeUpdateEmail(user, newEmail);

            toast.success("Лист для підтвердження надіслано");
            setNewEmail("");

        } catch (err) {
            console.error(err);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h3>Змінити Email</h3>

            <input
                type="email"
                placeholder="Новий email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
            />

            <button onClick={handleChangeEmail} disabled={loading}>
                {loading ? "..." : "Змінити"}
            </button>

            <button onClick={onClose}>Закрити</button>
        </div>
    );
}