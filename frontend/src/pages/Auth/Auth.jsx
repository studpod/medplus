import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification
} from "firebase/auth";

import { auth } from "../../firebase";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

import {
    FaEnvelope,
    FaLock,
    FaPhone,
    FaUserCheck
} from "react-icons/fa";

import styles from "./Auth.module.scss";
import API from "../../api";

export default function Auth() {
    const [activeTab, setActiveTab] = useState("login");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    const [phone, setPhone] = useState("");
    const [linkExisting, setLinkExisting] = useState(false);

    const [error, setError] = useState("");

    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;
        navigate("/");
    }, [user]);

    const handleSync = async (firebaseUser) => {
        const token = await firebaseUser.getIdToken();

        await API.post(
            "/auth/sync",
            {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                phone: phone || null
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            // =========================
            // REGISTER
            // =========================
            if (activeTab === "register") {

                if (password !== passwordConfirm) {
                    setError("Паролі не співпадають");
                    return;
                }

                const cred = await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

                await sendEmailVerification(cred.user);

                await handleSync(cred.user);

                toast.success("Реєстрація успішна. Перевірте email");


                navigate("/complete-profile");

                return;
            }

            // =========================
            // LOGIN
            // =========================
            if (activeTab === "login") {

                const cred = await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

                if (!cred.user.emailVerified) {
                    toast.error("Підтвердіть email");
                    return;
                }


                await handleSync(cred.user);

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
                        type="button"
                        className={activeTab === "login" ? styles.active : ""}
                        onClick={() => setActiveTab("login")}
                    >
                        Авторизація
                    </button>

                    <button
                        type="button"
                        className={activeTab === "register" ? styles.active : ""}
                        onClick={() => setActiveTab("register")}
                    >
                        Реєстрація
                    </button>
                </div>

                {/* FORM */}
                <form className={styles.form} onSubmit={handleSubmit}>

                    {/* EMAIL */}
                    <div className={styles.inputWrap}>
                        <FaEnvelope />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {/* PASSWORD */}
                    <div className={styles.inputWrap}>
                        <FaLock />
                        <input
                            type="password"
                            placeholder="Пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* CONFIRM */}
                    {activeTab === "register" && (
                        <div className={styles.inputWrap}>
                            <FaLock />
                            <input
                                type="password"
                                placeholder="Підтвердження паролю"
                                value={passwordConfirm}
                                onChange={(e) => setPasswordConfirm(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    {/* CHECK */}
                    {activeTab === "register" && (
                        <label className={styles.checkbox}>
                            <input
                                type="checkbox"
                                checked={linkExisting}
                                onChange={() => setLinkExisting(!linkExisting)}
                            />
                            <FaUserCheck />
                            <span>Я вже записувався на прийом</span>
                        </label>
                    )}

                    {/* PHONE */}
                    {activeTab === "register" && linkExisting && (
                        <div className={styles.inputWrap}>
                            <FaPhone />
                            <input
                                type="tel"
                                placeholder="Телефон (як при записі)"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                    )}

                    {error && <p className={styles.error}>{error}</p>}

                    <button type="submit" className={styles.button}>
                        {activeTab === "login"
                            ? "Увійти"
                            : "Зареєструватись"}
                    </button>

                </form>

            </div>
        </div>
    );
}