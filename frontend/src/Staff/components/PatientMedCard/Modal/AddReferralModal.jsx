import { useState } from "react";
import API from "../../../../api";

export default function AddReferralModal({ isOpen, onClose, patientId, specializations, onSuccess }) {
    const [form, setForm] = useState({
        to_specialization_id: "",
        reason: ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await API.post("/doctor/control/referrals", {
                patient_id: patientId,
                ...form
            });

            onSuccess(res.data.referral);
            onClose();
        } catch (e) {
            console.error(e);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modalOverlay">
            <div className="modal">
                <h3>Створити направлення</h3>

                <form onSubmit={handleSubmit}>
                    <select
                        required
                        value={form.to_specialization_id}
                        onChange={(e) =>
                            setForm({ ...form, to_specialization_id: e.target.value })
                        }
                    >
                        <option value="">Оберіть спеціаліста</option>
                        {specializations.map(s => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>

                    <textarea
                        placeholder="Причина"
                        value={form.reason}
                        onChange={(e) =>
                            setForm({ ...form, reason: e.target.value })
                        }
                    />

                    <div className="modal-actions">
                        <button type="button" className="modal-btn cancel" onClick={onClose}>
                            Скасувати
                        </button>

                        <button type="submit" className="modal-btn primary">
                            Створити
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}