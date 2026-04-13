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
                const data = res.data;


                const formattedUser = {
                    ...data.user,
                    doctor: data.doctor
                };

                setLocalUser(formattedUser);
                setUser(formattedUser);
            })
            .catch(err => console.log(err));
    }, [setUser]);

    return (
        <div className="staff-layout">
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