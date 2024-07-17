import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import logovaeco from '../assets/images/logovaeco.png';
import { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Header.scss';
import { UserContext } from "../context/UserContext";
import { logoutUser } from "../services/UserService";
import { toast } from 'react-toastify';

const Header = (props) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logoutContext } = useContext(UserContext);
    const userLogin = "Welcome: " + user.account.vae_user;
    const handleLogout = async () => {
        let data = await logoutUser();
        logoutContext();
        if (data && +data.EC === 0) {
            navigate('/login');
        } else {
            toast.error(data.EM);
        }
    }
    return (
        <>
            {location.pathname !== '/login' &&
                <div className='nav-header'>
                    <Navbar bg="header" expand="lg"  >
                        <Container>
                            <Navbar.Brand>
                                <img
                                    src={logovaeco}
                                    width="90"
                                    height="40"
                                    className="d-inline-block align-top"
                                    alt="React Bootstrap logo"
                                />
                            </Navbar.Brand>
                            <Navbar.Toggle aria-controls="basic-navbar-nav" />
                            <Navbar.Collapse id="basic-navbar-nav">
                                <Nav activeKey={location.pathname} className="me-auto">
                                    <Nav.Link href="/home" >Flight service</Nav.Link>
                                    <Nav.Link href="/FlightPlan">Flight plan</Nav.Link>
                                    <Nav.Link href="/Resource">Resource</Nav.Link>
                                    <NavDropdown title="Admin" id="basic-nav-dropdown">
                                        <NavDropdown.Item href="/register">Register</NavDropdown.Item>
                                        <NavDropdown.Item href="/users">Manage users</NavDropdown.Item>
                                        <NavDropdown.Item href="/pointCode">Point Code</NavDropdown.Item>
                                    </NavDropdown>
                                </Nav>
                                <Nav>
                                    <NavDropdown title={userLogin} id="basic-nav-dropdown">
                                        <NavDropdown.Item href="/changePass">Change password</NavDropdown.Item>
                                        <NavDropdown.Item >
                                            <span onClick={() => handleLogout()}>Log out</span>
                                        </NavDropdown.Item>
                                    </NavDropdown>
                                </Nav>
                            </Navbar.Collapse>
                        </Container>
                    </Navbar>
                </div>
            }
        </>

    );
}

export default Header;