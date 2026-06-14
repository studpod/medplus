import styles from "../../pages/Services/ServicesPage.module.scss";

const types = {
    consultation: "Консультація",
    lab_test: "Лабораторне дослідження",
    procedure: "Процедура",
    checkup: "Огляд",
    diagnostics: "Діагностика",
};

export default function ServiceCard({ service }) {
    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h3>{service.name}</h3>

                <div className={styles.price}>
                    {Number(service.price).toFixed(0)} грн
                </div>
            </div>

            <p className={styles.type}>
                {types[service.type] || service.type}
            </p>

            <p className={styles.description}>
                {service.description}
            </p>

            <button className={styles.btn}>
                Записатись
            </button>
        </div>
    );
}