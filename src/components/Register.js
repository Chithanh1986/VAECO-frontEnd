import React, { useState } from 'react';
import './Register.scss';
import { registerApi } from '../services/UserService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Register() {
    const navigate = useNavigate();
    const [vae_user, setVaeUser] = useState("");
    const [vae_id, setVaeId] = useState("");
    const [password, setPassword] = useState("");
    const [rePassword, setRePassword] = useState("");
    const [group, setGroup] = useState("");
    const [isShowPassword, setIsShowPassword] = useState(false);

    const isValidInputs = () => {
        if (!vae_user || !vae_id || !password) {
            toast.error("input is required");
            return false;
        }
        if (password !== rePassword) {
            toast.error("Passwords are not same");
            return false;
        }
        return true;
    }

    const handleRegister = async () => {
        let check = isValidInputs();
        if (check === true) {
            let serverData = await registerApi(vae_user, vae_id, password, group);
            if (+serverData.EC === 0) {
                toast.success(serverData.EM)
                navigate('/users');
            } else {
                toast.error(serverData.EM)
            }
        }
    }

    const handlePressEnter = (event) => {
        if (event.charCode === 13) {
            handleRegister();
        }
    }

    return (

        <div>
            <div className='register-container col-12 col-sm-4'>
                <div className='title'><strong>Register</strong></div>
                <div className='text'>Vaeco User</div>
                <input
                    type='text'
                    placeholder='Enter user name...'
                    value={vae_user}
                    onChange={(event) => setVaeUser(event.target.value)} />

                <div className='text'>Vaeco Id</div>
                <input
                    type='text'
                    placeholder='E.g: 1234'
                    value={vae_id}
                    onChange={(event) => setVaeId(event.target.value)} />

                <div className='text'>Group</div>
                <select
                    className='form-select'
                    onChange={(event) => setGroup(event.target.value)}
                >
                    <option value="user">user</option>
                    <option value="leader">leader</option>
                    <option value="admin">admin</option>
                </select>
                {/* type='text'
                    placeholder='Enter account type...'
                    value={group}
                    onChange={(event) => setGroupId(event.target.value)} */}

                <div className='text'>Password</div>
                <div className='input-2'>
                    <input
                        type={isShowPassword ? "text" : "password"}
                        placeholder='Password...'
                        value={password}
                        onChange={(event) => setPassword(event.target.value)} />
                    <i className={isShowPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}
                        onClick={() => setIsShowPassword(!isShowPassword)}></i>
                </div>

                <div className='text'>Confirm password</div>
                <div className='input-2'>
                    <input
                        type={isShowPassword ? "text" : "password"}
                        placeholder='Re-enter password...'
                        value={rePassword}
                        onChange={(event) => setRePassword(event.target.value)}
                        onKeyPress={(event) => handlePressEnter(event)} />
                    <i className={isShowPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}
                        onClick={() => setIsShowPassword(!isShowPassword)}></i>
                </div>

                <button className={vae_user && vae_id && password && rePassword ? 'active' : ''}
                    onClick={() => handleRegister()}>Submit</button>
            </div >
        </div>
    );
}

export default Register;