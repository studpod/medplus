import React from "react";
import "./Departments.css";

export default function Departments() {
    const departments = [
        { title: "Кардіологія", icon: "❤️", desc: "Лікування серцевих захворювань" },
        { title: "Ортопедія", icon: "🦴", desc: "Травми та проблеми з суглобами" },
        { title: "Рентген", icon: "📷", desc: "Діагностика всіх органів" },
    ];

    return (
        <section className="departments">
            <h2>Наші відділення</h2>
            <div className="dept-cards">
                {departments.map((d, i) => (
                    <div className="dept-card" key={i}>
                        <div className="dept-icon">{d.icon}</div>
                        <h3>{d.title}</h3>
                        <p>{d.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}