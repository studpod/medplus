import { signOut } from "firebase/auth";
import { auth } from "../../firebase";

export default function StaffHeader({
                                        user,
                                        setUser
                                    }) {

    const logout = async () => {

        await signOut(auth);

        localStorage.removeItem("staff_user");

        localStorage.removeItem("token");

        setUser(null);

        window.location.href = "/staff/login";
    };

    const profile = user?.profile;

    const fullName = profile
        ? `${profile.last_name} ${profile.first_name} ${profile.middle_name || ""}`
        : "";

    const roleLabel = {
        doctor: "Лікар",
        receptionist: "Реєстратура"
    };

    const subtitle =
        user?.role === "admin"
            ? "АДМІН"
            : user?.role === "doctor"
                ? profile?.specialization?.name
                : roleLabel[user?.role];
    return (
        <header className="staff-header">

            <div className="staff-header-title">

                {subtitle && `${subtitle} — `}

                {fullName}

            </div>

            <div className="staff-user">

                <button onClick={logout}>
                    Вийти
                </button>

            </div>

        </header>
    );
}