import React from "react";
import "./Doctors.css";

export default function Doctors() {
    const doctors = [
        { name: "Іваненко І.І.", spec: "Кардіолог", img: "https://via.placeholder.com/100" },
        { name: "Петренко П.П.", spec: "Ортопед", img: "https://via.placeholder.com/100" },
        { name: "Сидоренко С.С.", spec: "Рентгенолог", img: "https://via.placeholder.com/100" },
    ];

    return (
        <section className="doctors">
            <h2>Наші лікарі</h2>
            <div className="doc-cards">
                {doctors.map((d, i) => (
                    <div className="doc-card" key={i}>
                        <img src={d.img} alt={d.name} />
                        <h3>{d.name}</h3>
                        <p>{d.spec}</p>
                        <button className="btn-primary">Записатися</button>
                    </div>
                ))}
            </div>
        </section>
    );
}