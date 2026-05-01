import "./Departments.scss";
import DepartmentCard from "../../components/Departments/DepartmentCard";

export default function DepartmentsPage() {

    const departments = [
        {
            name: "Сімейна медицина",
            desc: "Первинна допомога та діагностика",
            icon: "fa-user-md",
            slug: "family"
        },
        {
            name: "Кардіологія",
            desc: "Серце та судини",
            icon: "fa-heartbeat",
            slug: "cardiology"
        },
        {
            name: "Неврологія",
            desc: "Нервова система",
            icon: "fa-brain",
            slug: "neurology"
        },
        {
            name: "Дерматологія",
            desc: "Шкіра та алергії",
            icon: "fa-allergies",
            slug: "dermatology"
        },
        {
            name: "Офтальмологія",
            desc: "Зір та очі",
            icon: "fa-eye",
            slug: "ophthalmology"
        },
        {
            name: "ЛОР",
            desc: "Вухо, горло, ніс",
            icon: "fa-headphones",
            slug: "lor"
        },
        {
            name: "Гастроентерологія",
            desc: "Травлення",
            icon: "fa-stomach",
            slug: "gastro"
        },
        {
            name: "Ендокринологія",
            desc: "Гормони",
            icon: "fa-vial",
            slug: "endocrinology"
        },
        {
            name: "Урологія",
            desc: "Сечостатева система",
            icon: "fa-procedures",
            slug: "urology"
        },
        {
            name: "Хірургія",
            desc: "Операції",
            icon: "fa-user-injured",
            slug: "surgery"
        },
    ];

    return (
        <main className="departments">

            {/* HERO */}
            <section className="departments__hero">
                <div className="container">
                    <h1>Відділення клініки</h1>
                    <p>Оберіть напрямок та запишіться до лікаря онлайн</p>
                </div>
            </section>

            {/* GRID */}
            <section className="departments__grid-section">
                <div className="container">
                    <div className="departments__grid">
                        {departments.map((dep, i) => (
                            <DepartmentCard key={i} dep={dep} />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="departments__cta">
                <div className="container">
                    <h2>Не знаєте до якого лікаря звернутись?</h2>
                    <p>Запишіться до сімейного лікаря</p>

                    <button onClick={() => window.location.href = "/reception"}>
                        Записатися зараз
                    </button>
                </div>
            </section>

        </main>
    );
}