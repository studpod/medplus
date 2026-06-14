import API from "../../api";

/*
|--------------------------------------------------------------------------
| LIST
|--------------------------------------------------------------------------
*/
export const getReceptionists = (params) =>
    API.get(
        "/admin/view/receptionists",
        { params }
    );

/*
|--------------------------------------------------------------------------
| CREATE
|--------------------------------------------------------------------------
*/
export const createReceptionist = (data) =>
    API.post(
        "/admin/control/receptionists/add",
        data
    );

/*
|--------------------------------------------------------------------------
| UPDATE
|--------------------------------------------------------------------------
*/
export const updateReceptionist = (id, data) =>
    API.put(
        `/admin/control/receptionists/update/${id}`,
        data
    );

/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/
export const deleteReceptionist = (id) =>
    API.delete(
        `/admin/control/receptionists/delete/${id}`
    );