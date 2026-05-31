import styles from "../../pages/Departments/DoctorsPage.module.scss";

const API_URL = "http://localhost:8000";

export default function DoctorCard({
                                       doctor,
                                       onBook,
                                   }) {
    const getExperience = (doc) => {
        return 5 + (doc.id % 15);
    };

    return (
        <div className={styles.card}>
            <div className={styles.photo}>
                {doctor.avatar ? (
                    <img
                        src={`${API_URL}/storage/${doctor.avatar}`}
                        alt="doctor"
                    />
                ) : (
                    <div className={styles.noPhoto}>
                        {doctor.last_name?.[0]}
                        {doctor.first_name?.[0]}
                    </div>
                )}
            </div>

            <div className={styles.info}>
                <h3>
                    {doctor.last_name}
                    {" "}
                    {doctor.first_name}
                    {" "}
                    {doctor.middle_name}
                </h3>

                <p className={styles.spec}>
                    {doctor.specialization?.name}
                </p>

                <p className={styles.exp}>
                    🩺 Досвід: {getExperience(doctor)} років
                </p>

                <p className={styles.bio}>
                    Професійний лікар з індивідуальним
                    підходом до кожного пацієнта.
                </p>

                <button
                    className={styles.btn}
                    onClick={() => onBook(doctor)}
                >
                    Записатись
                </button>
            </div>
        </div>
    );
}