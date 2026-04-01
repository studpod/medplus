import { Outlet } from "react-router-dom";
import StaffSidebar from "./StaffSidebar";
import StaffHeader from "./StaffHeader";
import "../styles/staff.scss";
import { useEffect, useState } from "react";
import API from "../../api";

export default function StaffLayout({ setUser }) {
    const [user, setLocalUser] = useState(null);

    useEffect(() => {
        API.get("/doctor/view/me")
            .then(res => {
                setLocalUser(res.data);
                setUser(res.data);
            })
            .catch(err => console.log(err));
    }, [setUser]);

    return (
        <div className="staff-layout">
            {/* Sidebar працює навіть якщо user ще null */}
            <StaffSidebar user={user} />

            <div className="staff-main">
                <StaffHeader user={user} setUser={setUser} />

                <div className="staff-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}