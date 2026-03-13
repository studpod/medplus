export default function StaffHeader({ user, setUser }) {
    const logout = () => {
        localStorage.removeItem("staff_user");
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <header className="staff-header">
            <div className="staff-header-title">Медична панель</div>
            <div className="staff-user">
                <span>{user?.email}</span>
                <button onClick={logout}>Вийти</button>
            </div>
        </header>
    );
}