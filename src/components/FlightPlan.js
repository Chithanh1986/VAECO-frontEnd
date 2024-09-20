import React, { useState, useContext } from 'react';
import './FlightPlan.scss';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { flightPlantApi } from '../services/UserService';
import { UserContext } from '../context/UserContext';

function FlightPlan() {
    const [date, setDate] = useState(null);
    const [data, setData] = useState(null);
    const [showStation, setShowStation] = useState("DAD");
    const { user } = useContext(UserContext);

    const handleClear = () => {
        setDate(null);
        setData(null);
        document.getElementById('file').value = '';
    }

    const handleSplitShip = (rawData, date, shipTime) => {

        let rev = new Date().toLocaleDateString('fr-FR') + " Time " + new Date().toLocaleTimeString('fr-FR');
        //get flight data for morning ship
        let flightShip1 = {
            flightDate: new Date(date).toLocaleDateString('fr-FR'),
            rev: rev,
            ship: "MO",
            flightData: [],
        }
        let elementNo1 = 0;
        let newData = [];
        rawData.map((individual, index) => {
            if (individual[0] !== undefined) newData.push(individual);
        })

        for (var i = 0; i < newData.length; i++) {
            let arrHour = parseInt(newData[i][7].split(":")[0], 10);
            let depHour = parseInt(newData[i][8].split(":")[0], 10);
            if (isNaN(arrHour)) { //non arrHour
                if (depHour >= shipTime.mo1 && depHour <= shipTime.mo2 && newData[i][8].includes("+") === false) {
                    flightShip1.flightData[elementNo1] = newData[i];
                    elementNo1++;
                }
            } else { // has arrHour
                if (arrHour >= shipTime.mo1 && arrHour <= shipTime.mo2 && newData[i][7].includes("+") === false) { //arr 3h - 17h on today
                    flightShip1.flightData[elementNo1] = newData[i];
                    elementNo1++;
                } else { //arr out 3h - 17h, check dep
                    if (newData[i][8].includes("+") === false && depHour >= shipTime.mo1 && depHour <= shipTime.mo2) {
                        flightShip1.flightData[elementNo1] = newData[i];
                        elementNo1++;
                    }
                }
            }
        }

        //get flight data for evening ship
        let flightShip2 = {
            flightDate: new Date(date).toLocaleDateString('fr-FR'),
            rev: rev,
            ship: "EV",
            flightData: [],
        }
        let elementNo2 = 0;
        for (var i = 0; i < newData.length; i++) {
            let arrHour = parseInt(newData[i][7].split(":")[0], 10);
            let depHour = parseInt(newData[i][8].split(":")[0], 10);
            if (isNaN(arrHour)) { //non arrHour
                if (newData[i][8].includes("+")) { // dep on next day
                    if (depHour < shipTime.ev1) {
                        flightShip2.flightData[elementNo2] = newData[i];
                        elementNo2++;
                    }
                } else { // dep on today
                    if (depHour >= shipTime.ev2) {
                        flightShip2.flightData[elementNo2] = newData[i];
                        elementNo2++;
                    }
                }
            } else { // has arrHour
                if (newData[i][7].includes("+")) { //arr on next day
                    if (arrHour < shipTime.ev1) {
                        flightShip2.flightData[elementNo2] = newData[i];
                        elementNo2++;
                    }
                } else { //arr on today
                    if (arrHour >= shipTime.ev2) { //arr on 15 - 24h
                        flightShip2.flightData[elementNo2] = newData[i];
                        elementNo2++;
                    } else { //arr out 15 - 24h
                        if (newData[i][8].includes("+")) { // dep on next day
                            if (depHour < shipTime.ev1) {
                                flightShip2.flightData[elementNo2] = newData[i];
                                elementNo2++;
                            }
                        } else { // dep on today
                            if (depHour >= shipTime.ev2) {
                                flightShip2.flightData[elementNo2] = newData[i];
                                elementNo2++;
                            }
                        }
                    }
                }
            }
        }
        let splitShip = {
            ship1: flightShip1,
            ship2: flightShip2
        }
        return splitShip;
    }

    const handleUpload = async (data) => {
        if (!date) { toast.error('Pls choose date') }
        if (!data) { toast.error('Pls select file') }
        if (date && data) {
            let flightDataShip1DAD = {};
            let flightDataShip2DAD = {};
            let flightDataShip1CXR = {};
            let flightDataShip2CXR = {};
            let flightDataVDH = {
                flightDate: new Date(date).toLocaleDateString('fr-FR'),
                rev: "",
                ship: "MO",
                flightData: []
            };
            let flightDataHUI = {
                flightDate: new Date(date).toLocaleDateString('fr-FR'),
                rev: "",
                ship: "MO",
                flightData: []
            };
            let flightDataVCL = {
                flightDate: new Date(date).toLocaleDateString('fr-FR'),
                rev: "",
                ship: "MO",
                flightData: []
            };
            let flightDataUIH = {
                flightDate: new Date(date).toLocaleDateString('fr-FR'),
                rev: "",
                ship: "MO",
                flightData: []
            };
            let flightDataTBB = {
                flightDate: new Date(date).toLocaleDateString('fr-FR'),
                rev: "",
                ship: "MO",
                flightData: []
            };
            let flightDataPXU = {
                flightDate: new Date(date).toLocaleDateString('fr-FR'),
                rev: "",
                ship: "MO",
                flightData: []
            };

            if (data.DAD.length > 0) {
                //handle for DAD
                //include notes into 1 cell
                let newDataDAD = data.DAD.slice(2);
                for (var i = 0; i < newDataDAD.length; i++) {
                    for (var j = 10; j < newDataDAD[i].length - 1; j++) {
                        if (newDataDAD[i][j] !== "") {
                            newDataDAD[i][9] = newDataDAD[i][9] + newDataDAD[i][j];
                            newDataDAD[i][j] = "";
                        }
                    }
                }
                //trim un-use cell
                for (i = 0; i < newDataDAD.length; i++) { newDataDAD[i] = newDataDAD[i].slice(0, 15); }
                //split into 2 ship
                let shipTime = { mo1: 3, mo2: 16, ev1: 5, ev2: 15 }
                let splitShip = handleSplitShip(newDataDAD, date, shipTime);
                flightDataShip1DAD = splitShip.ship1;
                flightDataShip2DAD = splitShip.ship2;
            }

            if (data.CXR.length > 0) {
                //handle for CXR
                //include notes into 1 cell
                let newDataCXR = data.CXR.slice(2);
                for (i = 0; i < newDataCXR.length; i++) {
                    for (j = 10; j < newDataCXR[i].length - 1; j++) {
                        if (newDataCXR[i][j] !== "") {
                            newDataCXR[i][9] = newDataCXR[i][9] + newDataCXR[i][j];
                            newDataCXR[i][j] = "";
                        }
                    }
                }
                //trim un-use cell
                for (i = 0; i < newDataCXR.length; i++) { newDataCXR[i] = newDataCXR[i].slice(0, 15); }
                //split into 2 ship
                let shipTime = { mo1: 6, mo2: 19, ev1: 8, ev2: 18 }
                let splitShip = handleSplitShip(newDataCXR, date, shipTime);
                flightDataShip1CXR = splitShip.ship1;
                flightDataShip2CXR = splitShip.ship2;
            }

            if (data.VDH.length > 0) {
                //include notes into 1 cell
                let newDataVDH = data.VDH.slice(2);
                for (i = 0; i < newDataVDH.length; i++) {
                    for (j = 10; j < newDataVDH[i].length - 1; j++) {
                        if (newDataVDH[i][j] !== "") {
                            newDataVDH[i][9] = newDataVDH[i][9] + newDataVDH[i][j];
                            newDataVDH[i][j] = "";
                        }
                    }
                }
                //trim un-use cell
                for (i = 0; i < newDataVDH.length; i++) { newDataVDH[i] = newDataVDH[i].slice(0, 15); }
                let rev = new Date().toLocaleDateString('fr-FR') + " Time " + new Date().toLocaleTimeString('fr-FR');
                flightDataVDH.rev = rev;
                flightDataVDH.flightData = newDataVDH;
            }

            if (data.HUI.length > 0) {
                //include notes into 1 cell
                let newDataHUI = data.HUI.slice(2);
                for (i = 0; i < newDataHUI.length; i++) {
                    for (j = 10; j < newDataHUI[i].length - 1; j++) {
                        if (newDataHUI[i][j] !== "") {
                            newDataHUI[i][9] = newDataHUI[i][9] + newDataHUI[i][j];
                            newDataHUI[i][j] = "";
                        }
                    }
                }
                //trim un-use cell
                for (i = 0; i < newDataHUI.length; i++) { newDataHUI[i] = newDataHUI[i].slice(0, 15); }
                let rev = new Date().toLocaleDateString('fr-FR') + " Time " + new Date().toLocaleTimeString('fr-FR');
                flightDataHUI.rev = rev;
                flightDataHUI.flightData = newDataHUI;
            }

            if (data.VCL.length > 0) {
                //include notes into 1 cell
                let newDataVCL = data.VCL.slice(2);
                for (i = 0; i < newDataVCL.length; i++) {
                    for (j = 10; j < newDataVCL[i].length - 1; j++) {
                        if (newDataVCL[i][j] !== "") {
                            newDataVCL[i][9] = newDataVCL[i][9] + newDataVCL[i][j];
                            newDataVCL[i][j] = "";
                        }
                    }
                }
                //trim un-use cell
                for (i = 0; i < newDataVCL.length; i++) { newDataVCL[i] = newDataVCL[i].slice(0, 15); }
                let rev = new Date().toLocaleDateString('fr-FR') + " Time " + new Date().toLocaleTimeString('fr-FR');
                flightDataVCL.rev = rev;
                flightDataVCL.flightData = newDataVCL;
            }

            if (data.UIH.length > 0) {
                //include notes into 1 cell
                let newDataUIH = data.UIH.slice(2);
                for (i = 0; i < newDataUIH.length; i++) {
                    for (j = 10; j < newDataUIH[i].length - 1; j++) {
                        if (newDataUIH[i][j] !== "") {
                            newDataUIH[i][9] = newDataUIH[i][9] + newDataUIH[i][j];
                            newDataUIH[i][j] = "";
                        }
                    }
                }
                //trim un-use cell
                for (i = 0; i < newDataUIH.length; i++) { newDataUIH[i] = newDataUIH[i].slice(0, 15); }
                let rev = new Date().toLocaleDateString('fr-FR') + " Time " + new Date().toLocaleTimeString('fr-FR');
                flightDataUIH.rev = rev;
                flightDataUIH.flightData = newDataUIH;
            }

            if (data.TBB.length > 0) {
                //include notes into 1 cell
                let newDataTBB = data.TBB.slice(2);
                for (i = 0; i < newDataTBB.length; i++) {
                    for (j = 10; j < newDataTBB[i].length - 1; j++) {
                        if (newDataTBB[i][j] !== "") {
                            newDataTBB[i][9] = newDataTBB[i][9] + newDataTBB[i][j];
                            newDataTBB[i][j] = "";
                        }
                    }
                }
                //trim un-use cell
                for (i = 0; i < newDataTBB.length; i++) { newDataTBB[i] = newDataTBB[i].slice(0, 15); }
                let rev = new Date().toLocaleDateString('fr-FR') + " Time " + new Date().toLocaleTimeString('fr-FR');
                flightDataTBB.rev = rev;
                flightDataTBB.flightData = newDataTBB;
            }

            if (data.PXU.length > 0) {
                //include notes into 1 cell
                let newDataPXU = data.PXU.slice(2);
                for (i = 0; i < newDataPXU.length; i++) {
                    for (j = 10; j < newDataPXU[i].length - 1; j++) {
                        if (newDataPXU[i][j] !== "") {
                            newDataPXU[i][9] = newDataPXU[i][9] + newDataPXU[i][j];
                            newDataPXU[i][j] = "";
                        }
                    }
                }
                //trim un-use cell
                for (i = 0; i < newDataPXU.length; i++) { newDataPXU[i] = newDataPXU[i].slice(0, 15); }
                let rev = new Date().toLocaleDateString('fr-FR') + " Time " + new Date().toLocaleTimeString('fr-FR');
                flightDataPXU.rev = rev;
                flightDataPXU.flightData = newDataPXU;
            }

            // post data to server
            let serverData = await flightPlantApi(flightDataShip1DAD, flightDataShip2DAD, flightDataShip1CXR, flightDataShip2CXR,
                flightDataVDH, flightDataHUI, flightDataVCL, flightDataUIH, flightDataTBB, flightDataPXU
            );
            if (+serverData.EC === 0) {
                toast.success(serverData.EM)
                handleClear();
            } else {
                toast.error(serverData.EM)
            }
        }
    }

    const handleFileUpload = (e) => {
        let fileTypes = ['application/vnd.ms-excel', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        let file = e.target.files[0];
        if (file && fileTypes.includes(file.type)) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const workbook = XLSX.read(event.target.result, { type: 'binary' });
                const sheetName = workbook.SheetNames;
                let sheetNameDAD = "";
                let sheetNameCXR = "";
                let sheetNameVDH = "";
                let sheetNameHUI = "";
                let sheetNameVCL = "";
                let sheetNameUIH = "";
                let sheetNameTBB = "";
                let sheetNamePXU = "";

                sheetName.map((individual, index) => {
                    if (individual.includes("DAD") && !individual.includes("DO")) { sheetNameDAD = individual; }
                    if (individual.includes("CXR") && !individual.includes("DO")) { sheetNameCXR = individual; }
                    if (individual.includes("VDH") && !individual.includes("DO")) { sheetNameVDH = individual; }
                    if (individual.includes("HUI") && !individual.includes("DO")) { sheetNameHUI = individual; }
                    if (individual.includes("VCL") && !individual.includes("DO")) { sheetNameVCL = individual; }
                    if (individual.includes("UIH") && !individual.includes("DO")) { sheetNameUIH = individual; }
                    if (individual.includes("TBB") && !individual.includes("DO")) { sheetNameTBB = individual; }
                    if (individual.includes("PXU") && !individual.includes("DO")) { sheetNamePXU = individual; }
                })

                let sheetData = { DAD: [], CXR: [], VDH: [], HUI: [], VCL: [], UIH: [], TBB: [], PXU: [] };
                if (sheetNameDAD !== "") {
                    const sheetDAD = workbook.Sheets[sheetNameDAD];
                    sheetData.DAD = XLSX.utils.sheet_to_json(sheetDAD, { header: 1 });
                    // set "" for undifined element in data
                    for (var i = 0; i < sheetData.DAD.length; i++) {
                        for (var j = 0; j < sheetData.DAD[i].length; j++) {
                            if (sheetData.DAD[i][j] === undefined) {
                                sheetData.DAD[i][j] = "";
                            }
                        }
                    }
                    for (i = 2; i < sheetData.DAD.length; i++) {
                        for (j = 0; j < sheetData.DAD[i].length; j++)
                            sheetData.DAD[i][j] = sheetData.DAD[i][j].trim();
                    }
                }

                if (sheetNameCXR !== "") {
                    const sheetCXR = workbook.Sheets[sheetNameCXR];
                    sheetData.CXR = XLSX.utils.sheet_to_json(sheetCXR, { header: 1 });
                    for (i = 0; i < sheetData.CXR.length; i++) {
                        for (j = 0; j < sheetData.CXR[i].length; j++) {
                            if (sheetData.CXR[i][j] === undefined) {
                                sheetData.CXR[i][j] = "";
                            }
                        }
                    }
                    for (i = 2; i < sheetData.CXR.length; i++) {
                        for (j = 0; j < sheetData.CXR[i].length; j++)
                            sheetData.CXR[i][j] = sheetData.CXR[i][j].trim();
                    }
                }

                if (sheetNameVDH !== "") {
                    const sheetVDH = workbook.Sheets[sheetNameVDH];
                    sheetData.VDH = XLSX.utils.sheet_to_json(sheetVDH, { header: 1 });
                    for (i = 0; i < sheetData.VDH.length; i++) {
                        for (j = 0; j < sheetData.VDH[i].length; j++) {
                            if (sheetData.VDH[i][j] === undefined) {
                                sheetData.VDH[i][j] = "";
                            }
                        }
                    }
                    for (i = 2; i < sheetData.VDH.length; i++) {
                        for (j = 0; j < sheetData.VDH[i].length; j++)
                            sheetData.VDH[i][j] = sheetData.VDH[i][j].trim();
                    }
                }

                if (sheetNameHUI !== "") {
                    const sheetHUI = workbook.Sheets[sheetNameHUI];
                    sheetData.HUI = XLSX.utils.sheet_to_json(sheetHUI, { header: 1 });
                    for (i = 0; i < sheetData.HUI.length; i++) {
                        for (j = 0; j < sheetData.HUI[i].length; j++) {
                            if (sheetData.HUI[i][j] === undefined) {
                                sheetData.HUI[i][j] = "";
                            }
                        }
                    }
                    for (i = 2; i < sheetData.HUI.length; i++) {
                        for (j = 0; j < sheetData.HUI[i].length; j++)
                            sheetData.HUI[i][j] = sheetData.HUI[i][j].trim();
                    }
                }

                if (sheetNameVCL !== "") {
                    const sheetVCL = workbook.Sheets[sheetNameVCL];
                    sheetData.VCL = XLSX.utils.sheet_to_json(sheetVCL, { header: 1 });
                    for (i = 0; i < sheetData.VCL.length; i++) {
                        for (j = 0; j < sheetData.VCL[i].length; j++) {
                            if (sheetData.VCL[i][j] === undefined) {
                                sheetData.VCL[i][j] = "";
                            }
                        }
                    }
                    for (i = 2; i < sheetData.VCL.length; i++) {
                        for (j = 0; j < sheetData.VCL[i].length; j++)
                            sheetData.VCL[i][j] = sheetData.VCL[i][j].trim();
                    }
                }

                if (sheetNameUIH !== "") {
                    const sheetUIH = workbook.Sheets[sheetNameUIH];
                    sheetData.UIH = XLSX.utils.sheet_to_json(sheetUIH, { header: 1 });
                    for (i = 0; i < sheetData.UIH.length; i++) {
                        for (j = 0; j < sheetData.UIH[i].length; j++) {
                            if (sheetData.UIH[i][j] === undefined) {
                                sheetData.UIH[i][j] = "";
                            }
                        }
                    }
                    for (i = 2; i < sheetData.UIH.length; i++) {
                        for (j = 0; j < sheetData.UIH[i].length; j++)
                            sheetData.UIH[i][j] = sheetData.UIH[i][j].trim();
                    }
                }

                if (sheetNameTBB !== "") {
                    const sheetTBB = workbook.Sheets[sheetNameTBB];
                    sheetData.TBB = XLSX.utils.sheet_to_json(sheetTBB, { header: 1 });
                    for (i = 0; i < sheetData.TBB.length; i++) {
                        for (j = 0; j < sheetData.TBB[i].length; j++) {
                            if (sheetData.TBB[i][j] === undefined) {
                                sheetData.TBB[i][j] = "";
                            }
                        }
                    }
                    for (i = 2; i < sheetData.TBB.length; i++) {
                        for (j = 0; j < sheetData.TBB[i].length; j++)
                            sheetData.TBB[i][j] = sheetData.TBB[i][j].trim();
                    }
                }

                if (sheetNamePXU !== "") {
                    const sheetPXU = workbook.Sheets[sheetNamePXU];
                    sheetData.PXU = XLSX.utils.sheet_to_json(sheetPXU, { header: 1 });
                    for (i = 0; i < sheetData.PXU.length; i++) {
                        for (j = 0; j < sheetData.PXU[i].length; j++) {
                            if (sheetData.PXU[i][j] === undefined) {
                                sheetData.PXU[i][j] = "";
                            }
                        }
                    }
                    for (i = 2; i < sheetData.PXU.length; i++) {
                        for (j = 0; j < sheetData.PXU[i].length; j++)
                            sheetData.PXU[i][j] = sheetData.PXU[i][j].trim();
                    }
                }

                setData(sheetData);
            };
            reader.readAsBinaryString(file);
        } else {
            toast.error('Pls select only excel file')
        }
    }

    return (
        <div>
            <div className='container'>
                <div className='title'><strong>Upload flight plan</strong></div>
                <div className='flight-container col-12 col-sm-12'>
                    <label > Choose date  :</label>
                    <DatePicker
                        selected={date}
                        onChange={date => setDate(date)}
                        minDate={user.account.group === "admin" ? "" : new Date().setDate(new Date().getDate() - 1)}
                        maxDate={new Date().setDate(new Date().getDate() + 1)}
                        dateFormat="dd/MM/YYYY"
                    />

                    <input
                        type='file'
                        className="form-control col-sm-4"
                        id="file"
                        // accept={SheetJSFT}
                        onChange={handleFileUpload}
                    />

                    <button className='btn'
                        onClick={() => handleClear()}>Clear</button>

                    <button className={date && data ? 'btn active' : 'btn'}
                        onClick={() => handleUpload(data)}>Upload</button>

                </div >
            </div>

            {(data) && (
                <div className='plan-container col-12 col-sm-12'>
                    <span>Choose station :</span>
                    <select
                        className='form-select'
                        style={{ width: '20%' }}
                        onChange={(event) => setShowStation(event.target.value)}
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
                </div>
            )}

            <div className='planBody-container'>
                {(data && showStation === "DAD") && (
                    <table className='table-responsive table-striped table-bordered' responsive>
                        <tbody>
                            {data.DAD.map((individualData, index) => (
                                <tr key={index} >
                                    {individualData.map((key) => (
                                        <td key={key}>{key}</td>
                                    ))
                                    }
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {(data && showStation === "CXR") && (
                    <table className='table-responsive table-striped table-bordered' responsive>
                        <tbody>
                            {data.CXR.map((individualData, index) => (
                                <tr key={index} >
                                    {individualData.map((key) => (
                                        <td key={key}>{key}</td>
                                    ))
                                    }
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {(data && showStation === "VDH") && (
                    <table className='table-responsive table-striped table-bordered' responsive>
                        <tbody>
                            {data.VDH.map((individualData, index) => (
                                <tr key={index} >
                                    {individualData.map((key) => (
                                        <td key={key}>{key}</td>
                                    ))
                                    }
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {(data && showStation === "HUI") && (
                    <table className='table-responsive table-striped table-bordered' responsive>
                        <tbody>
                            {data.HUI.map((individualData, index) => (
                                <tr key={index} >
                                    {individualData.map((key) => (
                                        <td key={key}>{key}</td>
                                    ))
                                    }
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {(data && showStation === "VCL") && (
                    <table className='table-responsive table-striped table-bordered' responsive>
                        <tbody>
                            {data.VCL.map((individualData, index) => (
                                <tr key={index} >
                                    {individualData.map((key) => (
                                        <td key={key}>{key}</td>
                                    ))
                                    }
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {(data && showStation === "UIH") && (
                    <table className='table-responsive table-striped table-bordered' responsive>
                        <tbody>
                            {data.UIH.map((individualData, index) => (
                                <tr key={index} >
                                    {individualData.map((key) => (
                                        <td key={key}>{key}</td>
                                    ))
                                    }
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {(data && showStation === "TBB") && (
                    <table className='table-responsive table-striped table-bordered' responsive>
                        <tbody>
                            {data.TBB.map((individualData, index) => (
                                <tr key={index} >
                                    {individualData.map((key) => (
                                        <td key={key}>{key}</td>
                                    ))
                                    }
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {(data && showStation === "PXU") && (
                    <table className='table-responsive table-striped table-bordered' responsive>
                        <tbody>
                            {data.PXU.map((individualData, index) => (
                                <tr key={index} >
                                    {individualData.map((key) => (
                                        <td key={key}>{key}</td>
                                    ))
                                    }
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

        </div>
    )
}

export default FlightPlan;

