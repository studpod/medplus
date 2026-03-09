import { useState } from "react";
import PersonalInfo from "./PersonalInfo";


export default function PersonalSection({ patientData }) {
    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const fullName = patientData?.last_name
        ? `${patientData.last_name} ${patientData.first_name || ""} ${patientData.middle_name || ""}`
        : "Не вказано";

    return (
        <div className={`accordion-card ${open ? "open" : ""}`}>
            <div className="accordion-header" onClick={() => setOpen(!open)}>
                <div className="header-left">
                    <h3 className="header-title">Особисті дані пацієнта</h3>
                    <p className="full-name">{fullName}</p>
                </div>

                <div className="header-right">
                    {open && (
                        <button
                            className="edit-btn"
                            onClick={(e) => {
                                e.stopPropagation(); // щоб клік не закривав accordion
                                setIsEditing(!isEditing);
                            }}
                        >
                            {patientData && Object.keys(patientData).length > 0
                                ? "Редагувати"
                                : "Додати"}
                        </button>
                    )}
                    <span className="arrow">{open ? "−" : "+"}</span>
                </div>
            </div>

            {open && (
                <div className="accordion-body">
                    <PersonalInfo
                        patientData={patientData}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                    />
                </div>
            )}
        </div>
    );
}