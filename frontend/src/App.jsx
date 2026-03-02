import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Header from "./components/Header/Header";
import "./styles/global.scss";
import Auth from "./pages/Auth/Auth";
import { useState, useEffect } from "react";
import API from "../src/api";

function App() {
    const [user, setUser] = useState(() => {
        // Початково user можна спробувати взяти з localStorage (якщо ти зберігав його)
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const res = await API.get("/auth/me");
                    setUser(res.data.user);
                    localStorage.setItem("user", JSON.stringify(res.data.user)); // зберігаємо user
                } catch (err) {
                    console.log("Не вдалось отримати користувача");
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    setUser(null);
                }
            }
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        try {
            await API.post("/auth/logout");
        } catch (err) {
            console.log(err);
        }
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <Router>
            <Header user={user} onLogout={handleLogout} />
            <Routes>
                <Route path="/" element={<Home user={user} />} />
                <Route path="/auth" element={<Auth setUser={setUser} />} />
            </Routes>
        </Router>
    );
}

export default App;