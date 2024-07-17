import React, { useState } from 'react';
import './Register.scss';
import { registerApi } from '../services/UserService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Register() {
    const navigate = useNavigate();
    const [vae_user, setVaeUser] = useState("");
    const [vae_id, setVaeId] = useState("");
    const [surname, setSurname] = useState("");
    const [name, setName] = useState("");
    const [division, setDivision] = useState("Tech");
    const [station, setStation] = useState("DAD")
    const password = "12345678";
    const [group, setGroup] = useState("user");
    const [remark, setRemark] = useState();


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
            let serverData = await registerApi(vae_user, vae_id, surname, name, division, station, password, group, remark);
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

                <div className='text'>Surname</div>
                <input
                    type='text'
                    value={surname}
                    onChange={(event) => setSurname(event.target.value)} />

                <div className='text'>Name</div>
                <input
                    type='text'
                    value={name}
                    onChange={(event) => setName(event.target.value)} />

                <div className='text'>Division</div>
                <select
                    className='form-select'
                    onChange={(event) => setDivision(event.target.value)}
                    onKeyPress={(event) => handlePressEnter(event)}
                >
                    <option value="Admin">Admin division</option>
                    <option selected value="Tech">Tech division</option>
                    <option value="Team 1">Team 1</option>
                    <option value="Team 2">Team 2</option>
                    <option value="Team 3">Team 3</option>
                    <option value="Team 4">Team 4</option>
                </select>

                <div className='text'>Station</div>
                <select
                    className='form-select'
                    onChange={(event) => setStation(event.target.value)}
                    onKeyPress={(event) => handlePressEnter(event)}
                >
                    <option selected value="DAD">DAD</option>
                    <option value="CXR">CXR</option>
                    <option value="HUI">HUI</option>
                    <option value="VDH">VDH</option>
                    <option value="UIH">UIH</option>
                    <option value="TBB">TBB</option>
                    <option value="VCL">VCL</option>
                </select>

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

                <div className='text'>Remark</div>
                <input
                    type='text'
                    value={remark}
                    onChange={(event) => setRemark(event.target.value)} />

                <div className='text'>Default password: 12345678</div>

                <button className={vae_user && vae_id ? 'active' : ''}
                    onClick={() => handleRegister()}>Submit</button>
            </div >
        </div>
    );
}

export default Register;