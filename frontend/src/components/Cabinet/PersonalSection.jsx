import { useState } from "react";
import PersonalInfo from "./PersonalInfo";


export default function PersonalSection({ patientData }) {
    return (


            <PersonalInfo
                patientData={patientData}
                isEditing={false}
                setIsEditing={() => {}}
            />

    );
}