import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import "../styles/staff-login.scss";

import logo from "../../assets/logo.png";

export default function StaffLogin({ setUser }) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const login = async (e) => {
        e.preventDefault();

        try {
            const cred = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = cred.user;

            const token = await firebaseUser.getIdToken();

            const res = await fetch("http://localhost:8000/api/staff/sync", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error);
            }

            localStorage.setItem("staff_user", JSON.stringify(data));
            localStorage.setItem("token", token);

            setUser(data);

            navigate("/staff");

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="staff-login">


            <div className="staff-login__brand">
                <img src={logo} alt="MedPlus" />
            </div>

            <form onSubmit={login} className="staff-login-card">

                <h2>Вхід для персоналу</h2>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {error && <p className="error">{error}</p>}

                <button type="submit">
                    Увійти
                </button>

            </form>

        </div>
    );
}