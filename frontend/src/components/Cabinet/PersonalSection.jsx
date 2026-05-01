import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import PersonalInfo from "./PersonalInfo";

export default function PersonalSection({ patientData, forceEdit }) {
    const [editMode, setEditMode] = useState(false);
    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current && forceEdit) {
            setEditMode(true);
            toast.info("Заповніть особисті дані");
            initialized.current = true;
        }
    }, [forceEdit]);

    return (
        <PersonalInfo
            patientData={patientData}
            isEditing={editMode}
            setIsEditing={setEditMode}
        />
    );
}