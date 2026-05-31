import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useLocation,
    useParams
} from "react-router-dom";

import { useState } from "react";
import { useAuth } from "./context/AuthContext";

import '@fortawesome/fontawesome-free/css/all.min.css';
import "./styles/global.scss";


import Home from "./pages/Home";
import DoctorPage from "./pages/Departments/DoctorsPage"
import Header from "./components/Header/Header";
import Auth from "./pages/Auth/Auth";
import Cabinet from "./pages/Cabinet/Cabinet";
import ReceptionPage from "./pages/Appointment/AppointmentPage";
import Departments from "./pages/Departments/DepartmentsPage";
import DepartmentDetails from "./components/Departments/DepartmentDetails";
import CompleteProfile from "./pages/Auth/CompleteProfile/CompleteProfile";
import ServicePage from "./pages/Services/ServicesPage"


import StaffLogin from "./Staff/pages/StaffLogin";
import StaffDashboard from "./Staff/pages/StaffDashboard";
import StaffLayout from "./Staff/components/StaffLayout";
import PatientMedicalCard from "./Staff/components/PatientMedCard/PatientMedicalCard";
import PatientsPage from "./Staff/pages/PatientsPage";
import AppointmentsPage from "./Staff/pages/AppointmentsPage";
import AppointmentDetailsPage from "./Staff/pages/AppointmentDetailsPage";
import LabPage from "./Staff/pages/LabPage"

import VideoPage from "./pages/VideoPage";
import StaffVideoRoom from "./Staff/pages/StaffVideoRoom";
import StaffWaitingRoom from "./Staff/components/VideoRoom/StaffWaitingRoom";
import StaffSettings from "./Staff/pages/StaffSettings"
import CreateAppointmentPage from "./Staff/Receptionist/pages/CreateAppointmentPage";
import ReceptionistAppointmentsPage from "./Staff/Receptionist/pages/AppointmentsPage";
import EditAppointmentPage from "./Staff/Receptionist/pages/EditAppointmentPage";
import ReceptionistPatientsPage from "./Staff/Receptionist/pages/ReceptionistPatientsPage";
import ReceptionistSettingsPage from "./Staff/Receptionist/pages/ReceptionistSettingsPage";

import AdminDashboard from "./Staff/Admin/pages/AdminDashboard";
import DoctorsPage from "./Staff/Admin/pages/DoctorsPage";

import PrivateRoute from "../src/context/PrivateRoute";
import RequireProfile from "../src/RequireProfile/RequireProfile"

import { ToastContainer } from "react-toastify";
import { signOut } from "firebase/auth";
import { auth } from "./firebase"

function AppWrapper() {
    return (
        <Router>
            <App />
        </Router>
    );
}

function App() {
    const location = useLocation();
    const { user, setUser } = useAuth();

    const [staffUser, setStaffUser] = useState(
        JSON.parse(localStorage.getItem("staff_user"))
    );


    function StaffWaitingRoomWrapper() {
        const { patientId } = useParams();
        return <StaffWaitingRoom patientId={patientId} />;
    }

    const showHeader =
        !location.pathname.startsWith("/staff") &&
        !location.pathname.startsWith("/patient/video");

    const handleLogout = async () => {
        await signOut(auth);
    };

    return (
        <div className="app-layout">
            {showHeader && <Header user={user} onLogout={handleLogout} />}

            <div className="page-container">
                <Routes>
                    {/* ПАЦІЄНТ */}
                    <Route path="/" element={<Home user={user} />} />
                    <Route path="/departments" element={<Departments />} />
                    <Route path="/doctors" element={<DoctorPage />} />
                    <Route path="/services" element={<ServicePage />} />
                    <Route path="/departments/:slug" element={<DepartmentDetails />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route
                        path="/complete-profile"
                        element={
                            <PrivateRoute>
                                <CompleteProfile user={user} />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/cabinet"
                        element={
                            <PrivateRoute>
                                <RequireProfile user={user}>
                                <Cabinet user={user} />
                                    </RequireProfile>
                            </PrivateRoute>
                        }
                    />

                    <Route path="/reception" element={<ReceptionPage user={user} />} />

                    <Route
                        path="/video"
                        element={user || staffUser ? <VideoPage /> : <Navigate to="/auth" />}
                    />

                    <Route
                        path="/patient/video/:room"
                        element={user || staffUser ? <VideoPage /> : <Navigate to="/auth" />}
                    />

                    {/* STAFF */}
                    <Route
                        path="/staff/login"
                        element={<StaffLogin setUser={setStaffUser} />}
                    />

                    <Route
                        path="/staff/video/waiting/:patientId"
                        element={<StaffWaitingRoomWrapper />}
                    />


                    <Route
                        path="/staff"
                        element={
                            staffUser
                                ? <StaffLayout user={staffUser} setUser={setStaffUser} />
                                : <Navigate to="/staff/login" />
                        }
                    >
                        <Route index element={<StaffDashboard />} />
                        <Route path="appointments" element={<AppointmentsPage />} />
                        <Route path="appointments/:id" element={<AppointmentDetailsPage />} />
                        <Route path="appointments/create" element={<CreateAppointmentPage />} />
                        <Route path="receptionist/appointments/:id/edit" element={<EditAppointmentPage />}/>
                        <Route path="receptionist/appointments" element={<ReceptionistAppointmentsPage />}/>
                        <Route path="patients" element={<PatientsPage />} />
                        <Route path="patient/:patientId/medical-card" element={<PatientMedicalCard />} />
                        <Route path="video" element={<StaffVideoRoom />} />
                        <Route path="analyses" element={<LabPage />} />
                        <Route path="analyses/:appointmentServiceId" element={<LabPage />} />
                        <Route path="/staff/settings" element={<StaffSettings />} />
                        <Route path="/staff/receptionist/settings" element={<ReceptionistSettingsPage />}/>
                        <Route path="/staff/receptionist/patients" element={<ReceptionistPatientsPage />}/>
                        <Route path="doctors" element={<DoctorsPage />} />
                        <Route
                            path="admin"
                            element={
                                staffUser?.role === "admin"
                                    ? <AdminDashboard />
                                    : <Navigate to="/staff" />
                            }
                        />
                    </Route>

                </Routes>
            </div>

            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}

export default AppWrapper;