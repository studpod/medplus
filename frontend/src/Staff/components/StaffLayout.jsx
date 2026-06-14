import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

import StaffSidebar from "./StaffSidebar";
import StaffHeader from "./StaffHeader";

import API from "../../api";

import "../styles/staff.scss";

export default function StaffLayout({ setUser }) {

    const [user, setLocalUser] = useState(null);

    useEffect(() => {

        API.get("/staff/view/me")
            .then(res => {

                const data = res.data;

                const formattedUser = {
                    ...data.user,
                    profile: data.profile,
                    role: data.role
                };

                setLocalUser(formattedUser);

                setUser(formattedUser);

                localStorage.setItem(
                    "staff_user",
                    JSON.stringify(formattedUser)
                );

            })
            .catch(err => {

                console.log(err);

                localStorage.removeItem("staff_user");
                localStorage.removeItem("token");

                setLocalUser(null);

                setUser(null);
            });

    }, [setUser]);

    if (!user) {
        return (
            <div className="skeleton-page"></div>
        );
    }

    return (
        <div className="staff-layout">

            <StaffSidebar user={user} />

            <div className="staff-main">

                <StaffHeader
                    user={user}
                    setUser={setUser}
                />

                <div className="staff-content">
                    <Outlet context={{ user }} />
                </div>

            </div>

        </div>
    );
}