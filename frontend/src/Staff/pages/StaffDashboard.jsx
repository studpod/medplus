import React from "react";
import StaffCalendar from "../components/StaffCalendar";
import "../styles/staffCalendar.scss";

export default function StaffDashboard() {

    return (
        <div className="staff-dashboard">

            <h2 className="dashboard-title">
                Графік роботи
            </h2>

            <StaffCalendar />

        </div>
    );

}