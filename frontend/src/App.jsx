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
import Header from "./components/Header/Header";
import Auth from "./pages/Auth/Auth";
import Cabinet from "./pages/Cabinet/Cabinet";
import ReceptionPage from "./pages/Appointment/AppointmentPage";

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

import PrivateRoute from "../src/context/PrivateRoute";

import { ToastContainer } from "react-toastify";

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

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    };

    return (
        <div className="app-layout"> {/* 🔥 ІЗОЛЯЦІЯ СТИЛІВ */}
            {showHeader && <Header user={user} onLogout={handleLogout} />}

            <div className="page-container"> {/* 🔥 ІЗОЛЯЦІЯ */}
                <Routes>
                    {/* ПАЦІЄНТ */}
                    <Route path="/" element={<Home user={user} />} />
                    <Route path="/auth" element={<Auth />} />

                    <Route
                        path="/cabinet"
                        element={
                            <PrivateRoute>
                                <Cabinet user={user} />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/reception"
                        element={
                            <PrivateRoute>
                                <ReceptionPage />
                            </PrivateRoute>
                        }
                    />

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
                        <Route path="patients" element={<PatientsPage />} />
                        <Route path="patient/:patientId/medical-card" element={<PatientMedicalCard />} />
                        <Route path="video" element={<StaffVideoRoom />} />
                        <Route path="analyses" element={<LabPage />} />
                        <Route path="analyses/:appointmentServiceId" element={<LabPage />} />
                    </Route>
                </Routes>
            </div>

            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}

export default AppWrapper;