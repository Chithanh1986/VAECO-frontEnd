import React, { useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import './TimeKeeping.scss';
import { toast } from 'react-toastify';
import { getPowerData, searchApi } from '../services/UserService';
let user = null;

const TimeKeeping = () => {
    const [startDate, setStartDate] = useState();
    const [reportData, setReportData] = useState();
    const [searchValue, setSearchValue] = useState("")

    const handleClear = () => {
        setStartDate();
        user = null;
        setSearchValue("");
    }

    const handleLoadReport = async () => {
        let date = startDate.toLocaleDateString('fr-FR').split("/");
        let response = await searchApi(searchValue);
        if (response && response.EC === 0) {
            user = response.DT;
            let timeData = [];
            for (var i = 1; i <= 31; i++) {
                let j = i.toString();
                if (j.length === 1) { j = "0" + j; }
                let getDate = j + "/" + date[1] + "/" + date[2];
                let serverData = await getPowerData(getDate);
                if (serverData && serverData.EC === 0) {
                    let powerData = serverData.DT;
                    let hours = "";
                    let fromTo = "";
                    let type = "";
                    for (var k = 0; k < powerData.length; k++) {
                        powerData[k].map((item, index) => {
                            if (item.ID === user.vae_id) {
                                if (hours === "") {
                                    hours = item.hours;
                                } else {
                                    if (item.hours !== "") { hours = hours + ", " + item.hours; }
                                }

                                if (fromTo === "") {
                                    fromTo = item.fromTo;
                                } else {
                                    if (item.fromTo !== "") { fromTo = fromTo + ", " + item.fromTo; }
                                }

                                if (type === "") {
                                    type = item.type;
                                } else {
                                    if (item.type !== "") { type = type + ", " + item.type; }
                                }
                            }
                        })
                    }
                    if (hours === "") {
                        timeData.push({
                            hours: type,
                            fromTo: ""
                        })
                    } else {
                        timeData.push({
                            hours: hours,
                            fromTo: fromTo
                        })
                    }
                } else {
                    timeData.push({
                        hours: "",
                        fromTo: ""
                    })
                }
            }
            setReportData(timeData);
        } else {
            toast.error(response.EM)
        }
    }

    return (
        <div>
            <div className='header-container'>
                <>Report month :</>
                <DatePicker
                    selected={startDate}
                    onChange={date => setStartDate(date)}
                    minDate={new Date().setDate(new Date().getDate() - 365)}
                    maxDate={new Date().setDate(new Date().getDate())}
                    dateFormat="MM/YYYY"
                />
                <>-  Report user :</>
                <input
                    type='text'
                    placeholder='Vaeco user or vaeco id'
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)} />
                <button className="btn"
                    onClick={() => handleClear()}>Clear</button>
                <button className={startDate && searchValue !== "" ? 'btn active' : 'btn'}
                    onClick={() => {
                        if (startDate && searchValue !== "") {
                            handleLoadReport()
                        } else {
                            toast.error("Input data required")
                        }
                    }}>Load report</button>
            </div>

            <div className='users-container'>
                <div>
                    <h1>Report table</h1>
                </div>

                <div className='station-container'>
                    <table className="table-bordered " responsive>
                        <thead>
                            <tr>
                                <th scope="col">No</th>
                                <th scope="col">Full name</th>
                                <th scope="col">Vaeco ID</th>
                                <th>Type</th>
                                <th >1</th> <th scope="col">2</th> <th scope="col">3</th> <th scope="col">4</th> <th scope="col">5</th>
                                <th scope="col">6</th> <th scope="col">7</th> <th scope="col">8</th> <th scope="col">9</th> <th scope="col">10</th>
                                <th scope="col">11</th> <th scope="col">12</th> <th scope="col">13</th> <th scope="col">14</th> <th scope="col">15</th>
                                <th scope="col">16</th> <th scope="col">17</th> <th scope="col">18</th> <th scope="col">19</th> <th scope="col">20</th>
                                <th scope="col">21</th> <th scope="col">22</th> <th scope="col">23</th> <th scope="col">24</th> <th scope="col">25</th>
                                <th scope="col">26</th> <th scope="col">27</th> <th scope="col">28</th> <th scope="col">29</th> <th scope="col">30</th>
                                <th scope="col">31</th>
                            </tr>
                        </thead>

                        <tbody>
                            {(user && reportData) ?
                                <>
                                    <tr>
                                        <td rowSpan="2">1</td>
                                        <td rowSpan="2">{user.surname} {user.name}</td>
                                        <td rowSpan="2">{user.vae_id}</td>
                                        <td>Hours</td>
                                        {reportData.map((individual, index) => <td>{individual.hours}</td>)}
                                    </tr>
                                    <tr>
                                        <td>Note</td>
                                        {reportData.map((individual, index) => <td className={individual.fromTo !== "" && "cell1"}>{individual.fromTo}</td>)}
                                    </tr>
                                </>
                                :
                                <><tr><td colSpan={38} >Not found users</td></tr></>
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default TimeKeeping;