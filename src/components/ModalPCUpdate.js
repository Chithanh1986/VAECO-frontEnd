import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { toast } from 'react-toastify';
import { updatePointCode } from '../services/UserService';

const ModalPCUpdate = (props) => {
    const defaultPointCode = {
        airline: '',
        code: '',
        ACType: '',
        type: 'transit',
        maxTime: '',
        remark: '',
        CRSWHour: '',
        MECHWHour: '',
        CRSWPoint: '',
        MECHWpoint: '',
    };
    const [pointCode, setPointCode] = useState(defaultPointCode);

    useEffect(() => {
        setPointCode(props.dataModalPCUpdate);
    }, [props.dataModalPCUpdate])

    const handleOnchangeInput = (value, name) => {
        let _pointCode = _.cloneDeep(pointCode);
        _pointCode[name] = value;
        setPointCode(_pointCode);
    }

    const isValidInputs = () => {
        if (!pointCode.code || !pointCode.type || !pointCode.CRSWHour || !pointCode.MECHWHour || !pointCode.CRSWPoint || !pointCode.MECHWPoint) {
            toast.error("input is required");
            return false;
        }
        return true;
    }

    const handleConfirmUpdate = async () => {
        let check = isValidInputs();
        if (check === true) {
            let res = await updatePointCode(pointCode);
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
                            <label>Airline :</label>
                            <input className='form-control' value={pointCode.airline}
                                onChange={(event) => handleOnchangeInput(event.target.value.toUpperCase(), "airline")}
                            />
                        </div>

                        <div className=' form-group'>
                            <label>Code :</label>
                            <input className='form-control' value={pointCode.code}
                                onChange={(event) => handleOnchangeInput(event.target.value.toUpperCase(), "code")}
                            />
                        </div>

                        <div className=' form-group'>
                            <label>AC type :</label>
                            <input className='form-control' value={pointCode.ACType}
                                onChange={(event) => handleOnchangeInput(event.target.value.toUpperCase(), "ACType")}
                            />
                        </div>

                        <div className=' form-group'>
                            <label>Type :</label>
                            <select
                                className='form-select'
                                onChange={(event) => handleOnchangeInput(event.target.value, "type")}
                                value={pointCode.type}
                            >
                                <option value="TRANSIT">TRANSIT</option>
                                <option value="TERM">TERM</option>
                                <option value="PRE">PRE</option>
                                <option value="TERM-PRE">TERM + PRE</option>
                                <option value="WO">WO</option>
                                <option value="IDR">Indirect</option>
                                <option value="CCCT">CCCT</option>
                                <option value="CCDB">CCDB</option>
                            </select>
                        </div>

                        <div className=' form-group'>
                            <label>Max service time (min) :</label>
                            <input className='form-control' value={pointCode.maxTime}
                                onChange={(event) => handleOnchangeInput(event.target.value.toUpperCase(), "maxTime")}
                            />
                        </div>

                        <div className='form-group'>
                            <label>Remark :</label>
                            <input className='form-control' value={pointCode.remark}
                                onChange={(event) => handleOnchangeInput(event.target.value.toUpperCase(), "remark")}
                            />
                        </div>

                        <div className=' form-group'>
                            <label>CRS working hour :</label>
                            <input className='form-control' value={pointCode.CRSWHour}
                                onChange={(event) => handleOnchangeInput(event.target.value, "CRSWHour")}
                            />
                        </div>

                        <div className=' form-group'>
                            <label>MECH working hour :</label>
                            <input className='form-control' value={pointCode.MECHWHour}
                                onChange={(event) => handleOnchangeInput(event.target.value, "MECHWHour")}
                            />
                        </div>

                        <div className=' form-group'>
                            <label>CRS working point :</label>
                            <input className='form-control' value={pointCode.CRSWPoint}
                                onChange={(event) => handleOnchangeInput(event.target.value, "CRSWPoint")}
                            />
                        </div>

                        <div className=' form-group'>
                            <label>MECH working point :</label>
                            <input className='form-control' value={pointCode.MECHWPoint}
                                onChange={(event) => handleOnchangeInput(event.target.value, "MECHWPoint")}
                            />
                        </div>

                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={props.onHide}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={() => handleConfirmUpdate()}>
                        Submit
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default ModalPCUpdate;