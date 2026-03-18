import { BrowserRouter as Router, Routes, Route, Navigate, useLocation,useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import API from "../src/api";
import '@fortawesome/fontawesome-free/css/all.min.css';

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

import VideoPage from "./pages/VideoPage";
import StaffVideoRoom from "./Staff/pages/StaffVideoRoom"
import StaffWaitingRoom from "./Staff/components/VideoRoom/StaffWaitingRoom";



import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/global.scss";

function AppWrapper() {
    return (
        <Router>
            <App />
        </Router>
    );
}

function App() {
    const location = useLocation();

    // Пацієнти
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Медперсонал
    const [staffUser, setStaffUser] = useState(
        JSON.parse(localStorage.getItem("staff_user"))
    );
    function StaffWaitingRoomWrapper() {
        const { patientId } = useParams();
        return <StaffWaitingRoom patientId={patientId} />;
    }

    const showHeader = !location.pathname.startsWith("/staff") &&
        !location.pathname.startsWith("/video");;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const token = await firebaseUser.getIdToken();
                    const res = await fetch("http://localhost:8000/api/auth/sync", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                        }),
                    });
                    if (res.ok) {
                        const userFromBackend = await res.json();
                        setUser(userFromBackend);
                        localStorage.setItem("user", JSON.stringify(userFromBackend));
                        localStorage.setItem("token", token);
                    } else {
                        setUser(null);
                        localStorage.removeItem("user");
                        localStorage.removeItem("token");
                    }
                } catch (err) {
                    console.error("Помилка синхронізації:", err);
                    setUser(null);
                    localStorage.removeItem("user");
                    localStorage.removeItem("token");
                }
            } else {
                setUser(null);
                localStorage.removeItem("user");
                localStorage.removeItem("token");
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);


    useEffect(() => {
        if (user && auth.currentUser) {
            auth.currentUser.getIdToken().then(token => {
                console.log("Firebase token:", token);
            });
        }
    }, [user]);

    const handleLogout = async () => {
        try {
            await API.post("/auth/logout");
        } catch (err) {
            console.log(err);
        }
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    };

    if (loading) return null;

    return (
        <>
            {showHeader && <Header user={user} onLogout={handleLogout} />}


            {/*{user && (*/}
            {/*    <div style={{ padding: "10px", background: "#f1f1f1" }}>*/}
            {/*        <button*/}
            {/*            onClick={async () => {*/}
            {/*                if (auth.currentUser) {*/}
            {/*                    const token = await auth.currentUser.getIdToken();*/}
            {/*                    console.log("Firebase token:", token);*/}
            {/*                    alert("Токен скопійовано в консоль!");*/}
            {/*                } else {*/}
            {/*                    alert("Користувач не залогінений");*/}
            {/*                }*/}
            {/*            }}*/}
            {/*        >*/}
            {/*            Отримати Firebase токен*/}
            {/*        </button>*/}
            {/*    </div>*/}
            {/*)}*/}

            <Routes>
                {/* Пацієнти */}
                <Route path="/" element={<Home user={user} />} />
                <Route path="/auth" element={<Auth setUser={setUser} />} />
                <Route
                    path="/cabinet"
                    element={user ? <Cabinet user={user} /> : <Navigate to="/auth" />}
                />
                <Route
                    path="/reception"
                    element={user ? <ReceptionPage /> : <Navigate to="/auth" />}
                />
                <Route path="/video" element={user || staffUser ? <VideoPage /> : <Navigate to="/auth" />} />
                <Route
                    path="/video/:room"
                    element={user || staffUser ? <VideoPage /> : <Navigate to="/auth" />}
                />
                {/* STAFF */}
                <Route
                    path="/staff/login"
                    element={<StaffLogin setUser={setStaffUser} />}

                />
                <Route path="/staff/video/waiting/:patientId" element={<StaffWaitingRoomWrapper />} />
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
                    <Route path="patients" element={<PatientsPage />} />
                    <Route path="patient/:patientId/medical-card"
                        element={<PatientMedicalCard />}
                    />
                    <Route path="video" element={<StaffVideoRoom />} />


                </Route>
            </Routes>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                newestOnTop
                closeOnClick
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </>
    );
}

export default AppWrapper;