import React, { useState } from 'react';
import './Register.scss';
import { registerApi } from '../services/UserService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Register() {
    const navigate = useNavigate();
    const [vae_user, setVaeUser] = useState("");
    const [vae_id, setVaeId] = useState("");
    const password = "12345678";
    const [group, setGroup] = useState("user");

    const isValidInputs = () => {
        if (!vae_user || !vae_id) {
            toast.error("input is required");
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
                    onKeyPress={(event) => handlePressEnter(event)}
                    onChange={(event) => setVaeId(event.target.value)} />

                <div className='text'>Group</div>
                <select
                    className='form-select'
                    onChange={(event) => setGroup(event.target.value)}
                    onKeyPress={(event) => handlePressEnter(event)}
                >
                    <option selected value="user">user</option>
                    <option value="leader">leader</option>
                    <option value="admin">admin</option>
                </select>

                <div className='text'>Default password: 12345678</div>

                <button className={vae_user && vae_id ? 'active' : ''}
                    onClick={() => handleRegister()}>Submit</button>
            </div >
        </div>
    );
}

export default Register;