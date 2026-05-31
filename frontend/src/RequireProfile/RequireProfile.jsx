import { Navigate } from "react-router-dom";
import API from "../api";
import { useEffect, useState } from "react";

export default function RequireProfile({ user, children }) {
    const [loading, setLoading] = useState(true);
    const [hasProfile, setHasProfile] = useState(false);

    useEffect(() => {
        const check = async () => {
            try {
                const res = await API.get("/patient/view/me");

                if (res.data?.patient?.last_name) {
                    setHasProfile(true);
                } else {
                    setHasProfile(false);
                }
            } catch {
                setHasProfile(false);
            } finally {
                setLoading(false);
            }
        };

        if (user) check();
    }, [user]);

    if (loading) return null;

    if (!hasProfile) {
        return <Navigate to="/complete-profile" replace />;
    }

    return children;
}