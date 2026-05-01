import { useState, useEffect } from "react";
import API from "../../api";
import "./Cabinet.scss";
import CabinetSkeleton from "../../components/Skeletons/CabinetSkeleton";
import PersonalSection from "../../components/Cabinet/PersonalSection";
import MedicalRecordsSection from "../../components/Cabinet/MedicalRecordsSection";
import CabinetTabs from "../../components/Cabinet/CabinetTabs";
import AppointmentsSection from "../../components/Cabinet/AppointmentsSection";
import LabsSection from "../../components/Cabinet/LabsSection";
import {toast} from "react-toastify";
import { useSearchParams } from "react-router-dom";

export default function Cabinet() {
    const [patientData, setPatientData] = useState({});
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [activeTab, setActiveTab] = useState("personal");
    const [loading, setLoading] = useState(true);
    const [labs, setLabs] = useState([]);
    const [searchParams] = useSearchParams();
    const forceEdit = searchParams.get("edit") === "true";

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [profile, medical, receptions, labsRes] = await Promise.all([
                    API.get("/patient/view/profile"),
                    API.get("/patient/view/medical-records"),
                    API.get("/patient/view/receptions"),
                    API.get("/patient/view/labs"),
                ]);

                setPatientData(profile.data.patient || {});
                setMedicalRecords(medical.data.medical_records || []);
                setAppointments(receptions.data.receptions || []);
                console.log('Прийоми', receptions.data.receptions);
                setLabs(labsRes.data.labs || []);
                console.log(profile.data.patient);

            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, []);

    const joinOnlineCall = (roomId) => {
        if (!roomId) {
            toast.error("Лікар ще не розпочав Онлайн консультацію. ");
            return;
        }
        window.open(`/patient/video/${roomId}`, "_blank");
    };

    if (loading) return <CabinetSkeleton />;

    return (
        <div className="cabinet-page">

            <CabinetTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

            <div className="cabinet-content">

                {activeTab === "personal" && (
                    <PersonalSection
                        patientData={patientData}
                        forceEdit={forceEdit}
                    />
                )}

                {activeTab === "medical" && (
                    <MedicalRecordsSection records={medicalRecords} />
                )}

                {activeTab === "appointments" && (
                    <AppointmentsSection
                        appointments={appointments}
                        joinOnlineCall={joinOnlineCall}
                    />
                )}
                {activeTab === "labs" && (
                    <LabsSection labs={labs} />
                )}
            </div>
        </div>
    );
}