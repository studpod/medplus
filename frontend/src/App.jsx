import { BrowserRouter as Router, Routes, Route , Navigate} from "react-router-dom";
import Home from "./pages/Home";
import Header from "./components/Header/Header";
import Auth from "./pages/Auth/Auth";
import Cabinet from  "./pages/Cabinet/Cabinet"
import ReceptionPage from "./pages/Appointment/AppointmentPage";
import "./styles/global.scss";
import { useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import API from "../src/api";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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
        <Router>
            <Header user={user} onLogout={handleLogout} />
            <Routes>
                <Route path="/" element={<Home user={user} />} />
                <Route path="/auth" element={<Auth setUser={setUser} />} />
                <Route path="/cabinet" element={user ? <Cabinet user={user} /> : <Navigate to="/auth" />} />
                <Route path="/reception" element={user ? <ReceptionPage /> : <Navigate to="/auth" />} />
            </Routes>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </Router>
    );
}

export default App;