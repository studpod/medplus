import { Outlet } from "react-router-dom";
import StaffSidebar from "./StaffSidebar";
import StaffHeader from "./StaffHeader";
import "../styles/staff.scss";

export default function StaffLayout({ user, setUser }) {
    return (
        <div className="staff-layout">
            <StaffSidebar />
            <div className="staff-main">
                <StaffHeader user={user} setUser={setUser} />
                <div className="staff-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}