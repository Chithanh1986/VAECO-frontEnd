import React, { useState, useContext, useRef } from 'react';
import './Home.scss';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { loadPlanApi, savePlanApi, loadTeamData, loadAllPC } from '../services/UserService';
import { UserContext } from '../context/UserContext';

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
    const { user } = useContext(UserContext);

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
                if (serverData.DT.planData[0].Route !== undefined) {
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
                    toast.error("Flight plan is not found")
                }
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
        setPowerSource(null);
        addRow.push({
            STT: No,
            ID: "",
            name: "",
            work: 0,
            WPoint: 0,
            hours: "",
            type: "",
            fromTo: "",
            remark: ""
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
                if (Remark.includes("CCCT") || Remark.includes("CCDB")) { //chuyen co
                    if (Remark.includes("CCCT")) {
                        searchRemark = searchACType.find((obj) => obj.type === "CCCT");
                    }
                    if (Remark.includes("CCDB")) {
                        searchRemark = searchACType.find((obj) => obj.type === "CCDB");
                    }
                } else { //khong phai chuyen co
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

    const calculateWOPoint = (code, WHour) => {
        let CRSWHour = 0;
        let MECHWHour = 0;
        let CRSWPoint = 0;
        let MECHWPoint = 0;
        if (code.includes("NRC")) {
            if (+WHour === NaN || +WHour === 0) {
                toast.error("WHour invalid")
            } else {
                switch (code.trim()) {
                    case "NRCB":
                        CRSWPoint = +WHour / 60 * 2;
                        MECHWPoint = +WHour / 60;
                        CRSWHour = +WHour;
                        MECHWHour = +WHour;
                        break;
                    case "NRCA":
                        CRSWPoint = +WHour / 60 * 1.5;
                        MECHWPoint = +WHour / 60;
                        CRSWHour = +WHour;
                        MECHWHour = +WHour;
                        break;
                    case "NRCM":
                        CRSWPoint = 0;
                        MECHWPoint = +WHour / 60;
                        CRSWHour = 0;
                        MECHWHour = +WHour;
                        break;
                    default:
                        toast.error("WO code: " + code + " not found")
                }
            }
        } else {
            let searchWO = pointCode.filter((obj) => obj.type === "WO");
            let searchCode = searchWO.find((obj) => obj.code === code.trim());
            if (searchCode === undefined) {
                toast.error("WO code :" + code + " not found")
            } else {
                CRSWHour = +searchCode.CRSWHour;
                MECHWHour = +searchCode.MECHWHour;
                CRSWPoint = +searchCode.CRSWPoint;
                MECHWPoint = +searchCode.MECHWPoint;
            }
        }
        return ({ CRSWHour, MECHWHour, CRSWPoint, MECHWPoint });
    };

    const updateInput = () => {
        let updateData = powerSource;
        let pointLeaderError = 0;
        let pointStartShipError = 0;
        let pointDriverError = 0;
        let pointBDutyError = 0;
        updateData.map((individual, index) => {
            individual.work = 0;
            individual.WPoint = 0;
            individual.WHour = 0;

            if (individual.name.trim() !== "") {
                //search flight plan
                flightPlan.find((obj, i) => {
                    if (obj.CRS1.trim() === individual.name.trim()) {
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
                    if (obj.MECH1.trim() === individual.name.trim()) {
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
                    if (obj.CRS2.trim() === individual.name.trim()) {
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
                    if (obj.MECH2.trim() === individual.name.trim()) {
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

                //search WO plan
                WOPlan.find((obj, i) => {
                    if (obj.CRS.trim() === individual.name.trim()) {
                        individual.work++;
                        let point = calculateWOPoint(obj.code, obj.WHour);
                        individual.WPoint = individual.WPoint + point.CRSWPoint;
                        individual.WHour = individual.WHour + point.CRSWHour;
                    }
                    if (obj.MECH1.trim() === individual.name.trim() || obj.MECH2.trim() === individual.name.trim() || obj.MECH3.trim() === individual.name.trim()) {
                        individual.work++;
                        let point = calculateWOPoint(obj.code, obj.WHour);
                        individual.WPoint = individual.WPoint + point.MECHWPoint;
                        individual.WHour = individual.WHour + point.MECHWHour;
                    }
                })

                //search leader
                if (shipLeader[0].leader.trim() !== "" || shipLeader[1].leader.trim() !== "") {
                    let pointLeader = pointCode.find((obj) => obj.airline === station && obj.type === "IDR" && obj.code === "SL");
                    if (pointLeader === undefined) {
                        pointLeaderError = 1;
                    } else {
                        if (individual.name.trim() === shipLeader[0].leader.trim()) {
                            individual.WPoint = (+individual.WPoint) + (+pointLeader.CRSWPoint) / 12 * (+shipLeader[0].hours);
                            individual.WHour = (+individual.WHour) + (+pointLeader.CRSWHour) / 12 * (+shipLeader[0].hours);
                        }
                        if (individual.name.trim() === shipLeader[1].leader.trim()) {
                            individual.WPoint = (+individual.WPoint) + (+pointLeader.CRSWPoint) / 12 * (+shipLeader[1].hours);
                            individual.WHour = (+individual.WHour) + (+pointLeader.CRSWHour) / 12 * (+shipLeader[1].hours);
                        }
                    }
                }

                //search work assign
                let pointWorkAssign = pointCode.find((obj) => obj.airline === station && obj.type === "IDR" && obj.code === "PCT");
                if (pointWorkAssign !== undefined) {
                    if (individual.name.trim() === handoverShip[0].trim()) {
                        individual.WPoint = (+individual.WPoint) + (+pointWorkAssign.CRSWPoint);
                    }
                }

                //search WO evaluate
                let pointWOEval = pointCode.find((obj) => obj.airline === station && obj.type === "IDR" && obj.code === "WOE");
                if (pointWOEval !== undefined) {
                    if (individual.name.trim() === handoverShip[1].trim()) {
                        individual.WPoint = (+individual.WPoint) + (+pointWOEval.CRSWPoint);
                        individual.WHour = (+individual.WHour) + (+pointWOEval.CRSWHour);
                    }
                }

                //search handover ship
                if (handoverShip[2].trim() !== "" || handoverShip[3].trim() !== "") {
                    let pointStartShip = pointCode.find((obj) => obj.airline === station && obj.type === "IDR" && obj.code === "HOS");
                    if (pointStartShip === undefined) {
                        pointStartShipError = 1;
                    } else {
                        if (individual.name.trim() === handoverShip[2].trim()) {
                            individual.WPoint = (+individual.WPoint) + (+pointStartShip.CRSWPoint);
                            individual.WHour = (+individual.WHour) + (+pointStartShip.CRSWHour);
                        }
                        if (individual.name.trim() === handoverShip[3].trim()) {
                            individual.WPoint = (+individual.WPoint) + (+pointStartShip.CRSWPoint);
                            individual.WHour = (+individual.WHour) + (+pointStartShip.CRSWHour);
                        }
                    }
                }

                //search driver
                if (driver[0].driver.trim() !== "" || driver[1].driver.trim() !== "") {
                    let pointDriver = pointCode.find((obj) => obj.airline === station && obj.type === "IDR" && obj.code === "DRI");
                    if (pointDriver === undefined) {
                        pointDriverError = 1;
                    } else {
                        if (individual.name.trim() === driver[0].driver.trim()) {
                            individual.WPoint = (+individual.WPoint) + (+pointDriver.CRSWPoint) / 12 * (+driver[0].hours);
                            individual.WHour = (+individual.WHour) + (+pointDriver.CRSWHour) / 12 * (+driver[0].hours);
                        }
                        if (individual.name.trim() === driver[1].driver.trim()) {
                            individual.WPoint = (+individual.WPoint) + (+pointDriver.CRSWPoint) / 12 * (+driver[1].hours);
                            individual.WHour = (+individual.WHour) + (+pointDriver.CRSWHour) / 12 * (+driver[1].hours);
                        }
                    }
                }

                //search B duty
                let checkBDuty = false;
                BDuty.map((individual, index) => {
                    if (individual.name.trim() !== "") { checkBDuty = true }
                })
                if (checkBDuty) {
                    let pointBDuty = pointCode.find((obj) => obj.airline === station && obj.type === "IDR" && obj.code === "BDT");
                    let pointBSTB = pointCode.find((obj) => obj.airline === station && obj.type === "IDR" && obj.code === "BSTB");
                    if (pointBDuty === undefined || pointBSTB === undefined) {
                        pointBDutyError = 1;
                    } else {
                        let totalHours = 0;
                        BDuty.map((obj, index) => { totalHours = totalHours + (+obj.hours) });
                        BDuty.map((obj, index) => {
                            if (individual.name.trim() === obj.name.trim()) {
                                if (obj.type === "STBY") {
                                    individual.WPoint = (+individual.WPoint) + (+pointBSTB.CRSWPoint) / 12 * (+obj.hours);
                                } else {
                                    if (totalHours >= 24) {
                                        individual.WPoint = (+individual.WPoint) + (+pointBDuty.CRSWPoint) / totalHours * (+obj.hours);
                                        individual.WHour = (+individual.WHour) + (+pointBDuty.CRSWHour) / totalHours * (+obj.hours);
                                    }
                                    else {
                                        individual.WPoint = (+individual.WPoint) + (+pointBDuty.CRSWPoint) / 24 * (+obj.hours);
                                        individual.WHour = (+individual.WHour) + (+pointBDuty.CRSWHour) / 24 * (+obj.hours);
                                    }
                                }
                            }
                        })
                    }
                }

            }

            switch (individual.type) {
                case "NC":
                    individual.WPoint = individual.WPoint * 2;
                    break;
                case "TC":
                    individual.WPoint = individual.WPoint * 1.2;
                    break;
                // case "-":
                //     individual.WPoint = individual.WPoint * 3;
                //     break;
                default:
                    break;
            }
            updateData[index].work = individual.work;
            updateData[index].WPoint = individual.WPoint.toFixed(2);
            updateData[index].WHour = individual.WHour.toFixed(0);
        })
        if (pointLeaderError === 1) { toast.error("Point code SL not found") };
        if (pointStartShipError === 1) { toast.error("Point code HOS not found") };
        if (pointDriverError === 1) { toast.error("Point code DRI not found") };
        if (pointBDutyError === 1) { toast.error("Point code BDT not found") };
        setPowerSource(null);
        setTimeout(() => setPowerSource(updateData), 1);
    };

    const handleLoadTeam = async (team, serverStation) => {
        let data = await loadTeamData(team, serverStation);
        if (data.DT.length > 1) {
            let dataToPowerSource = [];
            data.DT.map((individual, index) => {
                dataToPowerSource.push({
                    STT: index + 1,
                    ID: individual.vae_id,
                    name: individual.name.toUpperCase(),
                    work: 0,
                    WPoint: 0,
                    hours: "",
                    type: "",
                    fromTo: "",
                    remark: ""
                })
            });
            console.log(dataToPowerSource)
            setPowerSource(dataToPowerSource);
        } else {
            toast.error("No data found")
        }

    }

    const handleExport = () => {
        if (flightPlan && WOPlan && powerSource) {
            let exportWOData = [];
            let exportHeader = [["Station: " + serverStation + " - Date: " + serverDate + " - Rev: " + rev]]
            /* generate worksheet and workbook */
            const worksheet = XLSX.utils.aoa_to_sheet(exportHeader);
            XLSX.utils.sheet_add_json(worksheet, flightPlan, { origin: { r: 1, c: 0 } });
            // Add WOPlan
            WOPlan.map((individual, index) => {
                exportWOData[index] = {
                    STT: individual.STT, code: individual.code, ACReg: individual.ACReg, WONo: individual.WONo, WOMerge: "",
                    Desc: individual.Desc, DescMerge1: "", DescMerge2: "", DescMerge3: "", DescMerge4: "", WHour: individual.WHour,
                    CRS: individual.CRS, MECH1: individual.MECH1, MECH2: individual.MECH2, MECH3: individual.MECH3
                }
            })
            XLSX.utils.sheet_add_json(worksheet, exportWOData, { origin: { r: flightPlan.length + 1, c: 0 } });
            let merge = [
                { s: { r: flightPlan.length + 1, c: 3 }, e: { r: flightPlan.length + 1, c: 4 } },
                { s: { r: flightPlan.length + 1, c: 5 }, e: { r: flightPlan.length + 1, c: 9 } }
            ];
            exportWOData.map((individual, index) => {
                merge.push(
                    { s: { r: flightPlan.length + 2 + index, c: 3 }, e: { r: flightPlan.length + 2 + index, c: 4 } },
                    { s: { r: flightPlan.length + 2 + index, c: 5 }, e: { r: flightPlan.length + 2 + index, c: 9 } }
                )
            })
            //Add powerSource
            let exportPower = [
                ["Ship leader", "", shipLeader[0].leader, "", "", shipLeader[0].hours, shipLeader[0].fromTo, ""],
                ["", "", shipLeader[1].leader, "", "", shipLeader[1].hours, shipLeader[1].fromTo, ""],
                ["Work assign", "", handoverShip[0], "", "WO Evaluation", "", handoverShip[1], ""],
                ["Start ship", "", handoverShip[2], "", "End ship", "", handoverShip[3], ""],
                ["Driver", "", driver[0].driver, "", "", driver[0].hours, driver[0].fromTo, ""],
                ["", "", driver[1].driver, "", "", driver[1].hours, driver[1].fromTo, ""],
                ["", "", driver[2].driver, "", "", "stby", "", ""],
                ["B 321 duty", "", "", "", "Func", "", "Hours", ""]
            ];
            BDuty.map((individual, index) => {
                exportPower.push([individual.name, "", "", "", individual.func, "", individual.hours, ""])
            })
            exportPower.push(["ID", "Name", "Work", "WPoint", "Hours", "Type", "From to", "Remark"])
            powerSource.map((individual, index) => {
                exportPower.push([
                    individual.ID, individual.name, individual.work, individual.WPoint, individual.hours,
                    individual.type, individual.fromTo, individual.remark
                ])
            })
            XLSX.utils.sheet_add_aoa(worksheet, exportPower, { origin: { r: 0, c: 15 } });
            merge.push(
                { s: { r: 0, c: 15 }, e: { r: 1, c: 16 } },
                { s: { r: 0, c: 17 }, e: { r: 0, c: 19 } }, { s: { r: 0, c: 21 }, e: { r: 0, c: 22 } },
                { s: { r: 1, c: 17 }, e: { r: 1, c: 19 } }, { s: { r: 1, c: 21 }, e: { r: 1, c: 22 } },
                { s: { r: 2, c: 15 }, e: { r: 2, c: 16 } }, { s: { r: 2, c: 17 }, e: { r: 2, c: 18 } },
                { s: { r: 2, c: 19 }, e: { r: 2, c: 20 } }, { s: { r: 2, c: 21 }, e: { r: 2, c: 22 } },
                { s: { r: 3, c: 15 }, e: { r: 3, c: 16 } }, { s: { r: 3, c: 17 }, e: { r: 3, c: 18 } },
                { s: { r: 3, c: 19 }, e: { r: 3, c: 20 } }, { s: { r: 3, c: 21 }, e: { r: 3, c: 22 } },
                { s: { r: 4, c: 15 }, e: { r: 6, c: 16 } },
                { s: { r: 4, c: 17 }, e: { r: 4, c: 19 } }, { s: { r: 4, c: 21 }, e: { r: 4, c: 22 } },
                { s: { r: 5, c: 17 }, e: { r: 5, c: 19 } }, { s: { r: 5, c: 21 }, e: { r: 5, c: 22 } },
                { s: { r: 6, c: 17 }, e: { r: 6, c: 19 } }, { s: { r: 6, c: 21 }, e: { r: 6, c: 22 } },
                { s: { r: 7, c: 15 }, e: { r: 7, c: 18 } }, { s: { r: 7, c: 19 }, e: { r: 7, c: 20 } }, { s: { r: 7, c: 21 }, e: { r: 7, c: 22 } },

            )
            BDuty.map((individual, index) => {
                merge.push({ s: { r: 8 + index, c: 15 }, e: { r: 8 + index, c: 18 } },
                    { s: { r: 8 + index, c: 19 }, e: { r: 8 + index, c: 20 } },
                    { s: { r: 8 + index, c: 21 }, e: { r: 8 + index, c: 22 } },)
            })
            worksheet["!merges"] = merge;
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Dates");

            /* create an XLSX file and try to save to Presidents.xlsx */
            XLSX.writeFile(workbook, "flightPlan.xlsx");
        } else {
            toast.error("Missing data")
        }

    }

    return (
        <div>
            <div className='container'>
                {/* header */}
                <div className='flight-container'>
                    <label>Choose station :</label>
                    <select
                        className='form-select'
                        style={{ width: '10%' }}
                        onChange={(event) => setStation(event.target.value)}
                    >
                        <option selected value="DAD">DAD</option>
                        <option value="CXR">CXR</option>
                        <option value="VDH">VDH</option>
                        <option value="HUI">HUI</option>
                        <option value="VCL">VCL</option>
                        <option value="UIH">UIH</option>
                        <option value="TBB">TBB</option>
                        <option value="PXU">PXU</option>
                    </select>
                    <label >   Choose date :</label>
                    <DatePicker
                        selected={date}
                        onChange={date => setDate(date)}
                        minDate={user.account.group === "admin" ? "" : new Date().setDate(new Date().getDate() - 1)}
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

                    <button className="btn info"
                        onClick={() => handleExport()}>Export</button>

                </div >
            </div>

            <div className='plan-container'>
                {(flightPlan && WOPlan && powerSource) && (
                    <div className='subPlan-container'>
                        <h3>Station: {serverStation}, Date: {serverDate}, Rev: {rev}</h3>
                        <table className='table-bordered' responsive>
                            {/* Flight plan */}
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
                                            <input
                                                name="ETA"
                                                value={ETA}
                                                type="text"
                                                onChange={(e) => onChangeInput(e, STT)}
                                                onBlur={() => { updateInput() }}
                                                style={{ width: ETA === "" ? 5 + 'ch' : ETA.length + 'ch' }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                name="ETD"
                                                value={ETD}
                                                type="text"
                                                onChange={(e) => onChangeInput(e, STT)}
                                                onBlur={() => { updateInput() }}
                                                style={{ width: ETD === "" ? 5 + 'ch' : ETD.length + 'ch' }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                name="Remark"
                                                value={Remark}
                                                type="text"
                                                onChange={(e) => onChangeInput(e, STT)}
                                                onBlur={() => { updateInput() }}
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

                            {/* WO  */}
                            <thead>
                                <tr>
                                    <th colSpan="15">WO/jobcard today</th>
                                </tr>
                                <tr>
                                    <th>STT</th>
                                    <th>Code</th>
                                    <th>ACReg</th>
                                    <th colSpan="2">W/O No</th>
                                    <th colSpan="5">Job description</th>
                                    <th>WHour</th>
                                    <th>CRS</th>
                                    <th>MECH1</th>
                                    <th>MECH2</th>
                                    <th>MECH3</th>
                                </tr>
                            </thead>
                            <tbody>
                                {WOPlan.map(({ STT, code, ACReg, WONo, Desc, WHour, CRS, MECH1, MECH2, MECH3 }) => (
                                    <tr key={STT}>
                                        <td>{STT}</td>
                                        <td >
                                            <input
                                                name="code"
                                                value={code}
                                                onBlur={() => { updateInput() }}
                                                type="text"
                                                onChange={(e) => onChangeInputWO(e, STT)}
                                                style={{ width: code === "" ? 5 + 'ch' : code.length + 2 + 'ch' }}
                                            />
                                        </td>
                                        <td>
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
                                                name="WHour"
                                                value={WHour}
                                                onBlur={() => { updateInput() }}
                                                type="text"
                                                onChange={(e) => onChangeInputWO(e, STT)}
                                                style={{ width: WHour === "" ? 5 + 'ch' : WHour.length + 2 + 'ch' }}
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
                                {/* Leader */}
                                <tr>
                                    <th rowSpan="2" colSpan="2">Ship leader</th>
                                    <td colSpan="3">
                                        <input
                                            name="leader"
                                            placeholder='Name'
                                            value={shipLeader[0].leader}
                                            type="text"
                                            onChange={(e) => {
                                                let leaderData = [...shipLeader];
                                                leaderData[0].leader = e.target.value.toUpperCase();
                                                setShipLeader(leaderData);
                                            }}
                                            onBlur={() => { updateInput() }}
                                            style={{ width: shipLeader[0].leader === "" ? "Name  ".length + 'ch' : shipLeader[0].leader.length + 2 + 'ch' }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            name="hours"
                                            value={shipLeader[0].hours}
                                            placeholder='Hours'
                                            type="text"
                                            onChange={(e) => {
                                                let leaderData = [...shipLeader];
                                                leaderData[0].hours = e.target.value;
                                                setShipLeader(leaderData);
                                            }}
                                            onBlur={() => { updateInput() }}
                                            style={{ width: shipLeader[0].hours === "" ? "Hours ".length + 'ch' : shipLeader[0].hours.length + 2 + 'ch' }}
                                        />
                                    </td>
                                    <td colSpan="2">
                                        <input
                                            name="fromTo"
                                            value={shipLeader[0].fromTo}
                                            type="text"
                                            placeholder='From to'
                                            onChange={(e) => {
                                                let leaderData = [...shipLeader];
                                                leaderData[0].fromTo = e.target.value;
                                                setShipLeader(leaderData);
                                            }}
                                            style={{ width: shipLeader[0].fromTo === "" ? "From to".length + 'ch' : shipLeader[0].fromTo.length + 2 + 'ch' }}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="3">
                                        <input
                                            name="leader"
                                            value={shipLeader[1].leader}
                                            type="text"
                                            onBlur={() => { updateInput() }}
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
                                            onBlur={() => { updateInput() }}
                                            onChange={(e) => {
                                                let leaderData = [...shipLeader];
                                                leaderData[1].hours = e.target.value;
                                                setShipLeader(leaderData);
                                            }}
                                            style={{ width: shipLeader[1].hours === "" ? 5 + 'ch' : shipLeader[1].hours.length + 2 + 'ch' }}
                                        />
                                    </td>
                                    <td colSpan="2">
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
                                    <th colSpan="2">Work assign</th>
                                    <td colSpan="2">
                                        <input
                                            name="WorkAssign"
                                            value={handoverShip[0]}
                                            type="text"
                                            onBlur={() => { updateInput() }}
                                            onChange={(e) => {
                                                let handoverData = [...handoverShip];
                                                handoverData[0] = e.target.value.toUpperCase();
                                                setHandovership(handoverData);
                                            }}
                                            style={{ width: handoverShip[0] === "" ? 5 + 'ch' : handoverShip[0].length + 2 + 'ch' }}
                                        />
                                    </td>
                                    <th colSpan="2">WO evaluation</th>
                                    <td colSpan="2">
                                        <input
                                            name="WOEval"
                                            value={handoverShip[1]}
                                            type="text"
                                            onBlur={() => { updateInput() }}
                                            onChange={(e) => {
                                                let handoverData = [...handoverShip];
                                                handoverData[1] = e.target.value.toUpperCase();
                                                setHandovership(handoverData);
                                            }}
                                            style={{ width: handoverShip[1] === "" ? 5 + 'ch' : handoverShip[1].length + 2 + 'ch' }}
                                        />
                                    </td>
                                </tr>

                                {/* Start ship */}
                                <tr>
                                    <th colSpan="2">Start Ship</th>
                                    <td colSpan="2">
                                        <input
                                            name="startShip"
                                            value={handoverShip[2]}
                                            type="text"
                                            onBlur={() => { updateInput() }}
                                            onChange={(e) => {
                                                let handoverData = [...handoverShip];
                                                handoverData[2] = e.target.value.toUpperCase();
                                                setHandovership(handoverData);
                                            }}
                                            style={{ width: handoverShip[2] === "" ? 5 + 'ch' : handoverShip[2].length + 2 + 'ch' }}
                                        />
                                    </td>
                                    <th colSpan="2">End ship</th>
                                    <td colSpan="2">
                                        <input
                                            name="endShip"
                                            value={handoverShip[3]}
                                            type="text"
                                            onBlur={() => { updateInput() }}
                                            onChange={(e) => {
                                                let handoverData = [...handoverShip];
                                                handoverData[3] = e.target.value.toUpperCase();
                                                setHandovership(handoverData);
                                            }}
                                            style={{ width: handoverShip[3] === "" ? 5 + 'ch' : handoverShip[3].length + 2 + 'ch' }}
                                        />
                                    </td>
                                </tr>

                                {/* Driver */}
                                <tr>
                                    <th rowSpan="3" colSpan="2">Driver</th>
                                    <td colSpan="3">
                                        <input
                                            name="driver1"
                                            value={driver[0].driver}
                                            placeholder='Name'
                                            type="text"
                                            onBlur={() => { updateInput() }}
                                            onChange={(e) => {
                                                let driverData = [...driver];
                                                driverData[0].driver = e.target.value.toUpperCase();
                                                setDriver(driverData);
                                            }}
                                            style={{ width: driver[0].driver === "" ? "Name  ".length + 'ch' : driver[0].driver.length + 2 + 'ch' }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            name="driver1Hours"
                                            value={driver[0].hours}
                                            placeholder='Hours'
                                            type="text"
                                            onBlur={() => { updateInput() }}
                                            onChange={(e) => {
                                                let driverData = [...driver];
                                                driverData[0].hours = e.target.value;
                                                setDriver(driverData);
                                            }}
                                            style={{ width: driver[0].hours === "" ? "Hours ".length + 'ch' : driver[0].hours.length + 2 + 'ch' }}
                                        />
                                    </td>
                                    <td colSpan="2">
                                        <input
                                            name="driver1Time"
                                            value={driver[0].fromTo}
                                            type="text"
                                            placeholder='From to'
                                            onChange={(e) => {
                                                let driverData = [...driver];
                                                driverData[0].fromTo = e.target.value;
                                                setDriver(driverData);
                                            }}
                                            style={{ width: driver[0].fromTo === "" ? "From to".length + 'ch' : driver[0].fromTo.length + 2 + 'ch' }}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="3">
                                        <input
                                            name="driver2"
                                            value={driver[1].driver}
                                            type="text"
                                            placeholder='Name'
                                            onChange={(e) => {
                                                let driverData = [...driver];
                                                driverData[1].driver = e.target.value.toUpperCase();
                                                setDriver(driverData);
                                            }}
                                            style={{ width: driver[1].driver === "" ? "Name  ".length + 'ch' : driver[1].driver.length + 2 + 'ch' }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            name="driver2Hours"
                                            value={driver[1].hours}
                                            type="text"
                                            placeholder='Hours'
                                            onBlur={() => { updateInput() }}
                                            onChange={(e) => {
                                                let driverData = [...driver];
                                                driverData[1].hours = e.target.value;
                                                setDriver(driverData);
                                            }}
                                            style={{ width: driver[1].hours === "" ? "Hours ".length + 'ch' : driver[1].hours.length + 2 + 'ch' }}
                                        />
                                    </td>
                                    <td colSpan="2">
                                        <input
                                            name="driver2Time"
                                            value={driver[1].fromTo}
                                            type="text"
                                            placeholder='From to'
                                            onBlur={() => { updateInput() }}
                                            onChange={(e) => {
                                                let driverData = [...driver];
                                                driverData[1].fromTo = e.target.value;
                                                setDriver(driverData);
                                            }}
                                            style={{ width: driver[1].fromTo === "" ? "From to".length + 'ch' : driver[1].fromTo.length + 2 + 'ch' }}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="3">
                                        <input
                                            name="driver3"
                                            value={driver[2].driver}
                                            type="text"
                                            onChange={(e) => {
                                                let driverData = [...driver];
                                                driverData[2].driver = e.target.value.toUpperCase();
                                                setDriver(driverData);
                                            }}
                                            style={{ width: driver[2].driver === "" ? 5 + 'ch' : driver[2].driver.length + 2 + 'ch' }}
                                        />
                                    </td>
                                    <td colSpan="3">{driver[2].fromTo}</td>
                                </tr>

                                {/* B duty */}
                                <tr>
                                    <th colSpan="4">B 321 duty</th>
                                    <th >Func</th>
                                    <th >Type</th>
                                    <th colSpan="2">Hours</th>
                                </tr>
                                {BDuty.map(({ STT, name, func, type, hours }) => (
                                    <tr key={STT}>
                                        <td colSpan="4">
                                            <input
                                                name="name"
                                                value={name}
                                                type="text"
                                                onBlur={() => { updateInput() }}
                                                onChange={(e) => onChangeInputBDuty(e, STT)}

                                                style={{ width: name === "" ? 5 + 'ch' : name.length + 2 + 'ch' }}
                                            />
                                        </td>
                                        <td >
                                            <input
                                                name="func"
                                                value={func}
                                                type="text"
                                                onChange={(e) => onChangeInputBDuty(e, STT)}
                                                style={{ width: func === "" ? 5 + 'ch' : func.length + 1 + 'ch' }}
                                            />
                                        </td>
                                        <td>
                                            <select
                                                className='form-select'
                                                name="type"
                                                value={type}
                                                onChange={(e) => onChangeInputBDuty(e, STT)}
                                                onBlur={() => { updateInput() }}
                                            >
                                                <option selected value=""></option>
                                                <option value="STBY">STBY</option>
                                            </select>
                                        </td>
                                        <td colSpan="2">
                                            <input
                                                name="hours"
                                                value={hours}
                                                type="text"
                                                onBlur={() => { updateInput() }}
                                                onChange={(e) => onChangeInputBDuty(e, STT)}
                                                style={{ width: hours === "" ? 5 + 'ch' : hours.length + 1 + 'ch' }}
                                            />
                                        </td>
                                    </tr>
                                ))}

                                {/* Power source */}
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Work</th>
                                    <th>WPoint</th>
                                    {/* <th>WHour</th> */}
                                    <th>Hours</th>
                                    <th>Type</th>
                                    <th>From to</th>
                                    <th>Remark</th>
                                </tr>
                                {powerSource.map(({ STT, ID, name, work, WPoint, WHour, hours, type, fromTo, remark }) => (
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
                                                onBlur={() => { updateInput() }}
                                                style={{ width: name === "" ? 5 + 'ch' : name.length + 2 + 'ch' }}
                                            />
                                        </td>
                                        <td >{work}</td>
                                        <td >{WPoint}</td>
                                        {/* <td >{WHour}</td> */}
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
                                                value={type}
                                                onChange={(e) => onChangeInputPower(e, STT)}
                                                onBlur={() => { updateInput() }}
                                            >
                                                <option selected value=""></option>
                                                <option value="TC">TC</option>
                                                <option value="NC">NC</option>
                                                <option value="B">B</option>
                                                <option value="F">F</option>
                                                <option value="O">O</option>
                                                <option value="CT">CT</option>
                                                <option value="H">H</option>
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
                                        <td >
                                            <input
                                                name="remark"
                                                value={remark}
                                                type="text"
                                                onChange={(e) => onChangeInputPower(e, STT)}
                                                style={{ width: remark === "" ? 5 + 'ch' : remark.length + 2 + 'ch' }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                    <th colSpan="8">
                                        <button className='btn btn-info'
                                            onClick={() => handlePowerAddRow()}>Add row</button>
                                        <button className='btn btn-info'
                                            onClick={() => handlePowerDeleteRow()}>Delete row</button>
                                    </th>
                                </tr>
                                <tr>
                                    <th colSpan="8">
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

