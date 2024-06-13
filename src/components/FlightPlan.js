import React, { useState } from 'react';
import './FlightPlan.scss';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';

function FlightPlan() {
    const [startDate, setStartDate] = useState(null);
    const [data, setData] = useState(null);

    const handleClear = () => {
        setStartDate(null);
        setData(null);
        document.getElementById('file').value = '';
    }

    const handleChange = () => {

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
                for (let i = 0; i < sheetData.length; i++) {
                    for (let j = 0; j < sheetData[i].length; j++) {
                        if (sheetData[i][j] === undefined) {
                            sheetData[i][j] = "";
                        }
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
        <div className='container'>
            <div className='title'><strong>Upload flight plan</strong></div>
            <div className='flight-container col-12 col-sm-12'>
                <label > Choose date  :</label>
                <DatePicker
                    selected={startDate}
                    onChange={date => setStartDate(date)}
                    minDate={new Date().setDate(new Date().getDate() - 1)}
                    maxDate={new Date().setDate(new Date().getDate() + 1)}
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

                <button className={startDate && data ? 'btn active' : 'btn'}
                    onClick={() => handleChange()}>Upload</button>

            </div >

            {data && (
                <div className='table-responsive'>
                    <table className='table table-striped table-bordered' responsive >
                        <tbody>
                            {data.map((individualData, index) => (
                                <tr key={index}>
                                    {data[index].map((key) => (
                                        <th key={key}>{key}</th>
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

