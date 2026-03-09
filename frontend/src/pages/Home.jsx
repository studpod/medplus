import "./Home.scss";

export default function Home({ user }) {
    return (
        <>

            {/*<h1>Головна сторінка</h1>*/}

            {/*/!* Тимчасовий індикатор авторизації *!/*/}
            {/*{user && <p>Ви увійшли як: {user.email}</p>}*/}

            <main className="home">

                {/* HERO SECTION */}
                <section className="hero">
                    <div className="container hero__content">

                        <div className="hero__text">
                            <h1>
                                Сучасна приватна клініка нового покоління
                            </h1>

                            <p>
                                Професійна діагностика, лікування та турбота про ваше здоров’я.
                            </p>

                            <button className="hero__btn">
                                Записатися на прийом
                            </button>
                        </div>

                    </div>
                </section>

                {/* ABOUT SECTION */}
                <section className="about">
                    <div className="container about__content">

                        {/* Ліва частина - фото клініки */}
                        <div className="about__image">
                            <img src="/image/Home/clinic.png" alt="" />
                        </div>

                        {/* Права частина - текст та переваги */}
                        <div className="about__text">
                            <h2>Про нас</h2>
                            <p>
                                MedPlus — сучасна приватна клініка, яка об'єднує професіоналізм лікарів, передові медичні технології та комфортні умови для пацієнтів.
                                Ми надаємо широкий спектр медичних послуг: від комплексної діагностики та консультацій до лікування різних захворювань та профілактичних програм.
                                Кожен пацієнт отримує індивідуальний підхід та увагу на всіх етапах лікування.
                                Наша мета — зробити медичну допомогу доступною, якісною та зрозумілою, щоб ви завжди відчували турботу та впевненість у своєму здоров’ї.
                            </p>

                            <ul className="about__text__advantages">
                                <li>Сучасне обладнання та інноваційні методи лікування</li>
                                <li>Висококваліфіковані лікарі з багаторічним досвідом</li>
                                <li>Індивідуальний підхід до кожного пацієнта</li>
                                <li>Зручне онлайн-записування та контроль лікування</li>
                            </ul>

                            <button className="hero__btn">Дізнатись більше</button>
                        </div>

                    </div>
                </section>

                {/* ADVANTAGES SECTION */}
                <section className="advantages">
                    <div className="container">
                        <h2>Навігація по клініці</h2>
                        <div className="advantages__list">

                            <div className="advantages__item">
                                <h3>Відділення</h3>
                                <p>Дізнайтесь про наші сучасні відділення та спеціалізації.</p>
                                <a href="/departments" className="advantages__btn">Дізнатись більше</a>
                            </div>

                            <div className="advantages__item">
                                <h3>Лікарі</h3>
                                <p>Знайомтесь з нашими висококваліфікованими лікарями.</p>
                                <a href="/doctors" className="advantages__btn">Дізнатись більше</a>
                            </div>

                            <div className="advantages__item">
                                <h3>Послуги</h3>
                                <p>Повний спектр медичних послуг для вашого здоров’я.</p>
                                <a href="/services" className="advantages__btn">Дізнатись більше</a>
                            </div>

                            <div className="advantages__item">
                                <h3>Ціни</h3>
                                <p>Прозора система цін та різні пакети послуг.</p>
                                <a href="/pricing" className="advantages__btn">Дізнатись більше</a>
                            </div>

                            <div className="advantages__item">
                                <h3>Контакти</h3>
                                <p>Зв’яжіться з нами для консультації чи запису.</p>
                                <a href="/contacts" className="advantages__btn">Дізнатись більше</a>
                            </div>

                        </div>
                    </div>
                </section>

            </main>
        </>
    );
}