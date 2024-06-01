import React, { useEffect, useState } from "react";
import { getUserAccount } from "../services/UserService";

const UserContext = React.createContext(null);

const UserProvider = ({ children }) => {
    // User is the name of the "data" that gets stored in context
    const userDefault = {
        isLoading: true,
        isAuthenticated: false,
        token: "",
        account: {}
    }
    const [user, setUser] = useState(userDefault);

    // Login updates the user data with a name parameter
    const loginContext = (userData) => {
        setUser({ ...userData, isLoading: false })
    };

    // Logout updates the user data to default
    const logoutContext = () => {
        setUser({ ...userDefault, isLoading: false });
    };

    const fetchUser = async () => {
        let response = await getUserAccount();
        if (response && response.EC === 0) {
            let group = response.DT.group;
            let vae_user = response.DT.vae_user;
            let token = response.DT.access_token
            let data = {
                isAuthenticated: true,
                token: token,
                isLoading: false,
                account: { group, vae_user }
            }
            setUser(data);
        } else {
            setUser({ ...userDefault, isLoading: false });
        }
    }

    useEffect(() => {
        fetchUser();
    }, [])

    return (
        <UserContext.Provider value={{ user, loginContext, logoutContext }}>
            {children}
        </UserContext.Provider>
    );
}

export { UserContext, UserProvider };