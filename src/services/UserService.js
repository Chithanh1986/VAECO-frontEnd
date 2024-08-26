import instance from "../setup/axios"; //đã setup axios thành instance

const registerApi = (vae_user, vae_id, surname, name, division, station, password, group, remark) => {
    vae_user = vae_user.trim();
    vae_id = vae_id.trim();
    surname = surname.trim();
    name = name.trim();
    division = division.trim();
    station = station.trim();
    group = group.trim();
    if (remark === undefined) {
        remark = "";
    } else {
        remark = remark.trim();
    }
    return instance.post("/api/register", { vae_user, vae_id, surname, name, division, station, password, group, remark });
}

const loginApi = (vae_user, password) => {
    vae_user = vae_user.trim();
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
    userData.vae_user = userData.vae_user.trim();
    userData.vae_id = userData.vae_id.trim();
    userData.surname = userData.surname.trim();
    userData.name = userData.name.trim();
    userData.division = userData.division.trim();
    userData.station = userData.station.trim();
    userData.group = userData.group.trim();
    if (userData.remark === undefined) {
        userData.remark = "";
    } else {
        userData.remark = userData.remark.trim();
    }

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
    searchValue = searchValue.trim();
    return instance.post(`/api/search_user`, { searchValue });
}

const flightPlantApi = (flightShip1DAD, flightShip2DAD, flightShip1CXR, flightShip2CXR,
    flightDataVDH, flightDataHUI, flightDataVCL, flightDataUIH, flightDataTBB, flightDataPXU
) => { //trim data at server side
    return instance.post("/api/flight_plan", {
        flightShip1DAD, flightShip2DAD, flightShip1CXR, flightShip2CXR,
        flightDataVDH, flightDataHUI, flightDataVCL, flightDataUIH, flightDataTBB, flightDataPXU
    });
}

const loadPlanApi = (date, ship, station) => {
    return instance.post(`/api/load_plan`, { date, ship, station });
}

const savePlanApi = (reqData) => { //trim data at server side
    return instance.post(`/api/save_plan`, { reqData });
}

const loadTeamData = (team, station) => {
    return instance.post(`/api/load_team`, { team, station });
}

const createPointCode = (pointCode) => {
    pointCode.airline = pointCode.airline.trim();
    pointCode.code = pointCode.code.trim();
    pointCode.ACType = pointCode.ACType.toString().trim();
    pointCode.type = pointCode.type.trim();
    if (pointCode.maxTime !== "") { pointCode.maxTime = pointCode.maxTime.toString().trim(); }
    pointCode.remark = pointCode.remark.trim();
    pointCode.CRSWHour = pointCode.CRSWHour.toString().trim();
    pointCode.MECHWHour = pointCode.MECHWHour.toString().trim();
    pointCode.CRSWPoint = pointCode.CRSWPoint.toString().trim();
    pointCode.MECHWpoint = pointCode.MECHWPoint.toString().trim();
    return instance.post("/api/create_pointCode", { pointCode });
}

const loadPointCode = (page, limit) => {
    return instance.get(`/api/show_pointCode?page=${page}&limit=${limit}`);//template string
}

const updatePointCode = (pointCode) => {
    pointCode.airline = pointCode.airline.trim();
    pointCode.code = pointCode.code.trim();
    pointCode.ACType = pointCode.ACType.toString().trim();
    pointCode.type = pointCode.type.trim();
    if (pointCode.maxTime !== "") { pointCode.maxTime = pointCode.maxTime.toString().trim(); }
    pointCode.remark = pointCode.remark.trim();
    pointCode.CRSWHour = pointCode.CRSWHour.toString().trim();
    pointCode.MECHWHour = pointCode.MECHWHour.toString().trim();
    pointCode.CRSWPoint = pointCode.CRSWPoint.toString().trim();
    pointCode.MECHWpoint = pointCode.MECHWPoint.toString().trim();
    return instance.put("/api/updatePC", { pointCode });
}

const deletePC = (pointCode) => {
    return instance.delete("/api/deletePC", { data: { id: pointCode.id } });
}

const searchPointCode = (searchValue) => {
    searchValue = searchValue.trim();
    return instance.post(`/api/search_PC`, { searchValue });
}

const loadAllPC = () => {
    return instance.get(`/api/show_all_PC`);
}

const getGroupUsers = (station, division) => {
    return instance.post(`/api/getGroupUsers`, { station, division });
}

const getPowerData = (date) => {
    return instance.post(`/api/getPowerData`, { date });
}

export {
    registerApi, loginApi, fetchAllUsers, deleteUser, resetPassword, updateUser, logoutUser, getUserAccount,
    changePassword, searchApi, flightPlantApi, loadPlanApi, savePlanApi, loadTeamData, createPointCode, loadPointCode,
    updatePointCode, deletePC, searchPointCode, loadAllPC, getGroupUsers, getPowerData
};