import { Route, Routes } from "react-router-dom";
import Home from '../components/Home';
import FlightPlan from '../components/FlightPlan';
import Register from '../components/Register';
import UserList from '../components/Users';
import LoginPage from "../components/LoginPage";
import ChangePass from "../components/ChangePass";
import Resource from "../components/Resource";
import PhaseCheck from "../components/PhaseCheck";
import { useNavigate } from 'react-router-dom';
import React, { useContext, useEffect } from 'react';
import { UserContext } from "../context/UserContext";
import PointCode from "../components/PointCode";
import Report from "../components/Report";

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
                <Route path="/phaseCheck" element={<PhaseCheck />} />
                <Route path="/register" element={<Register />} />
                <Route path="/users" element={<UserList />} />
                <Route path="/changePass" element={<ChangePass />} />
                <Route path="/resource" element={<Resource />} />
                <Route path="/pointCode" element={<PointCode />} />
                <Route path="/report" element={<Report />} />
            </Routes>
        </>
    )
}

export default AppRoutes;