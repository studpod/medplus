import API from "../api";

export const getDashboardStats = async () => {

    const res = await API.get(
        "/admin/view/dashboard-stats"
    );

    return res.data;
};