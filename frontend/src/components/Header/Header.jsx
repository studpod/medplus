import { Link, useNavigate } from "react-router-dom";
import "./Header.scss";

export default function Header({ user, onLogout }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        onLogout?.(); // викликаємо функцію logout з App.js
        navigate("/"); // після logout редірект на сторінку авторизації
    };

    return (
        <header className="header">
            <div className="container header__content">

                {/* Логотип */}
                <div className="header__logo">
                    MedPlus
                </div>

                {/* Навігація */}
                <nav className="header__nav">
                    <Link to="/departments">Відділення</Link>
                    <Link to="/doctors">Лікарі</Link>
                    <Link to="/services">Послуги</Link>
                    <Link to="/prices">Ціни</Link>
                    <Link to="/contact">Контакт</Link>
                </nav>

                {/* Авторизація / Кабінет */}
                <div className="header__auth">
                    {user ? (
                        <>
                            <Link to="/profile" className="header__cabinet-btn">
                                Кабінет
                            </Link>
                            <button onClick={handleLogout} className="header__logout-btn">
                                Вийти
                            </button>
                        </>
                    ) : (
                        <Link to="/auth" className="header__login-btn">
                            Увійти в кабінет
                        </Link>
                    )}
                </div>

            </div>
        </header>
    );
}