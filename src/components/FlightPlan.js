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

    const handleClear = () => {
        setDate(null);
        setData(null);
        document.getElementById('file').value = '';
    }

    const handleSplitShip = (newData, date) => {

        let rev = new Date().toLocaleDateString('fr-FR') + " Time " + new Date().toLocaleTimeString('fr-FR');
        //get flight data for morning ship
        let flightShip1 = {
            flightDate: new Date(date).toLocaleDateString('fr-FR'),
            rev: rev,
            ship: "MO",
            flightData: [],
        }
        let elementNo1 = 0;
        console.log(parseInt(newData[1][7].split(":")[0], 10))
        for (var i = 0; i < newData.length; i++) {
            let arrHour = parseInt(newData[i][7].split(":")[0], 10);
            let depHour = parseInt(newData[i][8].split(":")[0], 10);
            if (isNaN(arrHour)) { //non arrHour
                if (depHour >= 3 && depHour <= 16 && newData[i][8].includes("+") === false) {
                    flightShip1.flightData[elementNo1] = newData[i];
                    elementNo1++;
                }
            } else { // has arrHour
                if (arrHour >= 3 && arrHour <= 16 && newData[i][7].includes("+") === false) { //arr 3h - 17h on today
                    flightShip1.flightData[elementNo1] = newData[i];
                    elementNo1++;
                } else { //arr out 3h - 17h, check dep
                    if (newData[i][8].includes("+") === false && depHour >= 3 && depHour <= 16) {
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
                    if (depHour < 5) {
                        flightShip2.flightData[elementNo2] = newData[i];
                        elementNo2++;
                    }
                } else { // dep on today
                    if (depHour >= 15) {
                        flightShip2.flightData[elementNo2] = newData[i];
                        elementNo2++;
                    }
                }
            } else { // has arrHour
                if (newData[i][7].includes("+")) { //arr on next day
                    if (arrHour < 5) {
                        flightShip2.flightData[elementNo2] = newData[i];
                        elementNo2++;
                    }
                } else { //arr on today
                    if (arrHour >= 15) { //arr on 15 - 24h
                        flightShip2.flightData[elementNo2] = newData[i];
                        elementNo2++;
                    } else { //arr out 15 - 24h
                        if (newData[i][8].includes("+")) { // dep on next day
                            if (depHour < 5) {
                                flightShip2.flightData[elementNo2] = newData[i];
                                elementNo2++;
                            }
                        } else { // dep on today
                            if (depHour >= 15) {
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

            //include notes into 1 cell
            let newData = data.slice(2);
            for (var i = 0; i < newData.length; i++) {
                for (let j = 10; j < newData[i].length - 1; j++) {
                    if (newData[i][j] !== "") {
                        newData[i][9] = newData[i][9] + newData[i][j];
                        newData[i][j] = "";
                    }
                }
            }

            //trim un-use cell
            for (var i = 0; i < newData.length; i++) { newData[i] = newData[i].slice(0, 15); }

            //split into 2 ship
            let splitShip = handleSplitShip(newData, date);
            let flightDataShip1 = splitShip.ship1;
            let flightDataShip2 = splitShip.ship2;

            // post data to server
            let serverData = await flightPlantApi(flightDataShip1, flightDataShip2);
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
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                // set "" for undifined element in data

                for (var i = 0; i < sheetData.length; i++) {
                    for (let j = 0; j < sheetData[i].length; j++) {
                        if (sheetData[i][j] === undefined) {
                            sheetData[i][j] = "";
                        }
                    }
                }
                for (let i = 2; i < sheetData.length; i++) {
                    for (let j = 0; j < sheetData[i].length; j++)
                        sheetData[i][j] = sheetData[i][j].trim();
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

            {data && (
                <div className='table-responsive'>
                    <table className='table-responsive table-striped table-bordered' responsive>
                        <tbody>
                            {data.map((individualData, index) => (
                                <tr key={index} >
                                    {data[index].map((key) => (
                                        <td key={key}>{key}</td>
                                    ))
                                    }
                                </tr>
                            ))}
                        </tbody>
                    </table>

                </div>
            )}

        </div>
    )
}

export default FlightPlan;

