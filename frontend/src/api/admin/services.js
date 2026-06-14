import API from "../../api";

export const getServices = (params) =>
    API.get("/admin/view/services", { params });

export const createService = (data) =>
    API.post("/admin/control/services/add", data);

export const updateService = (id, data) =>
    API.put(`/admin/control/services/update/${id}`, data);

export const deleteService = (id) =>
    API.delete(`/admin/control/services/delete/${id}`);