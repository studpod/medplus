export default function StaffHeader({ user, setUser }) {

    const logout = () => {
        localStorage.removeItem("staff_user");
        localStorage.removeItem("token");
        setUser(null);
    };

    const doctor = user?.doctor;

    const fullName = doctor
        ? `${doctor.last_name} ${doctor.first_name} ${doctor.middle_name}`
        : "";

    const specialization = doctor?.specialization?.name || "";

    return (
        <header className="staff-header">
            <div className="staff-header-title"> {specialization && `${specialization} — `}
                {fullName}</div>

            <div className="staff-user">
                <button onClick={logout}>Вийти</button>
            </div>
        </header>
    );
}