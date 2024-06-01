import { useEffect, useState, useContext } from 'react';
import './LoginPage.scss';
import { loginApi } from '../services/UserService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import logologin from '../assets/images/Logologin.jpg';
import { UserContext } from '../context/UserContext';

function LoginPage() {
    const { user, loginContext } = useContext(UserContext);
    const navigate = useNavigate();
    const [vae_user, setVae_user] = useState("");
    const [password, setPassword] = useState("");
    const [isShowPassword, setIsShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!vae_user || !password) {
            toast.error("Name/Password is required");
            return;
        }
        let response = await loginApi(vae_user, password);
        if (response && response.EC === 0) {
            //sucess
            let group = response.DT.group;
            let vae_user = response.DT.vae_user;
            let token = response.DT.access_token;
            let data = {
                isAuthenticated: true,
                token: token,
                account: { group, vae_user }
            }
            loginContext(data);
            navigate('/home');
        } else {
            toast.error(response.EM)
        }
    }

    const handlePressEnter = (event) => {
        if (event.charCode === 13) {
            handleLogin();
        }
    }

    useEffect(() => {
        if (user && user.isAuthenticated) {
            navigate('/home');
        }
    }, [])

    return (
        <div className='login-container col-12 col-sm-4'>
            <img
                src={logologin}
                className="img-fluid"
                alt="React Bootstrap logo"
            />
            <div className='title'>Log in</div>
            <div className='text'>Vaeco User</div>
            <input
                type='text'
                placeholder='Enter user name...'
                value={vae_user}
                onChange={(event) => setVae_user(event.target.value)} />
            <div className='input-2'>
                <input
                    type={isShowPassword ? "text" : "password"}
                    placeholder='Password...'
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    onKeyPress={(event) => handlePressEnter(event)}
                />
                <i className={isShowPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}
                    onClick={() => setIsShowPassword(!isShowPassword)}></i>
            </div>
            <button className={vae_user && password ? 'active' : ''}
                onClick={() => handleLogin()}>Login</button>
        </div >
    );
}

export default LoginPage;
