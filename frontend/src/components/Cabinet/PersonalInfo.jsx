import { useState, useEffect } from "react";

export default function PersonalInfo({ patientData, isEditing, setIsEditing }) {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        setFormData(patientData || {});
    }, [patientData]);

    const hasData = patientData && Object.keys(patientData).length > 0;

    const safe = (value) => (value && value !== "" ? value : "Не вказано");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        // тут твій API
        setIsEditing(false);
    };

    return (
        <div className="profile-card">
            {isEditing ? (
                <div className="profile-form">
                    <input
                        type="text"
                        name="last_name"
                        value={formData.last_name || ""}
                        onChange={handleChange}
                        placeholder="Прізвище"
                    />
                    <input
                        type="text"
                        name="first_name"
                        value={formData.first_name || ""}
                        onChange={handleChange}
                        placeholder="Ім'я"
                    />
                    <input
                        type="text"
                        name="middle_name"
                        value={formData.middle_name || ""}
                        onChange={handleChange}
                        placeholder="По батькові"
                    />
                    <select
                        name="gender"
                        value={formData.gender || ""}
                        onChange={handleChange}
                    >
                        <option value="">Оберіть стать</option>
                        <option value="male">Чоловік</option>
                        <option value="female">Жінка</option>
                    </select>
                    <input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth || ""}
                        onChange={handleChange}
                    />
                    <input
                        type="text"
                        name="phone"
                        value={formData.phone || ""}
                        onChange={handleChange}
                        placeholder="Телефон"
                    />
                    <div className="form-buttons">
                        <button className="save-btn" onClick={handleSave}>
                            Зберегти
                        </button>
                        <button
                            className="cancel-btn"
                            onClick={() => setIsEditing(false)}
                        >
                            Відмінити
                        </button>
                    </div>
                </div>
            ) : (
                <div className="profile-info">
                    <div className="info-row">
                        <span>ПІБ</span>
                        <span>
                            {`${safe(patientData.last_name)} ${safe(patientData.first_name)} ${safe(patientData.middle_name)}`}
                        </span>
                    </div>
                    <div className="info-row">
                        <span>Телефон</span>
                        <span>{safe(patientData.phone)}</span>
                    </div>
                    <div className="info-row">
                        <span>Email</span>
                        <span>{safe(patientData.email)}</span>
                    </div>
                    <div className="info-row">
                        <span>Дата народження</span>
                        <span>{safe(patientData.date_of_birth)}</span>
                    </div>
                    <div className="info-row">
                        <span>Стать</span>
                        <span>
                            {patientData.gender
                                ? patientData.gender === "male"
                                    ? "Чоловік"
                                    : "Жінка"
                                : "Не вказано"}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}