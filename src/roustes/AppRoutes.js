import { Route, Routes } from "react-router-dom";
import Home from '../components/Home';
import FlightPlan from '../components/FlightPlan';
import Register from '../components/Register';
import UserList from '../components/Users';
import LoginPage from "../components/LoginPage";
import ChangePass from "../components/ChangePass";
import { useNavigate } from 'react-router-dom';
import React, { useContext, useEffect } from 'react';
import { UserContext } from "../context/UserContext";

const AppRoutes = (props) => {
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    useEffect(() => {
        if (user.isAuthenticated === false) {
            navigate('/login');
        }
    }, [])

    return (
        <>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/home" element={<Home />} />
                <Route path="/flightPlan" element={<FlightPlan />} />
                <Route path="/register" element={<Register />} />
                <Route path="/users" element={<UserList />} />
                <Route path="/changePass" element={<ChangePass />} />
            </Routes>
        </>
    )
}

export default AppRoutes;