import { useState, useEffect } from "react";
import API from "../../api";
import "./Cabinet.scss";

import PersonalSection from "../../components/Cabinet/PersonalSection";
import MedicalRecordsSection from "../../components/Cabinet/MedicalRecordsSection";

export default function Cabinet() {
    const [patientData, setPatientData] = useState({}); // <-- було null
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profileRes = await API.get("/patient/view/profile");
                setPatientData(profileRes.data.patient || {});
            } catch (err) {
                console.error("Помилка профілю", err);
                setPatientData({});
            }
        };

        const fetchMedical = async () => {
            try {
                const medicalRes = await API.get("/patient/view/medical-records");
                setMedicalRecords(medicalRes.data.medical_records || []);
            } catch (err) {
                console.error("Помилка медичних записів", err);
                setMedicalRecords([]);
            }
        };

        Promise.all([fetchProfile(), fetchMedical()]).finally(() => setLoading(false));
    }, []);

    if (loading) return null;

    return (
        <div className="cabinet-page">
            <div className="cabinet-content">
                <PersonalSection patientData={patientData} />
                <MedicalRecordsSection records={medicalRecords} />
            </div>
        </div>
    );
}