import { useState } from "react";
import API from "../../api";
import { useNavigate } from "react-router-dom";
import "./Auth.scss";

export default function Auth({ setUser }) {
    const [activeTab, setActiveTab] = useState("login"); // login / register
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            let res;

            if (activeTab === "login") {
                // логін
                res = await API.post("auth/login", { email, password });
            } else {
                // реєстрація
                res = await API.post("auth/register", {
                    email,
                    password,
                    password_confirmation: passwordConfirm,
                });
            }

            // зберігаємо токен та user
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));

            // оновлюємо глобальний user state
            setUser(res.data.user);

            // редірект на головну
            navigate("/");
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || "Помилка сервера");
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
                    >
                        Авторизація
                    </button>
                    <button
                        className={activeTab === "register" ? "active" : ""}
                        onClick={() => setActiveTab("register")}
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