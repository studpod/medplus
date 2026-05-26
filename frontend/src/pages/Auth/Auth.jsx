import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification
} from "firebase/auth";

import styles from "./Auth.module.scss";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

export default function Auth() {
    const [activeTab, setActiveTab] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        if (activeTab === "register") {
            navigate("/cabinet?edit=true");
        } else {
            navigate("/");
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            if (activeTab === "register") {
                if (password !== passwordConfirm) {
                    setError("Паролі не співпадають");
                    return;
                }

                const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

                const firebaseUser = userCredential.user;

                await sendEmailVerification(firebaseUser);

                toast.info("На пошту надіслано лист підтвердження");
                return;
            }

            if (activeTab === "login") {
                const userCredential = await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

                const firebaseUser = userCredential.user;

                if (!firebaseUser.emailVerified) {
                    toast.error("Підтверди пошту перед входом");
                    return;
                }

                return;
            }

        } catch (err) {
            console.error(err);
            setError(err.message || "Помилка");
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>

                {/* TABS */}
                <div className={styles.tabs}>
                    <button
                        className={activeTab === "login" ? styles.active : ""}
                        onClick={() => setActiveTab("login")}
                        type="button"
                    >
                        Авторизація
                    </button>

                    <button
                        className={activeTab === "register" ? styles.active : ""}
                        onClick={() => setActiveTab("register")}
                        type="button"
                    >
                        Реєстрація
                    </button>
                </div>

                {/* FORM */}
                <form className={styles.form} onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {activeTab === "register" && (
                        <input
                            type="password"
                            placeholder="Підтвердження паролю"
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            required
                        />
                    )}

                    {error && <p className={styles.error}>{error}</p>}

                    <button type="submit" className={styles.button}>
                        {activeTab === "login" ? "Увійти" : "Зареєструватись"}
                    </button>
                </form>

            </div>
        </div>
    );
}