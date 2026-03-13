import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

export default function StaffSidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    const toggleSidebar = () => setCollapsed(!collapsed);

    const links = [
        { to: "/staff", label: "Dashboard", icon: "fas fa-home" },
        { to: "/staff/appointments", label: "Прийоми", icon: "fas fa-calendar-check" },
        { to: "/staff/patients", label: "Пацієнти", icon: "fas fa-user-injured" },
        { to: "/staff/lab", label: "Лабораторія", icon: "fas fa-flask" },
        { to: "/staff/settings", label: "Налаштування", icon: "fas fa-cog" },
    ];

    return (
        <aside className={`staff-sidebar ${collapsed ? "collapsed" : ""}`}>
            <div className="staff-logo">
                {!collapsed && <span>MED PANEL</span>}
            </div>

            <button className="collapse-btn" onClick={toggleSidebar}>
                <i className={`fas ${collapsed ? "fa-angle-right" : "fa-angle-left"}`}></i>
            </button>

            <nav>
                {links.map((link) => (
                    <Link
                        key={link.to}
                        to={link.to}
                        className={location.pathname === link.to ? "active" : ""}
                    >
                        <i className={link.icon}></i>
                        {!collapsed && <span>{link.label}</span>}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}