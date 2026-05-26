import ChangeEmailForm from "./ChangeEmailForm";
import ChangePasswordForm from "./ChangePasswordForm";
import styles from "../../../styles/staffSettings.module.scss";

export default function SecuritySettings() {
    return (
        <div className={styles.card}>

            <h2 className={styles.title}>Безпека</h2>

            <ChangeEmailForm />
            <ChangePasswordForm />

        </div>
    );
}