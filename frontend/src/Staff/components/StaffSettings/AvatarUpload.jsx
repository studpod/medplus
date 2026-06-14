import { useState } from "react";
import API from "../../../api";
import { toast } from "react-toastify";

export default function AvatarUpload({ doctor, refresh }) {

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const upload = async () => {
        if (!file) return;

        const data = new FormData();
        data.append("avatar", file);

        try {
            setLoading(true);

            await API.post("/doctor/control/me/avatar", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            toast.success("Аватар оновлено!");
            refresh();

        } catch {
            toast.error("Помилка");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card settings-card">

            <h2>Аватар</h2>

            <div style={{ marginBottom: 10 }}>
                {doctor.avatar && (
                    <img
                        src={`/storage/${doctor.avatar}`}
                        alt="avatar"
                        style={{ width: 100, borderRadius: "50%" }}
                    />
                )}
            </div>

            <input type="file" onChange={(e) => setFile(e.target.files[0])} />

            <button onClick={upload} disabled={loading}>
                {loading ? "..." : "Завантажити"}
            </button>

        </div>
    );
}