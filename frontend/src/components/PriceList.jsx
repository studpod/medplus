import React from "react";
import "./PriceList.css";

export default function PriceList() {
    const services = [
        { name: "Прийом лікаря", price: "40 грн" },
        { name: "Аналіз крові", price: "60 грн" },
        { name: "Рентген", price: "80 грн" },
    ];

    return (
        <section className="price-list">
            <h2>Прайс на послуги</h2>
            <div className="price-cards">
                {services.map((s, i) => (
                    <div className="price-card" key={i}>
                        <h3>{s.name}</h3>
                        <p>{s.price}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}