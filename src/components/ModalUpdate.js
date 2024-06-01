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
        group: ''
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