import instance from "../setup/axios"; //đã setup axios thành instance

const registerApi = (vae_user, vae_id, surname, name, division, station, password, group, remark) => {
    return instance.post("/api/register", { vae_user, vae_id, surname, name, division, station, password, group, remark });
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

const flightPlantApi = (flightShip1DAD, flightShip2DAD, flightShip1CXR, flightShip2CXR) => {
    return instance.post("/api/flight_plan", { flightShip1DAD, flightShip2DAD, flightShip1CXR, flightShip2CXR });
}

const loadPlanApi = (date, ship, station) => {
    return instance.post(`/api/load_plan`, { date, ship, station });
}

const savePlanApi = (reqData) => {
    return instance.post(`/api/save_plan`, { reqData });
}

const loadTeamData = (team, station) => {
    return instance.post(`/api/load_team`, { team, station });
}

const createPointCode = (pointCode) => {
    return instance.post("/api/create_pointCode", { pointCode });
}

const loadPointCode = (page, limit) => {
    return instance.get(`/api/show_pointCode?page=${page}&limit=${limit}`);//template string
}

const updatePointCode = (pointCode) => {
    return instance.put("/api/updatePC", { pointCode });
}

const deletePC = (pointCode) => {
    return instance.delete("/api/deletePC", { data: { id: pointCode.id } });
}

const searchPointCode = (searchValue) => {
    return instance.post(`/api/search_PC`, { searchValue });
}

export {
    registerApi, loginApi, fetchAllUsers, deleteUser, resetPassword, updateUser, logoutUser, getUserAccount,
    changePassword, searchApi, flightPlantApi, loadPlanApi, savePlanApi, loadTeamData, createPointCode, loadPointCode,
    updatePointCode, deletePC, searchPointCode
};