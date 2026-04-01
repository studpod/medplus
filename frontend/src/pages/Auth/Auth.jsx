import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification
} from "firebase/auth";
import "./Auth.scss";
import {toast} from "react-toastify";

export default function Auth({ setUser }) {
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
            let userCredential;
            let firebaseUser;

            if (activeTab === "register") {
                if (password !== passwordConfirm) {
                    setError("Паролі не співпадають");
                    return;
                }


                userCredential = await createUserWithEmailAndPassword(auth, email, password);
                firebaseUser = userCredential.user;

                await sendEmailVerification(firebaseUser);
                toast.info("На вашу пошту надіслано лист для підтвердження!");



                const userData = { uid: firebaseUser.uid, email: firebaseUser.email };
                localStorage.setItem("user", JSON.stringify(userData));
                setUser(userData);


                navigate("/");
                return;
            }

            if (activeTab === "login") {

                userCredential = await signInWithEmailAndPassword(auth, email, password);
                firebaseUser = userCredential.user;
                console.log("Email verified:", firebaseUser.emailVerified);


                if (!firebaseUser.emailVerified) {
                    toast.error("Ви повинні підтвердити свою пошту перед входом. Перевірте вашу пошту.");
                    navigate("/auth");
                    return;
                }


                const idToken = await firebaseUser.getIdToken();


                const syncResponse = await fetch("http://localhost:8000/api/auth/sync", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                    }),
                });

                if (!syncResponse.ok) throw new Error("Sync error");

                const userFromBackend = await syncResponse.json();


                localStorage.setItem("user", JSON.stringify(userFromBackend));
                localStorage.setItem("token", idToken);
                setUser(userFromBackend);

                navigate("/");
            }

        } catch (err) {
            console.error(err);
            setError(err.message || "Помилка сервера");
        }
    };

    return (
        <div className="auth">
            <div className="auth__container">
                {/* Вкладки */}
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

                {/* Форма */}
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