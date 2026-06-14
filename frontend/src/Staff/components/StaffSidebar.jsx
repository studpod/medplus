import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

export default function StaffSidebar({ user }) {

    const [collapsed, setCollapsed] = useState(false);

    const location = useLocation();

    const toggleSidebar = () => setCollapsed(!collapsed);

    const role = user?.role;

    const specialization =
        user?.profile?.specialization?.name;

    const isFamilyDoctor =
        specialization === "Сімейний лікар (Терапевт)";

    let links = [];

    /*
    |--------------------------------------------------------------------------
    | DOCTOR
    |--------------------------------------------------------------------------
    */

    if (role === "doctor") {

        links = [
            {
                to: "/staff",
                label: "Dashboard",
                icon: "fas fa-home"
            },

            {
                to: "/staff/appointments",
                label: "Прийоми",
                icon: "fas fa-calendar-check"
            },

            ...(isFamilyDoctor
                    ? [
                        {
                            to: "/staff/patients",
                            label: "Пацієнти",
                            icon: "fas fa-user-injured"
                        },

                        {
                            to: "/staff/video",
                            label: "Онлайн консультація",
                            icon: "fas fa-video"
                        },

                        {
                            to: "/staff/analyses",
                            label: "Аналізи та дослідження",
                            icon: "fas fa-flask"
                        },
                    ]
                    : [
                        {
                            to: "/staff/analyses",
                            label: "Аналізи та дослідження",
                            icon: "fas fa-flask"
                        },
                    ]
            ),

            {
                to: "/staff/settings",
                label: "Налаштування",
                icon: "fas fa-cog"
            },
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | RECEPTIONIST
    |--------------------------------------------------------------------------
    */

    if (role === "receptionist") {

        links = [
            {
                to: "/staff",
                label: "Dashboard",
                icon: "fas fa-home"
            },

            {
                to: "/staff/receptionist/appointments",
                label: "Всі записи",
                icon: "fas fa-calendar-alt"
            },

            {
                to: "/staff/receptionist/patients",
                label: "Пацієнти",
                icon: "fas fa-user-injured"
            },

            {
                to: "/staff/receptionist/settings",
                label: "Налаштування",
                icon: "fas fa-cog"
            },
        ];
    }

    /*
|--------------------------------------------------------------------------
| ADMIN
|--------------------------------------------------------------------------
*/

    if (role === "admin") {

        links = [
            {
                to: "/staff/admin",
                label: "Dashboard",
                icon: "fas fa-home"
            },
            {
                to: "/staff/doctors",
                label: "Лікарі",
                icon: "fas fa-user-md"
            },
            {
                to: "/staff/receptionists",
                label: "Реєстратура",
                icon: "fas fa-notes-medical"
            },
            {
                to: "/staff/services",
                label: "Послуги",
                icon: "fas fa-list"
            },
            {
                to: "/staff/settings",
                label: "Налаштування",
                icon: "fas fa-cog"
            },
        ];
    }

    return (
        <aside className={`staff-sidebar ${collapsed ? "collapsed" : ""}`}>

            <div className="staff-logo">
                {!collapsed && <span>MED PANEL</span>}
            </div>

            <button
                className="collapse-btn"
                onClick={toggleSidebar}
            >
                <i
                    className={`fas ${
                        collapsed
                            ? "fa-angle-right"
                            : "fa-angle-left"
                    }`}
                ></i>
            </button>

            <nav>

                {links.map((link) => (

                    <Link
                        key={link.to}
                        to={link.to}
                        className={
                            location.pathname === link.to
                                ? "active"
                                : ""
                        }
                    >
                        <i className={link.icon}></i>

                        {!collapsed && (
                            <span>{link.label}</span>
                        )}

                    </Link>

                ))}

            </nav>

        </aside>
    );
}