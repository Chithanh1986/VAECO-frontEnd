import React, { useState } from 'react';
import './Home.scss';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { loadPlanApi } from '../services/UserService';

const Home = () => {
    const [date, setDate] = useState(null);
    const [ship, setShip] = useState("MO");
    const [flightPlan, setFlightPlan] = useState(null);
    const [WOPlan, setWOPlan] = useState(null);
    const [rev, setRev] = useState(null);
    const [shipLeader, setShipLeader] = useState(null);
    const [handoverShip, setHandovership] = useState(null);
    const [driver, setDriver] = useState(null);
    const [BDuty, setBDuty] = useState(null);
    const [powerSource, setPowerSource] = useState(null);

    const handleClear = () => {
        setDate(null);
        setFlightPlan(null);
        setRev(null);
    }

    const handleLoad = async () => {
        if (date) {
            let serverData = await loadPlanApi(new Date(date).toLocaleDateString('fr-FR'), ship);
            if (+serverData.EC === 0) {
                setRev(serverData.DT.rev);
                setShipLeader(serverData.DT.shipLeader);
                setHandovership(serverData.DT.handoverShip);
                setDriver(serverData.DT.driver);
                setBDuty(serverData.DT.BDuty);
                setPowerSource(serverData.DT.powerSource);
                setWOPlan(serverData.DT.WOData);
                setFlightPlan(serverData.DT.planData);
                toast.success(serverData.EM)
            } else {
                toast.error(serverData.EM)
            }
        } else {
            toast.error('Pls select date')
        }
    }

    const handleSave = () => {
        console.log(flightPlan)
    }

    const onChangeInput = (e, STT) => {
        const { name, value } = e.target
        const editData = flightPlan.map((item) =>
            item.STT === STT && name ? { ...item, [name]: value } : item
        )
        setFlightPlan(editData)
    }

    const onChangeInputWO = (e, STT) => {
        const { name, value } = e.target
        const editWO = WOPlan.map((item) =>
            item.STT === STT && name ? { ...item, [name]: value } : item
        )
        setWOPlan(editWO)
    }

    const onChangeInputBDuty = (e, STT) => {
        const { name, value } = e.target
        const editBDuty = BDuty.map((item) =>
            item.STT === STT && name ? { ...item, [name]: value } : item
        )
        setBDuty(editBDuty)
    }

    const onChangeInputPower = (e, STT) => {
        const { name, value } = e.target
        const editPower = powerSource.map((item) =>
            item.STT === STT && name ? { ...item, [name]: value } : item
        )
        setPowerSource(editPower)
    }

    const handleWOAddRow = () => {
        let addRow = WOPlan;
        let No = WOPlan.length + 1;
        setWOPlan(null);
        addRow.push({
            STT: No,
            ACReg: "",
            WONo: "",
            Desc: "",
            Remark: "",
            CRS: "",
            MECH1: "",
            MECH2: "",
            MECH3: "",
        });
        setTimeout(() => setWOPlan(addRow), 1);
    };

    const handleWODeleteRow = () => {
        let deleteRow = WOPlan.slice(0, -1);
        setWOPlan(null);
        setTimeout(() => setWOPlan(deleteRow), 1);
    };

    const handlePowerAddRow = () => {
        let addRow = powerSource;
        let No = powerSource.length + 1;
        setPowerSource(null)
        addRow.push({
            STT: No,
            ID: "",
            name: "",
            work: "0",
            point: "0",
            hours: "",
            type: "",
            fromTo: ""
        });
        setTimeout(() => setPowerSource(addRow), 1);
    };

    const handlePowerDeleteRow = () => {
        let deleteRow = powerSource.slice(0, -1);
        setPowerSource(null);
        setTimeout(() => setPowerSource(deleteRow), 1);
    };

    return (
        <div>
            <div className='container'>
                <div className='flight-container'>
                    <label > Choose date  :</label>
                    <DatePicker
                        selected={date}
                        onChange={date => setDate(date)}
                        minDate={new Date().setDate(new Date().getDate() - 10)}
                        maxDate={new Date().setDate(new Date().getDate() + 1)}
                        dateFormat="dd/MM/YYYY"
                    />
                    <label > Choose ship  :</label>
                    <select
                        className='form-select'
                        style={{ width: '20%' }}
                        onChange={(event) => setShip(event.target.value)}
                    >
                        <option selected value="MO">Morning</option>
                        <option value="EV">Evening</option>
                    </select>

                    <button className='btn'
                        onClick={() => handleClear()}>Clear</button>

                    <button className={date ? 'btn active' : 'btn'}
                        onClick={() => handleLoad()}>Load plan</button>

                    <button className={date ? 'btn active' : 'btn'}
                        onClick={() => handleSave()}>Save plan</button>

                </div >
            </div>
            <div className='plan-container'>
                {(flightPlan && WOPlan && powerSource) && (
                    <div >
                        <h3>Rev: {rev}</h3>
                        <table className='table-striped table-bordered' responsive>
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>A/L</th>
                                    <th>ACReg</th>
                                    <th>ACType</th>
                                    <th>ArrNo</th>
                                    <th>DepNo</th>
                                    <th>Route</th>
                                    <th>ETA</th>
                                    <th>ETD</th>
                                    <th>Remark</th>
                                    <th>Parking</th>
                                    <th>CRS1</th>
                                    <th>MECH1</th>
                                    <th>CRS2</th>
                                    <th>MECH2</th>
                                </tr>
                            </thead>
                            <tbody>
                                {flightPlan.map(({ STT, AL, ACReg, ACType, ArrNo, DepNo, Route, ETA, ETD, Remark, Parking, CRS1, MECH1, CRS2, MECH2 }) => (
                                    <tr key={STT}>
                                        <td>
                                            {STT}
                                        </td>
                                        <td>
                                            {AL}
                                        </td>
                                        <td>
                                            {ACReg}
                                        </td>
                                        <td>
                                            {ACType}
                                        </td>
                                        <td>
                                            {ArrNo}
                                        </td>
                                        <td>
                                            {DepNo}
                                        </td>
                                        <td>
                                            {Route}
                                        </td>
                                        <td>
                                            {ETA}
                                        </td>
                                        <td>
                                            <input
                                                name="ETD"
                                                value={ETD}
                                                type="text"
                                                onChange={(e) => onChangeInput(e, STT)}
                                                style={{ width: ETD === "" ? 5 + 'ch' : ETD.length + 'ch' }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                name="Remark"
                                                value={Remark}
                                                type="text"
                                                onChange={(e) => onChangeInput(e, STT)}
                                                style={{ width: Remark === "" ? 5 + 'ch' : Remark.length + 1 + 'ch' }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                name="Parking"
                                                value={Parking}
                                                type="text"
                                                onChange={(e) => onChangeInput(e, STT)}
                                                style={{ width: Parking === "" ? 5 + 'ch' : Parking.length + 2 + 'ch' }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                name="CRS1"
                                                value={CRS1}
                                                type="text"
                                                onChange={(e) => onChangeInput(e, STT)}
                                                style={{ width: CRS1 === "" ? 5 + 'ch' : CRS1.length + 2 + 'ch' }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                name="MECH1"
                                                value={MECH1}
                                                type="text"
                                                onChange={(e) => onChangeInput(e, STT)}
                                                style={{ width: MECH1 === "" ? 5 + 'ch' : MECH1.length + 2 + 'ch' }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                name="CRS2"
                                                value={CRS2}
                                                type="text"
                                                onChange={(e) => onChangeInput(e, STT)}
                                                style={{ width: CRS2 === "" ? 5 + 'ch' : CRS2.length + 2 + 'ch' }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                name="MECH2"
                                                value={MECH2}
                                                type="text"
                                                onChange={(e) => onChangeInput(e, STT)}
                                                style={{ width: MECH2 === "" ? 5 + 'ch' : MECH2.length + 2 + 'ch' }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <thead>
                                <tr>
                                    <th colSpan="15">WO/jobcard today</th>
                                </tr>
                                <tr>
                                    <th>STT</th>
                                    <th colSpan="2">ACReg</th>
                                    <th colSpan="2">W/O No</th>
                                    <th colSpan="5">Job description</th>
                                    <th>Remark</th>
                                    <th>CRS</th>
                                    <th>MECH1</th>
                                    <th>MECH2</th>
                                    <th>MECH3</th>
                                </tr>
                            </thead>
                            <tbody>
                                {WOPlan.map(({ STT, ACReg, WONo, Desc, Remark, CRS, MECH1, MECH2, MECH3 }) => (
                                    <tr key={STT}>
                                        <td>{STT}</td>
                                        <td colSpan="2">
                                            <input
                                                name="ACReg"
                                                value={ACReg}
                                                type="text"
                                                onChange={(e) => onChangeInputWO(e, STT)}
                                                style={{ width: ACReg === "" ? 5 + 'ch' : ACReg.length + 2 + 'ch' }}
                                            />
                                        </td>
                                        <td colSpan="2">
                                            <input
                                                name="WONo"
                                                value={WONo}
                                                type="text"
                                                onChange={(e) => onChangeInputWO(e, STT)}
                                                style={{ width: WONo === "" ? 5 + 'ch' : WONo.length + 2 + 'ch' }}
                                            />
                                        </td>
                                        <td colSpan="5">
                                            <input
                                                name="Desc"
                                                value={Desc}
                                                type="text"
                                                onChange={(e) => onChangeInputWO(e, STT)}
                                                style={{ width: Desc === "" ? 5 + 'ch' : Desc.length + 2 + 'ch' }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                name="Remark"
                                                value={Remark}
                                                type="text"
                                                onChange={(e) => onChangeInputWO(e, STT)}
                                                style={{ width: Remark === "" ? 5 + 'ch' : Remark.length + 2 + 'ch' }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                name="CRS"
                                                value={CRS}
                                                type="text"
                                                onChange={(e) => onChangeInputWO(e, STT)}
                                                style={{ width: CRS === "" ? 5 + 'ch' : CRS.length + 2 + 'ch' }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                name="MECH1"
                                                value={MECH1}
                                                type="text"
                                                onChange={(e) => onChangeInputWO(e, STT)}
                                                style={{ width: MECH1 === "" ? 5 + 'ch' : MECH1.length + 2 + 'ch' }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                name="MECH2"
                                                value={MECH2}
                                                type="text"
                                                onChange={(e) => onChangeInputWO(e, STT)}
                                                style={{ width: MECH2 === "" ? 5 + 'ch' : MECH2.length + 2 + 'ch' }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                name="MECH3"
                                                value={MECH3}
                                                type="text"
                                                onChange={(e) => onChangeInputWO(e, STT)}
                                                style={{ width: MECH3 === "" ? 5 + 'ch' : MECH3.length + 2 + 'ch' }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                    <th colSpan="15">
                                        <button className='btn btn-info'
                                            onClick={() => handleWOAddRow()}>Add row</button>
                                        <button className='btn btn-info'
                                            onClick={() => handleWODeleteRow()}>Delete row</button>
                                    </th>
                                </tr>
                            </tbody>
                        </table>
                        <table className='table-striped table-bordered' responsive>
                            <tbody>
                                <tr>
                                    <th rowSpan="2" colSpan="2">Ship leader</th>
                                    <td colSpan="4">
                                        <input
                                            name="leader"
                                            value={shipLeader[0].leader}
                                            type="text"
                                            onChange={(e) => {
                                                let leaderData = [...shipLeader];
                                                leaderData[0].leader = e.target.value;
                                                setShipLeader(leaderData);

                                            }}
                                            style={{ width: shipLeader[0].leader === "" ? 5 + 'ch' : shipLeader[0].leader.length + 1 + 'ch' }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            name="hours"
                                            value={shipLeader[0].hours}
                                            type="text"
                                            onChange={(e) => {
                                                let leaderData = [...shipLeader];
                                                leaderData[0].hours = e.target.value;
                                                setShipLeader(leaderData);
                                            }}
                                            style={{ width: shipLeader[0].hours === "" ? 5 + 'ch' : shipLeader[0].hours.length + 2 + 'ch' }}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="4">
                                        <input
                                            name="leader"
                                            value={shipLeader[1].leader}
                                            type="text"
                                            onChange={(e) => {
                                                let leaderData = [...shipLeader];
                                                leaderData[1].leader = e.target.value;
                                                setShipLeader(leaderData);

                                            }}
                                            style={{ width: shipLeader[1].leader === "" ? 5 + 'ch' : shipLeader[1].leader.length + 1 + 'ch' }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            name="hours"
                                            value={shipLeader[1].hours}
                                            type="text"
                                            onChange={(e) => {
                                                let leaderData = [...shipLeader];
                                                leaderData[1].hours = e.target.value;
                                                setShipLeader(leaderData);
                                            }}
                                            style={{ width: shipLeader[1].hours === "" ? 5 + 'ch' : shipLeader[1].hours.length + 2 + 'ch' }}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th colSpan="2">Start Ship</th>
                                    <td colSpan="5">
                                        <input
                                            name="startShip"
                                            value={handoverShip[0]}
                                            type="text"
                                            onChange={(e) => {
                                                let handoverData = [...handoverShip];
                                                handoverData[0] = e.target.value;
                                                setHandovership(handoverData);
                                            }}
                                            style={{ width: handoverShip[0] === "" ? 5 + 'ch' : handoverShip[0].length + 2 + 'ch' }}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th colSpan="2">End ship</th>
                                    <td colSpan="5">
                                        <input
                                            name="endShip"
                                            value={handoverShip[1]}
                                            type="text"
                                            onChange={(e) => {
                                                let handoverData = [...handoverShip];
                                                handoverData[1] = e.target.value;
                                                setHandovership(handoverData);
                                            }}
                                            style={{ width: handoverShip[1] === "" ? 5 + 'ch' : handoverShip[1].length + 2 + 'ch' }}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th rowSpan="2" colSpan="2">Driver</th>
                                    <td colSpan="3">
                                        <input
                                            name="driver1"
                                            value={driver[0].driver}
                                            type="text"
                                            onChange={(e) => {
                                                let driverData = [...driver];
                                                driverData[0].driver = e.target.value;
                                                setDriver(driverData);
                                            }}
                                            style={{ width: driver[0].driver === "" ? 5 + 'ch' : driver[0].driver.length + 2 + 'ch' }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            name="driver1Hours"
                                            value={driver[0].hours}
                                            type="text"
                                            onChange={(e) => {
                                                let driverData = [...driver];
                                                driverData[0].hours = e.target.value;
                                                setDriver(driverData);
                                            }}
                                            style={{ width: driver[0].hours === "" ? 5 + 'ch' : driver[0].hours.length + 2 + 'ch' }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            name="driver1Time"
                                            value={driver[0].time}
                                            type="text"
                                            onChange={(e) => {
                                                let driverData = [...driver];
                                                driverData[0].time = e.target.value;
                                                setDriver(driverData);
                                            }}
                                            style={{ width: driver[0].time === "" ? 5 + 'ch' : driver[0].time.length + 2 + 'ch' }}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="3">
                                        <input
                                            name="driver2"
                                            value={driver[1].driver}
                                            type="text"
                                            onChange={(e) => {
                                                let driverData = [...driver];
                                                driverData[1].driver = e.target.value;
                                                setDriver(driverData);
                                            }}
                                            style={{ width: driver[1].driver === "" ? 5 + 'ch' : driver[1].driver.length + 2 + 'ch' }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            name="driver2Hours"
                                            value={driver[1].hours}
                                            type="text"
                                            placeholder='Stanby'
                                            onChange={(e) => {
                                                let driverData = [...driver];
                                                driverData[1].hours = e.target.value;
                                                setDriver(driverData);
                                            }}
                                            style={{ width: driver[1].hours === "" ? 5 + 'ch' : driver[1].hours.length + 2 + 'ch' }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            name="driver2Time"
                                            value={driver[1].time}
                                            type="text"
                                            onChange={(e) => {
                                                let driverData = [...driver];
                                                driverData[1].time = e.target.value;
                                                setDriver(driverData);
                                            }}
                                            style={{ width: driver[1].time === "" ? 5 + 'ch' : driver[1].time.length + 2 + 'ch' }}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th colSpan="3">B 321 duty</th>
                                    <th colSpan="2">Func</th>
                                    <th colSpan="2">Time</th>
                                </tr>
                                {BDuty.map(({ STT, name, func, hours }) => (
                                    <tr key={STT}>
                                        <td colSpan="3">
                                            <input
                                                name="name"
                                                value={name}
                                                type="text"
                                                onChange={(e) => onChangeInputBDuty(e, STT)}
                                                style={{ width: name === "" ? 5 + 'ch' : name.length + 1 + 'ch' }}
                                            />
                                        </td>
                                        <td colSpan="2">
                                            <input
                                                name="func"
                                                value={func}
                                                type="text"
                                                onChange={(e) => onChangeInputBDuty(e, STT)}
                                                style={{ width: func === "" ? 5 + 'ch' : func.length + 1 + 'ch' }}
                                            />
                                        </td>
                                        <td colSpan="2">
                                            <input
                                                name="hours"
                                                value={hours}
                                                type="text"
                                                onChange={(e) => onChangeInputBDuty(e, STT)}
                                                style={{ width: hours === "" ? 5 + 'ch' : hours.length + 1 + 'ch' }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Work</th>
                                    <th>Point</th>
                                    <th>Hours</th>
                                    <th>Type</th>
                                    <th>From to</th>
                                </tr>
                                {powerSource.map(({ STT, ID, name, work, point, hours, type, fromTo }) => (
                                    <tr key={STT}>
                                        <td >
                                            <input
                                                name="ID"
                                                value={ID}
                                                type="text"
                                                onChange={(e) => onChangeInputPower(e, STT)}
                                                style={{ width: ID === "" ? 5 + 'ch' : ID.length + 2 + 'ch' }}
                                            />
                                        </td>
                                        <td >
                                            <input
                                                name="name"
                                                value={name}
                                                type="text"
                                                onChange={(e) => onChangeInputPower(e, STT)}
                                                style={{ width: name === "" ? 5 + 'ch' : name.length + 2 + 'ch' }}
                                            />
                                        </td>
                                        <td >{work}</td>
                                        <td >{point}</td>
                                        <td >
                                            <input
                                                name="hours"
                                                value={hours}
                                                type="text"
                                                onChange={(e) => onChangeInputPower(e, STT)}
                                                style={{ width: hours === "" ? 5 + 'ch' : hours.length + 2 + 'ch' }}
                                            />
                                        </td>
                                        <td>
                                            <select
                                                className='form-select'
                                                // style={{ width: '20%' }}
                                                name="type"
                                                onChange={(e) => onChangeInputPower(e, STT)}
                                            >
                                                <option selected value=""></option>
                                                <option value="TC">TC</option>
                                                <option value="NC">NC</option>
                                            </select>
                                        </td>
                                        <td >
                                            <input
                                                name="fromTo"
                                                value={fromTo}
                                                type="text"
                                                onChange={(e) => onChangeInputPower(e, STT)}
                                                style={{ width: fromTo === "" ? 5 + 'ch' : fromTo.length + 2 + 'ch' }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                    <th colSpan="7">
                                        <button className='btn btn-info'
                                            onClick={() => handlePowerAddRow()}>Add row</button>
                                        <button className='btn btn-info'
                                            onClick={() => handlePowerDeleteRow()}>Delete row</button>
                                    </th>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div >
    )
}


export default Home;

