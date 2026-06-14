import API from "../../api";

export const getSpecializations = () =>
    API.get("/admin/view/specializations");