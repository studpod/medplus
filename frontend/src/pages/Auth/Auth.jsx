import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification
} from "firebase/auth";
import "./Auth.scss";
import { toast } from "react-toastify";

export default function Auth() {
    const [activeTab, setActiveTab] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            if (activeTab === "register") {
                if (password !== passwordConfirm) {
                    setError("Паролі не співпадають");
                    return;
                }

                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const firebaseUser = userCredential.user;

                await sendEmailVerification(firebaseUser);
                toast.info("На пошту надіслано лист підтвердження");

                navigate("/");
                return;
            }

            if (activeTab === "login") {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const firebaseUser = userCredential.user;

                if (!firebaseUser.emailVerified) {
                    toast.error("Підтверди пошту перед входом");
                    return;
                }


                navigate("/");
            }

        } catch (err) {
            console.error(err);
            setError(err.message || "Помилка");
        }
    };

    return (
        <div className="auth">
            <div className="auth__container">
                <div className="auth__tabs">
                    <button
                        className={activeTab === "login" ? "active" : ""}
                        onClick={() => setActiveTab("login")}
                        type="button"
                    >
                        Авторизація
                    </button>
                    <button
                        className={activeTab === "register" ? "active" : ""}
                        onClick={() => setActiveTab("register")}
                        type="button"
                    >
                        Реєстрація
                    </button>
                </div>

                <form className="auth__form" onSubmit={handleSubmit}>
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

                    {error && <p className="auth__error">{error}</p>}

                    <button type="submit" className="auth__btn">
                        {activeTab === "login" ? "Увійти" : "Зареєструватись"}
                    </button>
                </form>
            </div>
        </div>
    );
}