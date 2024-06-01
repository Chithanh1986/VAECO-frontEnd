import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './ChangePass.scss';
import { UserContext } from "../context/UserContext";
import { logoutUser, changePassword } from "../services/UserService";

function ChangePass() {
    const navigate = useNavigate();
    const [oldPassword, setOldPassword] = useState("");
    const [password, setPassword] = useState("");
    const [rePassword, setRePassword] = useState("");
    const [isShowPassword, setIsShowPassword] = useState(false);
    const { user, logoutContext } = useContext(UserContext);

    const isValidInputs = () => {
        if (!oldPassword || !password) {
            toast.error("input is required");
            return false;
        }
        if (password !== rePassword) {
            toast.error("Passwords are not same");
            return false;
        }
        return true;
    }

    const handleChangePassword = async () => {
        let check = isValidInputs();
        let passwordData = {
            oldPassword: oldPassword,
            newPassword: password,
            vae_user: user.account.vae_user
        };
        if (check === true) {
            let res = await changePassword(passwordData);
            if (res && res.EC === 0) {
                toast.success(res.EM)
                let data = await logoutUser();
                logoutContext();
                if (data && +data.EC === 0) {
                    navigate('/login');
                } else {
                    toast.error(data.EM);
                }

            }
            else {
                toast.error(res.EM);
            }
        }
    }

    const handlePressEnter = (event) => {
        if (event.charCode === 13) {
            handleChangePassword();
        }
    }

    return (

        <div >
            <div className='changePass-container col-12 col-sm-4'>
                <div className='title'><strong>Change Password</strong></div>
                <div className='text'>Old Password</div>
                <div className='input-2'>
                    <input
                        type={isShowPassword ? "text" : "password"}
                        placeholder='Old password...'
                        value={oldPassword}
                        onChange={(event) => setOldPassword(event.target.value)} />
                    <i className={isShowPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}
                        onClick={() => setIsShowPassword(!isShowPassword)}></i>
                </div>

                <div className='text'>New Password</div>
                <div className='input-2'>
                    <input
                        type={isShowPassword ? "text" : "password"}
                        placeholder='New password...'
                        value={password}
                        onChange={(event) => setPassword(event.target.value)} />
                    <i className={isShowPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}
                        onClick={() => setIsShowPassword(!isShowPassword)}></i>
                </div>

                <div className='text'>Confirm password</div>
                <div className='input-2'>
                    <input
                        type={isShowPassword ? "text" : "password"}
                        placeholder='Re-enter new password...'
                        value={rePassword}
                        onChange={(event) => setRePassword(event.target.value)}
                        onKeyPress={(event) => handlePressEnter(event)} />
                    <i className={isShowPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}
                        onClick={() => setIsShowPassword(!isShowPassword)}></i>
                </div>

                <button className={oldPassword && password && rePassword ? 'active' : ''}
                    onClick={() => handleChangePassword()}>Submit</button>
            </div >
        </div>
    );
}

export default ChangePass;