import React from "react";
import "./Hero.css";

export default function Hero() {
    return (
        <section className="hero">
            <div className="hero-left">
                <h1>Приватна клініка сучасної медицини</h1>
                <p>Піклуємося про ваше здоров’я 24/7</p>
                <div className="hero-buttons">
                    <button className="btn-primary">Запитатися на прийом</button>
                    <button className="btn-secondary">Переглянути послуги</button>
                </div>
            </div>
            <div className="hero-right">
                <img src="https://via.placeholder.com/400x400.png?text=Лікар" alt="Лікар" />
            </div>
        </section>
    );
}