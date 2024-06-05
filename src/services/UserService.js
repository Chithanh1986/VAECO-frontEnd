import instance from "../setup/axios"; //đã setup axios thành instance

const registerApi = (vae_user, vae_id, password, group) => {
    return instance.post("/api/register", { vae_user, vae_id, password, group })
}

const loginApi = (vae_user, password) => {
    return instance.post("/api/login", { vae_user, password });
}

const fetchAllUsers = (page, limit) => {
    return instance.get(`/api/show_user?page=${page}&limit=${limit}`);//template string
}

const deleteUser = (user) => {
    return instance.delete("/api/delete", { data: { id: user.id } });
}

const resetPassword = (user) => {
    return instance.put("/api/resetPassword", { data: { id: user.id } });
}

const updateUser = (userData) => {
    return instance.put("/api/update", { userData });
}

const getUserAccount = () => {
    return instance.get(`/api/account`);
}

const logoutUser = () => {
    return instance.post(`/api/logout`);
}

const changePassword = (passwordData) => {
    return instance.post("/api/changePassword", { passwordData });
}

const searchApi = (searchValue) => {
    return instance.post(`/api/search_user`, { searchValue });
}

export {
    registerApi, loginApi, fetchAllUsers, deleteUser, resetPassword, updateUser, logoutUser, getUserAccount,
    changePassword, searchApi
};