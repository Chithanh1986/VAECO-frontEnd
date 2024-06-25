import React, { useState } from 'react';
import './Home.scss';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { loadPlanApi } from '../services/UserService';



// const Home = () => {
//     const data = [
//         {
//             employeeId: '01',
//             name: 'John Doe',
//             email: 'johndoe@email.com',
//             position: 'Frontend Developer',
//         },
//         {
//             employeeId: '02',
//             name: 'Sara',
//             email: 'sara@email.com',
//             position: 'HR Executive',
//         },
//         {
//             employeeId: '03',
//             name: 'Mike',
//             email: 'mike@email.com',
//             position: 'Backend Developer',
//         },
//     ]
//     const [employeeData, setEmployeeData] = useState(data)

//     const onChangeInput = (e, employeeId) => {
//         const { name, value } = e.target

//         const editData = employeeData.map((item) =>
//             item.employeeId === employeeId && name ? { ...item, [name]: value } : item
//         )

//         setEmployeeData(editData)
//     }

//     return (
//         <div className="container">
//             <h1 className="title">ReactJS Editable Table</h1>
//             <table>
//                 <thead>
//                     <tr>
//                         <th>Name</th>
//                         <th>Email</th>
//                         <th>Position</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {employeeData.map(({ employeeId, name, email, position }) => (
//                         <tr key={employeeId}>
//                             <td>
//                                 <input
//                                     name="name"
//                                     value={name}
//                                     type="text"
//                                     onChange={(e) => onChangeInput(e, employeeId)}
//                                     placeholder="Type Name"
//                                 />
//                             </td>
//                             <td>
//                                 <input
//                                     name="email"
//                                     value={email}
//                                     type="text"
//                                     onChange={(e) => onChangeInput(e, employeeId)}
//                                     placeholder="Type Email"
//                                 />
//                             </td>
//                             <td>
//                                 <input
//                                     name="position"
//                                     type="text"
//                                     value={position}
//                                     onChange={(e) => onChangeInput(e, employeeId)}
//                                     placeholder="Type Position"
//                                 />
//                             </td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     )
// }

// export default Home

const Home = () => {
    const [date, setDate] = useState(null);
    const [ship, setShip] = useState("MO");
    const [flightPlan, setFlightPlan] = useState(null);
    const [rev, setRev] = useState(null);

    const handleClear = () => {
        setDate(null);
        setFlightPlan(null);
        setRev(null);
    }

    const handleLoad = async () => {
        if (date) {
            let serverData = await loadPlanApi(new Date(date).toLocaleDateString('fr-FR'), ship);
            console.log(serverData.DT.planData)
            if (+serverData.EC === 0) {
                let serverPlan = [];
                serverData.DT.planData.map((individualData, index) => {
                    serverPlan[index] = {
                        STT: index + 1,
                        AL: individualData[1],
                        ACReg: individualData[2],
                        ACType: individualData[3],
                        ArrNo: individualData[4],
                        DepNo: individualData[5],
                        Route: individualData[6],
                        ETA: individualData[7],
                        ETD: individualData[8],
                        Remark: individualData[9],
                        Parking: individualData[10],
                        CRS1: individualData[11],
                        MECH1: individualData[12],
                        CRS2: individualData[13],
                        MECH2: individualData[14],
                    };
                }
                )
                setFlightPlan(serverPlan);
                setRev(serverData.DT.rev);
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

            {flightPlan && (
                <div className='table-responsive'>
                    <h3>Rev: {rev}</h3>
                    <table className='table-responsive table-striped table-bordered' responsive>
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
                                            style={{ width: Parking === "" ? 5 + 'ch' : Parking.length + 1 + 'ch' }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            name="CRS1"
                                            value={CRS1}
                                            type="text"
                                            onChange={(e) => onChangeInput(e, STT)}
                                            style={{ width: CRS1 === "" ? 5 + 'ch' : CRS1.length + 1 + 'ch' }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            name="MECH1"
                                            value={MECH1}
                                            type="text"
                                            onChange={(e) => onChangeInput(e, STT)}
                                            style={{ width: MECH1 === "" ? 5 + 'ch' : MECH1.length + 1 + 'ch' }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            name="CRS2"
                                            value={CRS2}
                                            type="text"
                                            onChange={(e) => onChangeInput(e, STT)}
                                            style={{ width: CRS2 === "" ? 5 + 'ch' : CRS2.length + 1 + 'ch' }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            name="MECH2"
                                            value={MECH2}
                                            type="text"
                                            onChange={(e) => onChangeInput(e, STT)}
                                            style={{ width: MECH2 === "" ? 5 + 'ch' : MECH2.length + 1 + 'ch' }}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

        </div >
    )
}


export default Home;

