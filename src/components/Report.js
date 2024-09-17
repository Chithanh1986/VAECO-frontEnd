import React, { useState, useRef } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import './Report.scss';
import { toast } from 'react-toastify';
import { getGroupUsers, getPowerData } from '../services/UserService';
import * as XLSX from 'xlsx';
import { read, writeFileXLSX } from "xlsx";

const Report = () => {
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();
    const [DADTeam1, setDADTeam1] = useState();
    const [DADTeam2, setDADTeam2] = useState();
    const [DADTeam3, setDADTeam3] = useState();
    const [DADTeam4, setDADTeam4] = useState();
    const [CXRTeam1, setCXRTeam1] = useState();
    const [CXRTeam2, setCXRTeam2] = useState();
    const [CXRTeam3, setCXRTeam3] = useState();
    const [CXRTeam4, setCXRTeam4] = useState();
    const [PKT, setPKT] = useState();
    const [store, setStore] = useState();
    const [HUI, setHUI] = useState();
    const [PXU, setPXU] = useState();
    const [UIH, setUIH] = useState();
    const [VCL, setVCL] = useState();
    const [TBB, setTBB] = useState();
    const [VDH, setVDH] = useState();
    const ref = useRef(null);

    const handleClear = () => {
        setStartDate();
        setEndDate();
        setDADTeam1()
        setDADTeam2();
        setDADTeam3();
        setDADTeam4();
    }

    const checkInputValid = () => {
        if (!startDate || !endDate) {
            toast.error("Input required")
        } else {
            if (startDate.getYear() === endDate.getYear()) {
                if (startDate.getMonth() === endDate.getMonth()) {
                    if (startDate.getDate() <= endDate.getDate()) {
                        return true;
                    } else {
                        toast.error("Start date larger than end date");
                        return false;
                    }
                } else {
                    toast.error("Start month differ with end month");
                    return false;
                }
            } else {
                toast.error("Start year differ with end year");
                return false;
            }
        }
    }

    const builtData = async (station, division) => {
        let serverData = await getGroupUsers(station, division);
        if (serverData.EC === 0) {
            serverData.DT.map((item, index) => {
                item.assignHours = 0;
                item.workingHours = 0;
                item.workingPoint = 0;
                item.efficiency = 0;
            })
            return serverData.DT;
        } else {
            toast.error(serverData.EM);
            return false;
        }
    }

    const handleLoadReport = async () => {
        let inputValid = checkInputValid();
        if (inputValid) {
            let getDADTeam1 = await builtData("DAD", "Team 1");
            let getDADTeam2 = await builtData("DAD", "Team 2");
            let getDADTeam3 = await builtData("DAD", "Team 3");
            let getDADTeam4 = await builtData("DAD", "Team 4");
            let getCXRTeam1 = await builtData("CXR", "Team 1");
            let getCXRTeam2 = await builtData("CXR", "Team 2");
            let getCXRTeam3 = await builtData("CXR", "Team 3");
            let getCXRTeam4 = await builtData("CXR", "Team 4");
            let getPKT = await builtData("DAD", "Tech");
            let getStore = await builtData("DAD", "Store");
            let getHUI = await builtData("HUI", "Tech");
            let getPXU = await builtData("PXU", "Tech");
            let getUIH = await builtData("UIH", "Tech");
            let getVCL = await builtData("VCL", "Tech");
            let getTBB = await builtData("TBB", "Tech");
            let getVDH = await builtData("VDH", "Tech");
            let date = startDate.toLocaleDateString('fr-FR').split("/");

            for (var i = startDate.getDate(); i <= endDate.getDate(); i++) {
                let j = i.toString();
                if (j.length === 1) { j = "0" + j; }
                let getDate = j + "/" + date[1] + "/" + date[2];
                let serverData = await getPowerData(getDate);
                let powerData = serverData.DT;

                for (var k = 0; k < powerData.length; k++) {
                    powerData[k].map((item, index) => {
                        if (item.ID !== "") {
                            getDADTeam1.map((individual, index) => { //search ID in powerSource map with ID in team1
                                if (item.ID === individual.vae_id) {
                                    individual.assignHours = individual.assignHours + (+item.hours);
                                    individual.workingHours = individual.workingHours + (+item.WHour / 60);
                                    individual.workingPoint = individual.workingPoint + (+item.WPoint);
                                }
                            })
                            getDADTeam2.map((individual, index) => { //search ID in powerSource map with ID in team2
                                if (item.ID === individual.vae_id) {
                                    individual.assignHours = individual.assignHours + (+item.hours);
                                    individual.workingHours = individual.workingHours + (+item.WHour / 60);
                                    individual.workingPoint = individual.workingPoint + (+item.WPoint);
                                }
                            })
                            getDADTeam3.map((individual, index) => { //search ID in powerSource map with ID in team3
                                if (item.ID === individual.vae_id) {
                                    individual.assignHours = individual.assignHours + (+item.hours);
                                    individual.workingHours = individual.workingHours + (+item.WHour / 60);
                                    individual.workingPoint = individual.workingPoint + (+item.WPoint);
                                }
                            })

                            getDADTeam4.map((individual, index) => { //search ID in powerSource map with ID in team4
                                if (item.ID === individual.vae_id) {
                                    individual.assignHours = individual.assignHours + (+item.hours);
                                    individual.workingHours = individual.workingHours + (+item.WHour / 60);
                                    individual.workingPoint = individual.workingPoint + (+item.WPoint);
                                }
                            })

                            getCXRTeam1.map((individual, index) => { //search ID in powerSource map with ID in team1
                                if (item.ID === individual.vae_id) {
                                    individual.assignHours = individual.assignHours + (+item.hours);
                                    individual.workingHours = individual.workingHours + (+item.WHour / 60);
                                    individual.workingPoint = individual.workingPoint + (+item.WPoint);
                                }
                            })
                            getCXRTeam2.map((individual, index) => { //search ID in powerSource map with ID in team2
                                if (item.ID === individual.vae_id) {
                                    individual.assignHours = individual.assignHours + (+item.hours);
                                    individual.workingHours = individual.workingHours + (+item.WHour / 60);
                                    individual.workingPoint = individual.workingPoint + (+item.WPoint);
                                }
                            })
                            getCXRTeam3.map((individual, index) => { //search ID in powerSource map with ID in team3
                                if (item.ID === individual.vae_id) {
                                    individual.assignHours = individual.assignHours + (+item.hours);
                                    individual.workingHours = individual.workingHours + (+item.WHour / 60);
                                    individual.workingPoint = individual.workingPoint + (+item.WPoint);
                                }
                            })
                            getCXRTeam4.map((individual, index) => { //search ID in powerSource map with ID in team4
                                if (item.ID === individual.vae_id) {
                                    individual.assignHours = individual.assignHours + (+item.hours);
                                    individual.workingHours = individual.workingHours + (+item.WHour / 60);
                                    individual.workingPoint = individual.workingPoint + (+item.WPoint);
                                }
                            })

                            getPKT.map((individual, index) => {
                                if (item.ID === individual.vae_id) {
                                    individual.assignHours = individual.assignHours + (+item.hours);
                                    individual.workingHours = individual.workingHours + (+item.WHour / 60);
                                    individual.workingPoint = individual.workingPoint + (+item.WPoint);
                                }
                            })
                            getStore.map((individual, index) => {
                                if (item.ID === individual.vae_id) {
                                    individual.assignHours = individual.assignHours + (+item.hours);
                                    individual.workingHours = individual.workingHours + (+item.WHour / 60);
                                    individual.workingPoint = individual.workingPoint + (+item.WPoint);
                                }
                            })
                            getHUI.map((individual, index) => {
                                if (item.ID === individual.vae_id) {
                                    individual.assignHours = individual.assignHours + (+item.hours);
                                    individual.workingHours = individual.workingHours + (+item.WHour / 60);
                                    individual.workingPoint = individual.workingPoint + (+item.WPoint);
                                }
                            })
                            getPXU.map((individual, index) => {
                                if (item.ID === individual.vae_id) {
                                    individual.assignHours = individual.assignHours + (+item.hours);
                                    individual.workingHours = individual.workingHours + (+item.WHour / 60);
                                    individual.workingPoint = individual.workingPoint + (+item.WPoint);
                                }
                            })

                            getUIH.map((individual, index) => {
                                if (item.ID === individual.vae_id) {
                                    individual.assignHours = individual.assignHours + (+item.hours);
                                    individual.workingHours = individual.workingHours + (+item.WHour / 60);
                                    individual.workingPoint = individual.workingPoint + (+item.WPoint);
                                }
                            })
                            getVCL.map((individual, index) => {
                                if (item.ID === individual.vae_id) {
                                    individual.assignHours = individual.assignHours + (+item.hours);
                                    individual.workingHours = individual.workingHours + (+item.WHour / 60);
                                    individual.workingPoint = individual.workingPoint + (+item.WPoint);
                                }
                            })
                            getTBB.map((individual, index) => {
                                if (item.ID === individual.vae_id) {
                                    individual.assignHours = individual.assignHours + (+item.hours);
                                    individual.workingHours = individual.workingHours + (+item.WHour / 60);
                                    individual.workingPoint = individual.workingPoint + (+item.WPoint);
                                }
                            })
                            getVDH.map((individual, index) => {
                                if (item.ID === individual.vae_id) {
                                    individual.assignHours = individual.assignHours + (+item.hours);
                                    individual.workingHours = individual.workingHours + (+item.WHour / 60);
                                    individual.workingPoint = individual.workingPoint + (+item.WPoint);
                                }
                            })
                        }
                    })
                }
            }

            getDADTeam1.map((individual, index) => {
                individual.workingHours = individual.workingHours.toFixed(1);
                individual.workingPoint = individual.workingPoint.toFixed(2);
                if (individual.assignHours !== 0) {
                    individual.efficiency = (individual.workingHours / individual.assignHours).toFixed(2);
                }
            })
            getDADTeam2.map((individual, index) => {
                individual.workingHours = individual.workingHours.toFixed(1);
                individual.workingPoint = individual.workingPoint.toFixed(2);
                if (individual.assignHours !== 0) {
                    individual.efficiency = (individual.workingHours / individual.assignHours).toFixed(2);
                }
            })
            getDADTeam3.map((individual, index) => {
                individual.workingHours = individual.workingHours.toFixed(1);
                individual.workingPoint = individual.workingPoint.toFixed(2);
                if (individual.assignHours !== 0) {
                    individual.efficiency = (individual.workingHours / individual.assignHours).toFixed(2);
                }
            })
            getDADTeam4.map((individual, index) => {
                individual.workingHours = individual.workingHours.toFixed(1);
                individual.workingPoint = individual.workingPoint.toFixed(2);
                if (individual.assignHours !== 0) {
                    individual.efficiency = (individual.workingHours / individual.assignHours).toFixed(2);
                }
            })

            getCXRTeam1.map((individual, index) => {
                individual.workingHours = individual.workingHours.toFixed(1);
                individual.workingPoint = individual.workingPoint.toFixed(2);
                if (individual.assignHours !== 0) {
                    individual.efficiency = (individual.workingHours / individual.assignHours).toFixed(2);
                }
            })
            getCXRTeam2.map((individual, index) => {
                individual.workingHours = individual.workingHours.toFixed(1);
                individual.workingPoint = individual.workingPoint.toFixed(2);
                if (individual.assignHours !== 0) {
                    individual.efficiency = (individual.workingHours / individual.assignHours).toFixed(2);
                }
            })
            getCXRTeam3.map((individual, index) => {
                individual.workingHours = individual.workingHours.toFixed(1);
                individual.workingPoint = individual.workingPoint.toFixed(2);
                if (individual.assignHours !== 0) {
                    individual.efficiency = (individual.workingHours / individual.assignHours).toFixed(2);
                }
            })
            getCXRTeam4.map((individual, index) => {
                individual.workingHours = individual.workingHours.toFixed(1);
                individual.workingPoint = individual.workingPoint.toFixed(2);
                if (individual.assignHours !== 0) {
                    individual.efficiency = (individual.workingHours / individual.assignHours).toFixed(2);
                }
            })

            getPKT.map((individual, index) => {
                individual.workingHours = individual.workingHours.toFixed(1);
                individual.workingPoint = individual.workingPoint.toFixed(2);
                if (individual.assignHours !== 0) {
                    individual.efficiency = (individual.workingHours / individual.assignHours).toFixed(2);
                }
            })
            getStore.map((individual, index) => {
                individual.workingHours = individual.workingHours.toFixed(1);
                individual.workingPoint = individual.workingPoint.toFixed(2);
                if (individual.assignHours !== 0) {
                    individual.efficiency = (individual.workingHours / individual.assignHours).toFixed(2);
                }
            })
            getHUI.map((individual, index) => {
                individual.workingHours = individual.workingHours.toFixed(1);
                individual.workingPoint = individual.workingPoint.toFixed(2);
                if (individual.assignHours !== 0) {
                    individual.efficiency = (individual.workingHours / individual.assignHours).toFixed(2);
                }
            })
            getPXU.map((individual, index) => {
                individual.workingHours = individual.workingHours.toFixed(1);
                individual.workingPoint = individual.workingPoint.toFixed(2);
                if (individual.assignHours !== 0) {
                    individual.efficiency = (individual.workingHours / individual.assignHours).toFixed(2);
                }
            })

            getUIH.map((individual, index) => {
                individual.workingHours = individual.workingHours.toFixed(1);
                individual.workingPoint = individual.workingPoint.toFixed(2);
                if (individual.assignHours !== 0) {
                    individual.efficiency = (individual.workingHours / individual.assignHours).toFixed(2);
                }
            })
            getVCL.map((individual, index) => {
                individual.workingHours = individual.workingHours.toFixed(1);
                individual.workingPoint = individual.workingPoint.toFixed(2);
                if (individual.assignHours !== 0) {
                    individual.efficiency = (individual.workingHours / individual.assignHours).toFixed(2);
                }
            })
            getTBB.map((individual, index) => {
                individual.workingHours = individual.workingHours.toFixed(1);
                individual.workingPoint = individual.workingPoint.toFixed(2);
                if (individual.assignHours !== 0) {
                    individual.efficiency = (individual.workingHours / individual.assignHours).toFixed(2);
                }
            })
            getVDH.map((individual, index) => {
                individual.workingHours = individual.workingHours.toFixed(1);
                individual.workingPoint = individual.workingPoint.toFixed(2);
                if (individual.assignHours !== 0) {
                    individual.efficiency = (individual.workingHours / individual.assignHours).toFixed(2);
                }
            })

            setDADTeam1(getDADTeam1);
            setDADTeam2(getDADTeam2);
            setDADTeam3(getDADTeam3);
            setDADTeam4(getDADTeam4);
            setCXRTeam1(getCXRTeam1);
            setCXRTeam2(getCXRTeam2);
            setCXRTeam3(getCXRTeam3);
            setCXRTeam4(getCXRTeam4);
            setPKT(getPKT);
            setStore(getStore);
            setHUI(getHUI);
            setPXU(getPXU);
            setUIH(getUIH);
            setVCL(getVCL);
            setTBB(getTBB);
            setVDH(getVDH);
        }
    }

    const handleExport = () => {
        if (DADTeam1 && VDH) {
            const element = ref.current;

            // Extract Data (create a workbook object from the table)
            var workbook = XLSX.utils.table_to_book(element);

            // Process Data (add a new row)
            var ws = workbook.Sheets["Sheet1"];
            // XLSX.utils.sheet_add_aoa(ws, [["Created " + new Date().toISOString()]], { origin: -1 });

            // Package and Release Data (`writeFile` tries to write and save an XLSB file)
            XLSX.writeFile(workbook, "Report.xlsx");
        } else {
            toast.error("Missing data")
        }
    }

    return (
        <div>
            <div className='header-container'>
                <>Report from :</>
                <DatePicker
                    selected={startDate}
                    onChange={date => setStartDate(date)}
                    minDate={new Date().setDate(new Date().getDate() - 730)}
                    maxDate={new Date().setDate(new Date().getDate())}
                    dateFormat="dd/MM/YYYY"
                />
                <>to :</>
                <DatePicker
                    selected={endDate}
                    onChange={date => setEndDate(date)}
                    minDate={new Date().setDate(new Date().getDate() - 730)}
                    maxDate={new Date().setDate(new Date().getDate())}
                    dateFormat="dd/MM/YYYY"
                />
                <button className="btn"
                    onClick={() => handleClear()}>Clear</button>
                <button className={startDate && endDate ? 'btn active' : 'btn'}
                    onClick={() => handleLoadReport()}>Load report</button>
                <button className="btn info"
                    onClick={() => handleExport()}>Export</button>
            </div>

            <div ref={ref} className='users-container'>
                <div>
                    <h1>Report list</h1>
                </div>
                <div>
                    <h3>1. DAD LINE STATION</h3>
                </div>

                <div className='station-container'>
                    <table className="table-bordered " responsive>
                        <thead>
                            <tr>
                                <th colSpan={7}>A. TEAM 1 DAD</th>
                            </tr>
                            <tr>
                                <th scope="col">No</th>
                                <th scope="col">Full name</th>
                                <th scope="col">Vaeco ID</th>
                                <th scope="col">As-hours</th>
                                <th scope="col">W-hours</th>
                                <th scope="col">W-point</th>
                                <th scope="col">Effic</th>
                            </tr>
                        </thead>
                        <tbody>
                            {DADTeam1 && DADTeam1.length > 0 ?
                                <>
                                    {DADTeam1.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.surname} {item.name}</td>
                                                <td>{item.vae_id}</td>
                                                <td>{item.assignHours}</td>
                                                <td>{item.workingHours}</td>
                                                <td>{item.workingPoint}</td>
                                                <td>{item.efficiency}</td>
                                            </tr>
                                        )
                                    })}
                                </>
                                :
                                <><tr><td colSpan={7} >Not found users</td></tr></>
                            }
                        </tbody>
                    </table>

                    <table className="table-bordered " responsive>
                        <thead>
                            <tr>
                                <th colSpan={7}>B. TEAM 2 DAD</th>
                            </tr>
                            <tr>
                                <th scope="col">No</th>
                                <th scope="col">Full name</th>
                                <th scope="col">Vaeco ID</th>
                                <th scope="col">As-hours</th>
                                <th scope="col">W-hours</th>
                                <th scope="col">W-point</th>
                                <th scope="col">Effic</th>
                            </tr>
                        </thead>
                        <tbody>
                            {DADTeam2 && DADTeam2.length > 0 ?
                                <>
                                    {DADTeam2.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.surname} {item.name}</td>
                                                <td>{item.vae_id}</td>
                                                <td>{item.assignHours}</td>
                                                <td>{item.workingHours}</td>
                                                <td>{item.workingPoint}</td>
                                                <td>{item.efficiency}</td>
                                            </tr>
                                        )
                                    })}
                                </>
                                :
                                <><tr><td colSpan={7}>Not found users</td></tr></>
                            }
                        </tbody>
                    </table>

                    <table className="table-bordered " responsive>
                        <thead>
                            <tr>
                                <th colSpan={7}>C. TEAM 3 DAD</th>
                            </tr>
                            <tr>
                                <th scope="col">No</th>
                                <th scope="col">Full name</th>
                                <th scope="col">Vaeco ID</th>
                                <th scope="col">As-hours</th>
                                <th scope="col">W-hours</th>
                                <th scope="col">W-point</th>
                                <th scope="col">Effic</th>
                            </tr>
                        </thead>
                        <tbody>
                            {DADTeam3 && DADTeam3.length > 0 ?
                                <>
                                    {DADTeam3.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.surname} {item.name}</td>
                                                <td>{item.vae_id}</td>
                                                <td>{item.assignHours}</td>
                                                <td>{item.workingHours}</td>
                                                <td>{item.workingPoint}</td>
                                                <td>{item.efficiency}</td>
                                            </tr>
                                        )
                                    })}
                                </>
                                :
                                <><tr><td colSpan={7}>Not found users</td></tr></>
                            }
                        </tbody>
                    </table>

                    <table className="table-bordered " responsive>
                        <thead>
                            <tr>
                                <th colSpan={7}>D. TEAM 4 DAD</th>
                            </tr>
                            <tr>
                                <th scope="col">No</th>
                                <th scope="col">Full name</th>
                                <th scope="col">Vaeco ID</th>
                                <th scope="col">As-hours</th>
                                <th scope="col">W-hours</th>
                                <th scope="col">W-point</th>
                                <th scope="col">Effic</th>
                            </tr>
                        </thead>
                        <tbody>
                            {DADTeam4 && DADTeam4.length > 0 ?
                                <>
                                    {DADTeam4.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.surname} {item.name}</td>
                                                <td>{item.vae_id}</td>
                                                <td>{item.assignHours}</td>
                                                <td>{item.workingHours}</td>
                                                <td>{item.workingPoint}</td>
                                                <td>{item.efficiency}</td>
                                            </tr>
                                        )
                                    })}
                                </>
                                :
                                <><tr><td colSpan={7}>Not found users</td></tr></>
                            }
                        </tbody>
                    </table>
                </div>

                <div>
                    <h3>2. CXR STATION</h3>
                </div>

                <div className='station-container'>
                    <table className="table-bordered " responsive>
                        <thead>
                            <tr>
                                <th colSpan={7}>A. TEAM 1 CXR</th>
                            </tr>
                            <tr>
                                <th scope="col">No</th>
                                <th scope="col">Full name</th>
                                <th scope="col">Vaeco ID</th>
                                <th scope="col">As-hours</th>
                                <th scope="col">W-hours</th>
                                <th scope="col">W-point</th>
                                <th scope="col">Effic</th>
                            </tr>
                        </thead>
                        <tbody>
                            {CXRTeam1 && CXRTeam1.length > 0 ?
                                <>
                                    {CXRTeam1.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.surname} {item.name}</td>
                                                <td>{item.vae_id}</td>
                                                <td>{item.assignHours}</td>
                                                <td>{item.workingHours}</td>
                                                <td>{item.workingPoint}</td>
                                                <td>{item.efficiency}</td>
                                            </tr>
                                        )
                                    })}
                                </>
                                :
                                <><tr><td colSpan={7}>Not found users</td></tr></>
                            }
                        </tbody>
                    </table>

                    <table className="table-bordered " responsive>
                        <thead>
                            <tr>
                                <th colSpan={7}>B. TEAM 2 CXR</th>
                            </tr>
                            <tr>
                                <th scope="col">No</th>
                                <th scope="col">Full name</th>
                                <th scope="col">Vaeco ID</th>
                                <th scope="col">As-hours</th>
                                <th scope="col">W-hours</th>
                                <th scope="col">W-point</th>
                                <th scope="col">Effic</th>
                            </tr>
                        </thead>
                        <tbody>
                            {CXRTeam2 && CXRTeam2.length > 0 ?
                                <>
                                    {CXRTeam2.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.surname} {item.name}</td>
                                                <td>{item.vae_id}</td>
                                                <td>{item.assignHours}</td>
                                                <td>{item.workingHours}</td>
                                                <td>{item.workingPoint}</td>
                                                <td>{item.efficiency}</td>
                                            </tr>
                                        )
                                    })}
                                </>
                                :
                                <><tr><td colSpan={7}>Not found users</td></tr></>
                            }
                        </tbody>
                    </table>

                    <table className="table-bordered " responsive>
                        <thead>
                            <tr>
                                <th colSpan={7}>C. TEAM 3 CXR</th>
                            </tr>
                            <tr>
                                <th scope="col">No</th>
                                <th scope="col">Full name</th>
                                <th scope="col">Vaeco ID</th>
                                <th scope="col">As-hours</th>
                                <th scope="col">W-hours</th>
                                <th scope="col">W-point</th>
                                <th scope="col">Effic</th>
                            </tr>
                        </thead>
                        <tbody>
                            {CXRTeam3 && CXRTeam3.length > 0 ?
                                <>
                                    {CXRTeam3.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.surname} {item.name}</td>
                                                <td>{item.vae_id}</td>
                                                <td>{item.assignHours}</td>
                                                <td>{item.workingHours}</td>
                                                <td>{item.workingPoint}</td>
                                                <td>{item.efficiency}</td>
                                            </tr>
                                        )
                                    })}
                                </>
                                :
                                <><tr><td colSpan={7}>Not found users</td></tr></>
                            }
                        </tbody>
                    </table>

                    <table className="table-bordered " responsive>
                        <thead>
                            <tr>
                                <th colSpan={7}>D. TEAM 4 CXR</th>
                            </tr>
                            <tr>
                                <th scope="col">No</th>
                                <th scope="col">Full name</th>
                                <th scope="col">Vaeco ID</th>
                                <th scope="col">As-hours</th>
                                <th scope="col">W-hours</th>
                                <th scope="col">W-point</th>
                                <th scope="col">Effic</th>
                            </tr>
                        </thead>
                        <tbody>
                            {CXRTeam4 && CXRTeam4.length > 0 ?
                                <>
                                    {CXRTeam4.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.surname} {item.name}</td>
                                                <td>{item.vae_id}</td>
                                                <td>{item.assignHours}</td>
                                                <td>{item.workingHours}</td>
                                                <td>{item.workingPoint}</td>
                                                <td>{item.efficiency}</td>
                                            </tr>
                                        )
                                    })}
                                </>
                                :
                                <><tr><td colSpan={7}>Not found users</td></tr></>
                            }
                        </tbody>
                    </table>
                </div>

                <div><h3>3. PKT, STORE, HUI, PXU</h3></div>
                <div className='station-container'>
                    <table className="table-bordered " responsive>
                        <thead>
                            <tr>
                                <th colSpan={7}>A. PKT</th>
                            </tr>
                            <tr>
                                <th scope="col">No</th>
                                <th scope="col">Full name</th>
                                <th scope="col">Vaeco ID</th>
                                <th scope="col">As-hours</th>
                                <th scope="col">W-hours</th>
                                <th scope="col">W-point</th>
                                <th scope="col">Effic</th>
                            </tr>
                        </thead>
                        <tbody>
                            {PKT && PKT.length > 0 ?
                                <>
                                    {PKT.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.surname} {item.name}</td>
                                                <td>{item.vae_id}</td>
                                                <td>{item.assignHours}</td>
                                                <td>{item.workingHours}</td>
                                                <td>{item.workingPoint}</td>
                                                <td>{item.efficiency}</td>
                                            </tr>
                                        )
                                    })}
                                </>
                                :
                                <><tr><td colSpan={7}>Not found users</td></tr></>
                            }
                        </tbody>
                    </table>

                    <table className="table-bordered " responsive>
                        <thead>
                            <tr>
                                <th colSpan={7}>B. DAD STORE</th>
                            </tr>
                            <tr>
                                <th scope="col">No</th>
                                <th scope="col">Full name</th>
                                <th scope="col">Vaeco ID</th>
                                <th scope="col">As-hours</th>
                                <th scope="col">W-hours</th>
                                <th scope="col">W-point</th>
                                <th scope="col">Effic</th>
                            </tr>
                        </thead>
                        <tbody>
                            {store && store.length > 0 ?
                                <>
                                    {store.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.surname} {item.name}</td>
                                                <td>{item.vae_id}</td>
                                                <td>{item.assignHours}</td>
                                                <td>{item.workingHours}</td>
                                                <td>{item.workingPoint}</td>
                                                <td>{item.efficiency}</td>
                                            </tr>
                                        )
                                    })}
                                </>
                                :
                                <><tr><td colSpan={7}>Not found users</td></tr></>
                            }
                        </tbody>
                    </table>

                    <table className="table-bordered " responsive>
                        <thead>
                            <tr>
                                <th colSpan={7}>C. HUI STATION</th>
                            </tr>
                            <tr>
                                <th scope="col">No</th>
                                <th scope="col">Full name</th>
                                <th scope="col">Vaeco ID</th>
                                <th scope="col">As-hours</th>
                                <th scope="col">W-hours</th>
                                <th scope="col">W-point</th>
                                <th scope="col">Effic</th>
                            </tr>
                        </thead>
                        <tbody>
                            {HUI && HUI.length > 0 ?
                                <>
                                    {HUI.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.surname} {item.name}</td>
                                                <td>{item.vae_id}</td>
                                                <td>{item.assignHours}</td>
                                                <td>{item.workingHours}</td>
                                                <td>{item.workingPoint}</td>
                                                <td>{item.efficiency}</td>
                                            </tr>
                                        )
                                    })}
                                </>
                                :
                                <><tr><td colSpan={7}>Not found users</td></tr></>
                            }
                        </tbody>
                    </table>

                    <table className="table-bordered " responsive>
                        <thead>
                            <tr>
                                <th colSpan={7}>D. PXU STATION</th>
                            </tr>
                            <tr>
                                <th scope="col">No</th>
                                <th scope="col">Full name</th>
                                <th scope="col">Vaeco ID</th>
                                <th scope="col">As-hours</th>
                                <th scope="col">W-hours</th>
                                <th scope="col">W-point</th>
                                <th scope="col">Effic</th>
                            </tr>
                        </thead>
                        <tbody>
                            {PXU && PXU.length > 0 ?
                                <>
                                    {PXU.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.surname} {item.name}</td>
                                                <td>{item.vae_id}</td>
                                                <td>{item.assignHours}</td>
                                                <td>{item.workingHours}</td>
                                                <td>{item.workingPoint}</td>
                                                <td>{item.efficiency}</td>
                                            </tr>
                                        )
                                    })}
                                </>
                                :
                                <><tr><td colSpan={7}>Not found users</td></tr></>
                            }
                        </tbody>
                    </table>
                </div>

                <div><h3>4. UIH, VCL, TBB, VDH</h3></div>
                <div className='station-container'>
                    <table className="table-bordered " responsive>
                        <thead>
                            <tr>
                                <th colSpan={7}>A. UIH STATION</th>
                            </tr>
                            <tr>
                                <th scope="col">No</th>
                                <th scope="col">Full name</th>
                                <th scope="col">Vaeco ID</th>
                                <th scope="col">As-hours</th>
                                <th scope="col">W-hours</th>
                                <th scope="col">W-point</th>
                                <th scope="col">Effic</th>
                            </tr>
                        </thead>
                        <tbody>
                            {UIH && UIH.length > 0 ?
                                <>
                                    {UIH.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.surname} {item.name}</td>
                                                <td>{item.vae_id}</td>
                                                <td>{item.assignHours}</td>
                                                <td>{item.workingHours}</td>
                                                <td>{item.workingPoint}</td>
                                                <td>{item.efficiency}</td>
                                            </tr>
                                        )
                                    })}
                                </>
                                :
                                <><tr><td colSpan={7}>Not found users</td></tr></>
                            }
                        </tbody>
                    </table>

                    <table className="table-bordered " responsive>
                        <thead>
                            <tr>
                                <th colSpan={7}>B. VCL STATION</th>
                            </tr>
                            <tr>
                                <th scope="col">No</th>
                                <th scope="col">Full name</th>
                                <th scope="col">Vaeco ID</th>
                                <th scope="col">As-hours</th>
                                <th scope="col">W-hours</th>
                                <th scope="col">W-point</th>
                                <th scope="col">Effic</th>
                            </tr>
                        </thead>
                        <tbody>
                            {VCL && VCL.length > 0 ?
                                <>
                                    {VCL.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.surname} {item.name}</td>
                                                <td>{item.vae_id}</td>
                                                <td>{item.assignHours}</td>
                                                <td>{item.workingHours}</td>
                                                <td>{item.workingPoint}</td>
                                                <td>{item.efficiency}</td>
                                            </tr>
                                        )
                                    })}
                                </>
                                :
                                <><tr><td colSpan={7}>Not found users</td></tr></>
                            }
                        </tbody>
                    </table>

                    <table className="table-bordered " responsive>
                        <thead>
                            <tr>
                                <th colSpan={7}>C. TBB STATION</th>
                            </tr>
                            <tr>
                                <th scope="col">No</th>
                                <th scope="col">Full name</th>
                                <th scope="col">Vaeco ID</th>
                                <th scope="col">As-hours</th>
                                <th scope="col">W-hours</th>
                                <th scope="col">W-point</th>
                                <th scope="col">Effic</th>
                            </tr>
                        </thead>
                        <tbody>
                            {TBB && TBB.length > 0 ?
                                <>
                                    {TBB.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.surname} {item.name}</td>
                                                <td>{item.vae_id}</td>
                                                <td>{item.assignHours}</td>
                                                <td>{item.workingHours}</td>
                                                <td>{item.workingPoint}</td>
                                                <td>{item.efficiency}</td>
                                            </tr>
                                        )
                                    })}
                                </>
                                :
                                <><tr><td colSpan={7}>Not found users</td></tr></>
                            }
                        </tbody>
                    </table>

                    <table className="table-bordered " responsive>
                        <thead>
                            <tr>
                                <th colSpan={7}>D. VDH STATION</th>
                            </tr>
                            <tr>
                                <th scope="col">No</th>
                                <th scope="col">Full name</th>
                                <th scope="col">Vaeco ID</th>
                                <th scope="col">As-hours</th>
                                <th scope="col">W-hours</th>
                                <th scope="col">W-point</th>
                                <th scope="col">Effic</th>
                            </tr>
                        </thead>
                        <tbody>
                            {VDH && VDH.length > 0 ?
                                <>
                                    {VDH.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.surname} {item.name}</td>
                                                <td>{item.vae_id}</td>
                                                <td>{item.assignHours}</td>
                                                <td>{item.workingHours}</td>
                                                <td>{item.workingPoint}</td>
                                                <td>{item.efficiency}</td>
                                            </tr>
                                        )
                                    })}
                                </>
                                :
                                <><tr><td colSpan={7}>Not found users</td></tr></>
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Report;