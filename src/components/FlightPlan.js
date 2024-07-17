import React, { useState } from 'react';
import './FlightPlan.scss';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { flightPlantApi } from '../services/UserService';

function FlightPlan() {
    const [date, setDate] = useState(null);
    const [data, setData] = useState(null);
    const [showStation, setShowStation] = useState("DAD");

    const handleClear = () => {
        setDate(null);
        setData(null);
        document.getElementById('file').value = '';
    }

    const handleSplitShip = (newData, date, shipTime) => {

        let rev = new Date().toLocaleDateString('fr-FR') + " Time " + new Date().toLocaleTimeString('fr-FR');
        //get flight data for morning ship
        let flightShip1 = {
            flightDate: new Date(date).toLocaleDateString('fr-FR'),
            rev: rev,
            ship: "MO",
            flightData: [],
        }
        let elementNo1 = 0;
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
            //handle for DAD
            //include notes into 1 cell
            let newDataDAD = data.DAD.slice(2);
            for (var i = 0; i < newDataDAD.length; i++) {
                for (let j = 10; j < newDataDAD[i].length - 1; j++) {
                    if (newDataDAD[i][j] !== "") {
                        newDataDAD[i][9] = newDataDAD[i][9] + newDataDAD[i][j];
                        newDataDAD[i][j] = "";
                    }
                }
            }
            //trim un-use cell
            for (var i = 0; i < newDataDAD.length; i++) { newDataDAD[i] = newDataDAD[i].slice(0, 15); }
            //split into 2 ship
            let shipTime = { mo1: 3, mo2: 16, ev1: 5, ev2: 15 }
            let splitShip = handleSplitShip(newDataDAD, date, shipTime);
            let flightDataShip1DAD = splitShip.ship1;
            let flightDataShip2DAD = splitShip.ship2;

            //handle for CXR
            //include notes into 1 cell
            let newDataCXR = data.CXR.slice(2);
            for (var i = 0; i < newDataCXR.length; i++) {
                for (let j = 10; j < newDataCXR[i].length - 1; j++) {
                    if (newDataCXR[i][j] !== "") {
                        newDataCXR[i][9] = newDataCXR[i][9] + newDataCXR[i][j];
                        newDataCXR[i][j] = "";
                    }
                }
            }
            //trim un-use cell
            for (var i = 0; i < newDataCXR.length; i++) { newDataCXR[i] = newDataCXR[i].slice(0, 15); }
            //split into 2 ship
            shipTime = { mo1: 6, mo2: 19, ev1: 8, ev2: 18 }
            splitShip = handleSplitShip(newDataCXR, date, shipTime);
            let flightDataShip1CXR = splitShip.ship1;
            let flightDataShip2CXR = splitShip.ship2;

            // post data to server
            let serverData = await flightPlantApi(flightDataShip1DAD, flightDataShip2DAD, flightDataShip1CXR, flightDataShip2CXR);
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
                const sheetNameDAD = workbook.SheetNames[0];
                const sheetNameCXR = workbook.SheetNames[1];
                const sheetDAD = workbook.Sheets[sheetNameDAD];
                const sheetCXR = workbook.Sheets[sheetNameCXR];
                const sheetData = { DAD: [], CXR: [] };
                sheetData.DAD = XLSX.utils.sheet_to_json(sheetDAD, { header: 1 });
                sheetData.CXR = XLSX.utils.sheet_to_json(sheetCXR, { header: 1 });

                // set "" for undifined element in data
                for (var i = 0; i < sheetData.DAD.length; i++) {
                    for (var j = 0; j < sheetData.DAD[i].length; j++) {
                        if (sheetData.DAD[i][j] === undefined) {
                            sheetData.DAD[i][j] = "";
                        }
                    }
                }
                for (var i = 2; i < sheetData.DAD.length; i++) {
                    for (var j = 0; j < sheetData.DAD[i].length; j++)
                        sheetData.DAD[i][j] = sheetData.DAD[i][j].trim();
                }

                for (var i = 0; i < sheetData.CXR.length; i++) {
                    for (var j = 0; j < sheetData.CXR[i].length; j++) {
                        if (sheetData.CXR[i][j] === undefined) {
                            sheetData.CXR[i][j] = "";
                        }
                    }
                }
                for (var i = 2; i < sheetData.CXR.length; i++) {
                    for (var j = 0; j < sheetData.CXR[i].length; j++)
                        sheetData.CXR[i][j] = sheetData.CXR[i][j].trim();
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
                        minDate={new Date().setDate(new Date().getDate() - 1)}
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
                    </select>
                </div>
            )}

            <div className='planBody-container'>
                {(data && showStation === "DAD") && (
                    <table className='table-responsive table-striped table-bordered' responsive>
                        <tbody>
                            {data.DAD.map((individualData, index) => (
                                <tr key={index} >
                                    {data.DAD[index].map((key) => (
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
                                    {data.CXR[index].map((key) => (
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

