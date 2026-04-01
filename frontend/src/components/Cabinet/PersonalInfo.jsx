import { useState, useEffect } from "react";
import { auth } from "../../firebase";
import { sendEmailVerification } from "firebase/auth";
import { toast } from "react-toastify";
import styles from "./Personal.module.scss";
import PersonalEditForm from "./PersonalEditForm";
import ChangeEmailForm from "./ChangeEmailForm";
import ChangePasswordForm from "./ChangePasswordForm";

export default function PersonalSection({ patientData }) {
    const [data, setData] = useState({});
    const [editMode, setEditMode] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);

    const [showEmailForm, setShowEmailForm] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    useEffect(() => {
        setData(patientData || {});
    }, [patientData]);

    useEffect(() => {
        const updateStatus = async () => {
            if (auth.currentUser) {
                await auth.currentUser.reload();
                setEmailVerified(auth.currentUser.emailVerified);
            }
        };

        updateStatus();

        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                user.reload().then(() => {
                    setEmailVerified(user.emailVerified);
                });
            }
        });

        return () => unsubscribe();
    }, []);

    const safe = (v) => (v ? v : "Не вказано");

    const getInitials = () => {
        const f = data.first_name?.[0] || "";
        const l = data.last_name?.[0] || "";
        return `${l}${f}`.toUpperCase();
    };

    const getInitialsDoc = () => {
        const f = data.doctor?.first_name?.[0] || "";
        const l = data.doctor?.last_name?.[0] || "";
        return `${l}${f}`.toUpperCase();
    };

    const getGenderLabel = (gender) => {
        if (gender === "male") return "Чоловік";
        if (gender === "female") return "Жінка";
        return "Не вказано";
    };

    const getAge = () => {
        if (!data.date_of_birth) return "";
        const dob = new Date(data.date_of_birth);
        const diff = Date.now() - dob.getTime();
        return new Date(diff).getUTCFullYear() - 1970;
    };

    const formatDate = (date) => {
        if (!date) return "Не вказано";
        return new Date(date).toLocaleDateString("uk-UA");
    };

    const handleSave = (updatedData) => {
        setData({ ...data, ...updatedData });
        setEditMode(false);
    };

    const handleEmailUpdated = (newEmail) => {
        setData(prev => ({
            ...prev,
            email: newEmail
        }));
        setEmailVerified(false);
        setShowEmailForm(false);
    };

    // 🔥 resend verification
    const resendVerification = async () => {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error();

            await sendEmailVerification(user);
            toast.success("Лист повторно надіслано");
        } catch {
            toast.error("Помилка при відправці");
        }
    };

    return (
        <div className={styles.piCard}>
            {editMode ? (
                <PersonalEditForm
                    data={data}
                    onSave={handleSave}
                    onCancel={() => setEditMode(false)}
                />
            ) : (
                <>
                    {/* HEADER */}
                    <div className={styles.piHeader}>
                        <div className={`${styles.piAvatar} ${styles[data.gender]}`}>
                            {getInitials()}
                        </div>

                        <div>
                            <p className={styles.piName}>
                                {safe(data.last_name)} {safe(data.first_name)} {safe(data.middle_name)}
                            </p>

                            <div className={styles.piMeta}>
                                <span className={`${styles.piBadge} ${styles[data.gender]}`}>
                                    {getGenderLabel(data.gender)}
                                </span>

                                {data.date_of_birth && (
                                    <span className={styles.piDob}>
                                        {formatDate(data.date_of_birth)} · {getAge()} р.
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* CONTACT */}
                    <div className={styles.piSection}>
                        <p className={styles.piSectionTitle}>Контактні дані</p>

                        <div className={styles.piGrid}>
                            {/* PHONE */}
                            <div className={styles.piField}>
                                <span className={styles.piLabel}>Телефон</span>
                                <span className={styles.piValue}>{safe(data.phone)}</span>
                                <div className={`${styles.piField} ${styles.full}`}>
                                    <span className={styles.piLabel}>Адреса</span>
                                    <span className={styles.piValue}>{safe(data.address)}</span>
                                </div>
                            </div>

                            {/* EMAIL */}
                            <div className={styles.piField}>
                                <span className={styles.piLabel}>Email</span>

                                <div className={styles.emailRow}>
                                    <span className={styles.piValue}>
                                        {safe(data.email)}
                                    </span>

                                    {emailVerified ? (
                                        <i className="fas fa-check-circle" style={{ color: "green" }} />
                                    ) : (
                                        <button
                                            className={styles.verifyBtn}
                                            onClick={resendVerification}
                                        >
                                            <i className="fas fa-times-circle" />
                                            <span className={styles.verifyText}>
                                                Відправити підтвердження
                                            </span>
                                        </button>
                                    )}
                                </div>

                                <button
                                    className={styles.piEditBtn}
                                    onClick={() => setShowEmailForm(true)}
                                >
                                    Змінити email
                                </button>

                                {/* 🔥 NEW BUTTON */}
                                <button
                                    className={styles.piEditBtn}
                                    onClick={() => setShowPasswordForm(true)}
                                    style={{ marginTop: "6px" }}
                                >
                                    Змінити пароль
                                </button>
                            </div>

                            {/* ADDRESS */}

                        </div>
                    </div>

                    <hr className={styles.piDivider} />

                    {/* NOTES */}
                    <div className={styles.piSection}>
                        <p className={styles.piSectionTitle}>Примітки</p>
                        <div className={styles.piNotesBox}>{safe(data.notes)}</div>
                    </div>

                    <hr className={styles.piDivider} />

                    {/* DOCTOR */}
                    <div className={styles.piSection}>
                        <p className={styles.piSectionTitle}>Сімейний лікар</p>

                        {data.doctor ? (
                            <div className={styles["pi-doctor-row"]}>
                                <div className={styles["pi-doctor-avatar"]}>
                                    {getInitialsDoc()}
                                </div>

                                <div className={styles["pi-doctor-info"]}>
                                    <span className={styles["pi-doctor-name"]}>
                                        {data.doctor.last_name} {data.doctor.first_name} {data.doctor.middle_name}
                                    </span>

                                    <span className={styles["pi-doctor-phone"]}>
                                        Номер телефону: {data.doctor.phone || "Не вказано"}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <span>Лікар не призначений</span>
                        )}
                    </div>

                    {/* FOOTER */}
                    <div className={styles.piFooter}>
                        <span className={styles.piTs}>
                            Оновлено: {data.updated_at
                            ? new Date(data.updated_at).toLocaleString("uk-UA")
                            : "Не вказано"}
                        </span>

                        <button
                            className={styles.piEditBtn}
                            onClick={() => setEditMode(true)}
                        >
                            Редагувати
                        </button>
                    </div>

                    {/* EMAIL MODAL */}
                    {showEmailForm && (
                        <div className={styles.modalOverlay}>
                            <div className={styles.modal}>
                                <ChangeEmailForm
                                    onClose={() => setShowEmailForm(false)}
                                    onSuccess={handleEmailUpdated}
                                />
                            </div>
                        </div>
                    )}

                    {/* PASSWORD MODAL */}
                    {showPasswordForm && (
                        <div className={styles.modalOverlay}>
                            <div className={styles.modal}>
                                <ChangePasswordForm
                                    onClose={() => setShowPasswordForm(false)}
                                />
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}