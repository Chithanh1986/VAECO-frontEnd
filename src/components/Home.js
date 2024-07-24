import React, { useState } from 'react';
import './Home.scss';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { loadPlanApi, savePlanApi, loadTeamData, loadAllPC } from '../services/UserService';

const Home = () => {
    const [date, setDate] = useState(null);
    const [ship, setShip] = useState("MO");
    const [station, setStation] = useState("DAD");
    const [flightPlan, setFlightPlan] = useState(null);
    const [WOPlan, setWOPlan] = useState(null);
    const [rev, setRev] = useState(null);
    const [shipLeader, setShipLeader] = useState(null);
    const [handoverShip, setHandovership] = useState(null);
    const [driver, setDriver] = useState(null);
    const [BDuty, setBDuty] = useState(null);
    const [powerSource, setPowerSource] = useState(null);
    const [serverDate, setServerDate] = useState();
    const [serverShip, setServerShip] = useState();
    const [serverStation, setServerStation] = useState();
    const [team, setTeam] = useState();
    const [pointCode, setPointCode] = useState();

    const handleClear = () => {
        setDate(null);
        setFlightPlan(null);
        setRev(null);
    }

    const handleLoad = async () => {
        if (date) {
            let serverData = await loadPlanApi(new Date(date).toLocaleDateString('fr-FR'), ship, station);
            let serverPointCode = await loadAllPC();
            if (+serverData.EC === 0 && serverPointCode.EC === 0) {
                setServerDate(serverData.DT.datePlan);
                setServerShip(serverData.DT.ship);
                setServerStation(serverData.DT.station);
                setRev(serverData.DT.rev);
                setShipLeader(serverData.DT.shipLeader);
                setHandovership(serverData.DT.handoverShip);
                setDriver(serverData.DT.driver);
                setBDuty(serverData.DT.BDuty);
                setPowerSource(serverData.DT.powerSource);
                setWOPlan(serverData.DT.WOData);
                setFlightPlan(serverData.DT.planData);
                setPointCode(serverPointCode.DT);
                toast.success(serverData.EM)
            } else {
                toast.error(serverData.EM)
            }
        } else {
            toast.error('Pls select date')
        }
    }

    const handleSave = async () => {
        if (flightPlan) {
            let reqData = {
                date: serverDate,
                ship: serverShip,
                station: serverStation,
                planData: flightPlan,
                WOData: WOPlan,
                powerSource: powerSource,
                BDuty: BDuty,
                driver: driver,
                handoverShip: handoverShip,
                shipLeader: shipLeader,
                rev: new Date().toLocaleDateString('fr-FR') + " Time " + new Date().toLocaleTimeString('fr-FR')
            };
            let resData = await savePlanApi(reqData);
            if (resData.EC === 0) {
                toast.success(resData.EM)
            } else {
                toast.error(resData.EM)
            }
        } else {
            toast.error('Do not have flight plan')
        }
    }

    const onChangeInput = (e, STT) => {
        const { name, value } = e.target
        const editData = flightPlan.map((item) =>
            item.STT === STT && name ? { ...item, [name]: value.toUpperCase() } : item
        )
        setFlightPlan(editData)
    }

    const onChangeInputWO = (e, STT) => {
        const { name, value } = e.target
        const editWO = WOPlan.map((item) =>
            item.STT === STT && name ? { ...item, [name]: value.toUpperCase() } : item
        )
        setWOPlan(editWO)
    }

    const onChangeInputBDuty = (e, STT) => {
        const { name, value } = e.target
        const editBDuty = BDuty.map((item) =>
            item.STT === STT && name ? { ...item, [name]: value.toUpperCase() } : item
        )
        setBDuty(editBDuty)
    }

    const onChangeInputPower = (e, STT) => {
        const { name, value } = e.target
        const editPower = powerSource.map((item) =>
            item.STT === STT && name ? { ...item, [name]: value.toUpperCase() } : item
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

    const getLongTX = (ETA, ETD, maxTime) => {
        let startTime = 0;
        let endTime = 0;
        if (station === "DAD") {
            if (ship === "MO") {
                startTime = 240;
                endTime = 960;
            } else {
                startTime = 960;
                endTime = 1680;
            }
        } else {
            if (ship === "MO") {
                startTime = 420;
                endTime = 1140;
            } else {
                startTime = 1140;
                endTime = 1860;
            }
        }

        if (ETA >= startTime && ETD <= endTime && ETD - ETA > maxTime) {
            let longTXTime = ETD - ETA - maxTime;
            if (longTXTime >= 60) {
                return 0.5;
            } else {
                return longTXTime / 120;
            }
        } else {
            return 0;
        }
    }

    const calculateFlightPoint = (AL, ACType, ETA, ETD, Remark) => {
        let CRSWHour = 0;
        let MECHWHour = 0;
        let CRSWPoint = 0;
        let MECHWPoint = 0;
        let longTX = 0;
        if (ETA.includes("+")) { //convert ETA to minute
            ETA = ETA.split("+")[0];
            ETA = ETA.split(":");
            ETA = (+ETA[0] + 24) * 60 + (+ETA[1]);
        } else {
            ETA = ETA.split(":");
            ETA = +ETA[0] * 60 + (+ETA[1]);
        }

        if (ETD.includes("+")) { //convert ETD to minute
            ETD = ETD.split("+")[0];
            ETD = ETD.split(":");
            ETD = (+ETD[0] + 24) * 60 + (+ETD[1]);
        } else {
            ETD = ETD.split(":");
            ETD = +ETD[0] * 60 + (+ETD[1]);
        }

        let searchAL = pointCode.filter((obj) => obj.code === AL);
        if (searchAL.length > 0) {
            let searchACType = searchAL.filter((obj) => ACType.includes(obj.ACType));
            if (searchACType.length > 0) {
                let searchRemark = {
                    CRSWHour: 0,
                    MECHWHour: 0,
                    CRSWPoint: 0,
                    MECHWPoint: 0,
                };
                if (Remark.includes("TERM") && Remark.includes("PRE")) { //chuyen term + pre
                    if (ETD - ETA > 120) {
                        let searchTerm = searchACType.find((obj) => obj.type === "TERM");
                        let searchPre = searchACType.find((obj) => obj.type === "PRE");
                        searchRemark.CRSWHour = (+searchPre.CRSWHour) + (+searchTerm.CRSWHour);
                        searchRemark.MECHWHour = (+searchPre.MECHWHour) + (+searchTerm.MECHWHour);
                        searchRemark.CRSWPoint = (+searchPre.CRSWPoint) + (+searchTerm.CRSWPoint);
                        searchRemark.MECHWPoint = (+searchPre.MECHWPoint) + (+searchTerm.MECHWPoint);
                    } else {
                        searchRemark = searchACType.find((obj) => obj.type === "TERM-PRE");
                    }
                } else { //khong phai term + pre
                    if (!Remark.includes("TERM") && !Remark.includes("PRE")) { // chuyen transit
                        if (AL === "VN") {
                            searchRemark = searchACType.find((obj) => obj.type === "TRANSIT");
                        } else {

                            if (Remark.includes("RELEASE")) {
                                searchRemark = searchACType.find((obj) => obj.type === "TRANSIT" && obj.remark.includes("RELEASE"));
                            } else {
                                searchRemark = searchACType.find((obj) => obj.type === "TRANSIT" && !obj.remark.includes("RELEASE"));
                            }
                        }
                        longTX = getLongTX(ETA, ETD, searchRemark.maxTime);
                    }
                    if (Remark.includes("TERM")) { //chuyen term
                        searchRemark = searchACType.find((obj) => obj.type === "TERM");
                    }
                    if (Remark.includes("PRE")) { //chuyen pre
                        searchRemark = searchACType.find((obj) => obj.type === "PRE");
                    }
                }
                if (searchRemark !== undefined) {
                    CRSWHour = parseFloat(searchRemark.CRSWHour, 10);
                    MECHWHour = parseFloat(searchRemark.MECHWHour, 10);
                    CRSWPoint = parseFloat(searchRemark.CRSWPoint, 10);
                    MECHWPoint = parseFloat(searchRemark.MECHWPoint, 10);
                } else {
                    toast.error("Point code not found")
                }

            } else {
                toast.error("ACType: " + ACType + " not found")
            }
        } else {
            toast.error("A/L: " + AL + " not found")
        }
        return ({ CRSWHour, MECHWHour, CRSWPoint, MECHWPoint, longTX });
    };

    const calculateWOPoint = () => {

    };

    const updateInput = () => {
        let updateData = powerSource;
        updateData.map((individual, index) => {
            individual.work = 0;
            individual.WPoint = 0;
            individual.WHour = 0;

            flightPlan.find((obj, i) => {
                if (obj.CRS1.trim() === individual.name.trim() && obj.CRS1.trim() !== "") {
                    individual.work++;
                    let point = calculateFlightPoint(obj.AL, obj.ACType, obj.ETA, obj.ETD, obj.Remark);
                    if (obj.CRS2.trim() !== "") {
                        point.CRSWPoint = point.CRSWPoint / 2;
                        point.CRSWHour = point.CRSWHour / 2;
                    }
                    if (obj.MECH1.trim() === "" && obj.MECH2.trim() === "") {
                        individual.WPoint = individual.WPoint + point.CRSWPoint + point.MECHWPoint;
                        individual.WHour = individual.WHour + point.CRSWHour + point.MECHWHour;

                    } else {
                        individual.WPoint = individual.WPoint + point.CRSWPoint;
                        individual.WHour = individual.WHour + point.CRSWHour;
                    }
                    individual.WPoint = individual.WPoint + point.longTX;
                }
                if (obj.MECH1.trim() === individual.name.trim() && obj.MECH1.trim() !== "") {
                    individual.work++;
                    let point = calculateFlightPoint(obj.AL, obj.ACType, obj.ETA, obj.ETD, obj.Remark);
                    if (obj.MECH2.trim() === "" && obj.CRS2.trim() === "") {
                        individual.WPoint = individual.WPoint + point.MECHWPoint + point.longTX;
                        individual.WHour = individual.WHour + point.MECHWHour;
                    } else {
                        individual.WPoint = individual.WPoint + point.MECHWPoint / 2 + point.longTX;
                        individual.WHour = individual.WHour + point.MECHWHour / 2;
                    }
                }
                if (obj.CRS2.trim() === individual.name.trim() && obj.CRS2.trim() !== "") {
                    individual.work++;
                    let point = calculateFlightPoint(obj.AL, obj.ACType, obj.ETA, obj.ETD, obj.Remark);
                    point.CRSWPoint = point.CRSWPoint / 2;
                    point.MECHWPoint = point.MECHWPoint / 2;
                    point.CRSWHour = point.CRSWHour / 2;
                    point.MECHWHour = point.MECHWHour / 2;
                    if (obj.MECH2.trim() !== "") {
                        individual.WPoint = individual.WPoint + point.CRSWPoint;
                        individual.WHour = individual.WHour + point.CRSWHour;
                    } else {
                        individual.WPoint = individual.WPoint + point.CRSWPoint + point.MECHWPoint;
                        individual.WHour = individual.WHour + point.CRSWHour + point.MECHWHour;
                    }
                }
                if (obj.MECH2.trim() === individual.name.trim() && obj.MECH2.trim() !== "") {
                    individual.work++;
                    let point = calculateFlightPoint(obj.AL, obj.ACType, obj.ETA, obj.ETD, obj.Remark);
                    if (obj.MECH1.trim() === "") {
                        individual.WPoint = individual.WPoint + point.MECHWPoint;
                        individual.WHour = individual.WHour + point.MECHWHour;
                    } else {
                        individual.WPoint = individual.WPoint + point.MECHWPoint / 2;
                        individual.WHour = individual.WHour + point.MECHWHour / 2;
                    }
                }
            })

            // WOPlan.find((obj, i) => {
            //     if (obj.CRS === individual.name && obj.CRS !== "") {
            //         individual.work++;
            //         let point = calculateWOPoint();
            //         if (obj.MECH1 === "" && obj.MECH2 === "") {
            //             individual.point = point.CRS + point.MECH;
            //         } else {
            //             individual.point = point.CRS;
            //         }
            //     }
            //     if (obj.MECH1 === individual.name && obj.MECH1 !== "") {
            //         individual.work++;
            //         let point = calculateFlightPoint(obj.AL, obj.ACType, obj.ETA, obj.ETD, obj.Remark);
            //         if (obj.MECH2 === "") {
            //             individual.point = point.MECH;
            //         } else {
            //             individual.point = point.MECH / 2;
            //         }
            //     }
            //     if (obj.CRS2 === individual.name && obj.CRS2 !== "") {
            //         individual.work++;
            //         let point = calculateFlightPoint(obj.AL, obj.ACType, obj.ETA, obj.ETD, obj.Remark);
            //     }
            //     if (obj.MECH2 === individual.name && obj.MECH2 !== "") {
            //         individual.work++;
            //         let point = calculateFlightPoint(obj.AL, obj.ACType, obj.ETA, obj.ETD, obj.Remark);
            //         if (obj.MECH1 === "") {
            //             individual.point = point.MECH;
            //         } else {
            //             individual.point = point.MECH / 2;
            //         }
            //     }
            // })

            updateData[index].work = individual.work;
            updateData[index].WPoint = individual.WPoint.toFixed(2);
            updateData[index].WHour = individual.WHour.toFixed(0);
        })
        setPowerSource(null);
        setTimeout(() => setPowerSource(updateData), 1);
    };

    const handleLoadTeam = async (team, serverStation) => {
        let data = await loadTeamData(team, serverStation);
        let dataToPowerSource = powerSource.slice(0, data.DT.length);
        data.DT.map((individual, index) => {
            dataToPowerSource[index].STT = index + 1;
            dataToPowerSource[index].ID = individual.vae_id;
            dataToPowerSource[index].name = individual.name.toUpperCase();
            dataToPowerSource[index].work = 0;
            dataToPowerSource[index].point = 0;
            dataToPowerSource[index].hours = "";
            dataToPowerSource[index].type = "";
            dataToPowerSource[index].fromTo = ""
        });
        setPowerSource(dataToPowerSource);
        updateInput();
    }

    return (
        <div>
            <div className='container'>
                <div className='flight-container'>
                    <label>Choose station :</label>
                    <select
                        className='form-select'
                        style={{ width: '10%' }}
                        onChange={(event) => setStation(event.target.value)}
                    >
                        <option selected value="DAD">DAD</option>
                        <option value="CXR">CXR</option>
                    </select>
                    <label >   Choose date :</label>
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
                        style={{ width: '10%' }}
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
                    <div className='subPlan-container'>
                        <h3>Station: {serverStation}, Date: {serverDate}, Rev: {rev}</h3>
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
                                                onBlur={() => { updateInput() }}
                                                style={{ width: CRS1 === "" ? 5 + 'ch' : CRS1.length + 2 + 'ch' }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                name="MECH1"
                                                value={MECH1}
                                                type="text"
                                                onChange={(e) => onChangeInput(e, STT)}
                                                onBlur={() => { updateInput() }}
                                                style={{ width: MECH1 === "" ? 5 + 'ch' : MECH1.length + 2 + 'ch' }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                name="CRS2"
                                                value={CRS2}
                                                type="text"
                                                onChange={(e) => onChangeInput(e, STT)}
                                                onBlur={() => { updateInput() }}
                                                style={{ width: CRS2 === "" ? 5 + 'ch' : CRS2.length + 2 + 'ch' }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                name="MECH2"
                                                value={MECH2}
                                                type="text"
                                                onChange={(e) => onChangeInput(e, STT)}
                                                onBlur={() => { updateInput() }}
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
                                                onBlur={() => { updateInput() }}
                                                style={{ width: CRS === "" ? 5 + 'ch' : CRS.length + 2 + 'ch' }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                name="MECH1"
                                                value={MECH1}
                                                type="text"
                                                onChange={(e) => onChangeInputWO(e, STT)}
                                                onBlur={() => { updateInput() }}
                                                style={{ width: MECH1 === "" ? 5 + 'ch' : MECH1.length + 2 + 'ch' }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                name="MECH2"
                                                value={MECH2}
                                                type="text"
                                                onChange={(e) => onChangeInputWO(e, STT)}
                                                onBlur={() => { updateInput() }}
                                                style={{ width: MECH2 === "" ? 5 + 'ch' : MECH2.length + 2 + 'ch' }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                name="MECH3"
                                                value={MECH3}
                                                type="text"
                                                onChange={(e) => onChangeInputWO(e, STT)}
                                                onBlur={() => { updateInput() }}
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
                                    <td colSpan="3">
                                        <input
                                            name="leader"
                                            value={shipLeader[0].leader}
                                            type="text"
                                            onChange={(e) => {
                                                let leaderData = [...shipLeader];
                                                leaderData[0].leader = e.target.value.toUpperCase();
                                                setShipLeader(leaderData);

                                            }}
                                            style={{ width: shipLeader[0].leader === "" ? 5 + 'ch' : shipLeader[0].leader.length + 2 + 'ch' }}
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
                                    <td>
                                        <input
                                            name="fromTo"
                                            value={shipLeader[0].fromTo}
                                            type="text"
                                            onChange={(e) => {
                                                let leaderData = [...shipLeader];
                                                leaderData[0].fromTo = e.target.value;
                                                setShipLeader(leaderData);
                                            }}
                                            style={{ width: shipLeader[0].fromTo === "" ? 5 + 'ch' : shipLeader[0].fromTo.length + 2 + 'ch' }}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="3">
                                        <input
                                            name="leader"
                                            value={shipLeader[1].leader}
                                            type="text"
                                            onChange={(e) => {
                                                let leaderData = [...shipLeader];
                                                leaderData[1].leader = e.target.value.toUpperCase();
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
                                    <td>
                                        <input
                                            name="fromTo"
                                            value={shipLeader[1].fromTo}
                                            type="text"
                                            onChange={(e) => {
                                                let leaderData = [...shipLeader];
                                                leaderData[1].fromTo = e.target.value;
                                                setShipLeader(leaderData);
                                            }}
                                            style={{ width: shipLeader[1].fromTo === "" ? 5 + 'ch' : shipLeader[1].fromTo.length + 2 + 'ch' }}
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
                                                handoverData[0] = e.target.value.toUpperCase();
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
                                                handoverData[1] = e.target.value.toUpperCase();
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
                                                driverData[0].driver = e.target.value.toUpperCase();
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
                                            value={driver[0].fromTo}
                                            type="text"
                                            onChange={(e) => {
                                                let driverData = [...driver];
                                                driverData[0].fromTo = e.target.value;
                                                setDriver(driverData);
                                            }}
                                            style={{ width: driver[0].fromTo === "" ? 5 + 'ch' : driver[0].fromTo.length + 2 + 'ch' }}
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
                                                driverData[1].driver = e.target.value.toUpperCase();
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
                                            value={driver[1].fromTo}
                                            type="text"
                                            onChange={(e) => {
                                                let driverData = [...driver];
                                                driverData[1].fromTo = e.target.value;
                                                setDriver(driverData);
                                            }}
                                            style={{ width: driver[1].fromTo === "" ? 5 + 'ch' : driver[1].fromTo.length + 2 + 'ch' }}
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
                                    <th>WPoint</th>
                                    <th>WHour</th>
                                    <th>Hours</th>
                                    <th>Type</th>
                                    <th>From to</th>
                                </tr>
                                {powerSource.map(({ STT, ID, name, work, WPoint, WHour, hours, type, fromTo }) => (
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
                                        <td >{WPoint}</td>
                                        <td >{WHour}</td>
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
                                <tr>
                                    <th colSpan="7">
                                        <div className='power-container'>
                                            <label>Select team:</label>
                                            <select
                                                className='form-select'
                                                name="type"
                                                style={{ width: '30%' }}
                                                onChange={(event) => setTeam(event.target.value)}
                                            >
                                                <option selected value=""></option>
                                                <option value="Team 1">Team 1</option>
                                                <option value="Team 2">Team 2</option>
                                                <option value="Team 3">Team 3</option>
                                                <option value="Team 4">Team 4</option>
                                            </select>
                                            <button className='btn btn-info'
                                                onClick={() => handleLoadTeam(team, serverStation)}>Load</button>
                                        </div>
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

