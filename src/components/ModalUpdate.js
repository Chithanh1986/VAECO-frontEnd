import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import React, { useEffect, useState, useContext } from 'react';
import _ from 'lodash';
import { toast } from 'react-toastify';
import { updateUser } from '../services/UserService';
import { UserContext } from '../context/UserContext';

const ModalUpdate = (props) => {
    const defaultUserData = {
        vae_user: '',
        vae_id: '',
        surname: '',
        name: '',
        division: '',
        station: '',
        group: '',
        remark: ''
    };
    const [userData, setUserData] = useState(defaultUserData);

    useEffect(() => {
        setUserData(props.dataModalUpdate);
    }, [props.dataModalUpdate])

    const handleOnchangeInput = (value, name) => {
        let _userData = _.cloneDeep(userData);
        _userData[name] = value;
        setUserData(_userData);
    }

    const isValidInputs = () => {
        if (!userData.vae_user || !userData.vae_id) {
            toast.error("input is required");
            return false;
        }
        return true;
    }

    const handleConfirmUpdate = async () => {
        let check = isValidInputs();
        if (check === true) {
            let res = await updateUser(userData);
            if (res && res.EC === 0) {
                toast.success(res.EM)
                props.onHide();
            }
            else {
                toast.error(res.EM);
            }
        }
    }

    return (
        <>
            <Modal
                size='lg'
                show={props.show}
                className='modal-user'
                onHide={props.onHide}
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <span>{props.title}</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='content-body'>
                        <div className=' form-group'>
                            <label>Vaeco user :</label>
                            <input className='form-control' value={userData.vae_user}
                                onChange={(event) => handleOnchangeInput(event.target.value, "vae_user")}
                            />
                        </div>

                        <div className=' form-group'>
                            <label>Vaeco Id :</label>
                            <input className='form-control' value={userData.vae_id}
                                onChange={(event) => handleOnchangeInput(event.target.value, "vae_id")}
                            />
                        </div>

                        <div className='form-group'>
                            <label>Surname :</label>
                            <input className='form-control' value={userData.surname}
                                onChange={(event) => handleOnchangeInput(event.target.value, "surname")}
                            />
                        </div>

                        <div className=' form-group'>
                            <label>Name :</label>
                            <input className='form-control' value={userData.name}
                                onChange={(event) => handleOnchangeInput(event.target.value, "name")}
                            />
                        </div>

                        <div className=' form-group'>
                            <label>Division :</label>
                            <select
                                className='form-select'
                                onChange={(event) => handleOnchangeInput(event.target.value, "division")}
                                value={userData.division}
                            >
                                <option value="Admin">Admin division</option>
                                <option selected value="Tech">Tech division</option>
                                <option value="Team 1">Team 1</option>
                                <option value="Team 2">Team 2</option>
                                <option value="Team 3">Team 3</option>
                                <option value="Team 4">Team 4</option>
                                <option value="Store">Store</option>
                            </select>
                        </div>

                        <div className=' form-group'>
                            <label>Station :</label>
                            <select
                                className='form-select'
                                onChange={(event) => handleOnchangeInput(event.target.value, "station")}
                                value={userData.station}
                            >
                                <option selected value="DAD">DAD</option>
                                <option value="CXR">CXR</option>
                                <option value="HUI">HUI</option>
                                <option value="VDH">VDH</option>
                                <option value="UIH">UIH</option>
                                <option value="TBB">TBB</option>
                                <option value="VCL">VCL</option>
                                <option value="PXU">PXU</option>
                            </select>
                        </div>

                        <div className=' form-group'>
                            <label>Group :</label>
                            <select
                                className='form-select'
                                onChange={(event) => handleOnchangeInput(event.target.value, "group")}
                                value={userData.group}
                            >
                                <option value="user">user</option>
                                <option value="leader">leader</option>
                                <option value="admin">admin</option>
                            </select>
                        </div>

                        <div className=' form-group'>
                            <label>Remark :</label>
                            <input className='form-control' value={userData.remark}
                                onChange={(event) => handleOnchangeInput(event.target.value, "remark")}
                            />
                        </div>

                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={props.onHide}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={() => handleConfirmUpdate()}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default ModalUpdate;