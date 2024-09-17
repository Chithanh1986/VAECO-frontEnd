import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import './PhaseCheck.scss';
import { searchPointCode, saveEA, loadEA } from '../services/UserService';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

const PhaseCheck = () => {
    const [date, setDate] = useState(null);
    const [rev, setRev] = useState();
    const [title, setTitle] = useState("");
    const [pointCode, setPointCode] = useState();
    const [structure, setStructure] = useState();
    const [engRun, setEngRun] = useState();
    const [zoneAvi, setZoneAvi] = useState();
    const [zone34567, setZone34567] = useState();
    const [zone128, setZone128] = useState();
    const [general, setGeneral] = useState();

    useEffect(() => {
        defaultValue();
    }, [])

    const defaultValue = () => {
        setRev(new Date().toLocaleDateString('fr-FR') + " Time " + new Date().toLocaleTimeString('fr-FR'))
        setStructure({ job: "STRUCTURE", name: "", ID: "", auth: "", dep: "", other: "", remark: "" });
        //set eng run
        let defaultData = [];
        for (var i = 0; i <= 1; i++) {
            defaultData.push({ job: "ENGRUN", name: "", ID: "", auth: "", dep: "", other: "", remark: "" });
        }
        setEngRun(defaultData);
        //set avionic
        defaultData = [];
        for (i = 0; i <= 3; i++) {
            defaultData.push({ job: "AVIONIC", name: "", ID: "", auth: "", dep: "", other: "", remark: "" });
        }
        defaultData[0].other = "Đón/ kéo tàu";
        defaultData[1].other = "Đón/ kéo tàu";
        setZoneAvi(defaultData);
        //set zone 34567
        defaultData = [];
        for (i = 0; i <= 5; i++) {
            defaultData.push({ job: "ZONE34+567", name: "", ID: "", auth: "", dep: "", other: "", remark: "" });
        }
        defaultData[0].other = "1. Giám sát gián tiếp CRS/ủy quyền: 2. Kiểm tra ban đầu";
        defaultData[1].other = "Cảnh giới phải, đặt chèn, chóp";
        defaultData[2].other = "1.Cảnh giới đuôi, đặt chèn, chóp 2.Cảnh giới Test F/Ctl";
        defaultData[3].other = "Cảnh giới trái, đặt chèn, chóp";
        setZone34567(defaultData);
        //set zone 128
        defaultData = [];
        for (i = 0; i <= 5; i++) {
            defaultData.push({ job: "ZONE128+CABIN+CLEAN", name: "", ID: "", auth: "", dep: "", other: "", remark: "" });
        }
        defaultData[0].other = "1.Giám sát gián tiếp CRS/ủy quyền: 2. Disarm/Arm Emergency Exit 3. RII/Critical Task với zone 34";
        defaultData[1].other = "Làm term/weekly (nếu có)";
        defaultData[2].other = "Disarm/Arm Emergency Exit";
        defaultData[3].other = "Kéo thang 3.5m";
        setZone128(defaultData);
        //set general
        defaultData = [];
        for (i = 0; i <= 3; i++) {
            defaultData.push({ job: "", name: "", ID: "", auth: "", dep: "", other: "", remark: "" });
        }
        defaultData[0].job = "FOREMAN";
        defaultData[1].job = "CRSC";
        defaultData[2].job = "PPC";
        defaultData[3].job = "STORE";
        defaultData[2].other = "Gửi mail các đơn vị, xác định và báo thời gian, bến (nếu cần) cho các Zone.";
        setGeneral(defaultData);
    }

    const handleClear = () => {
        setDate(null);
        defaultValue();
    }

    const handleLoad = async () => {
        if (date) {
            let serverData = await loadEA(new Date(date).toLocaleDateString('fr-FR'));
            if (+serverData.EC === 0) {
                setRev(serverData.DT.rev);
                setTitle(serverData.DT.title);
                let phaseData = serverData.DT.phaseData;
                setGeneral(phaseData.slice(0, 4));
                setZone128(phaseData.slice(4, 10));
                setZone34567(phaseData.slice(10, 16));
                setZoneAvi(phaseData.slice(16, 20));
                setEngRun(phaseData.slice(20, 22));
                setStructure(phaseData[22]);
            } else {
                toast.error(serverData.EM)
            }
        } else {
            toast.error('Pls select date')
        }
    }

    const handleSave = async () => {
        let phase = {
            phaseDate: new Date(date).toLocaleDateString('fr-FR'),
            title: title,
            rev: new Date().toLocaleDateString('fr-FR') + " Time " + new Date().toLocaleTimeString('fr-FR'),
            ship: "EA",
            phaseData: [],
            powerSource: []
        };
        general.map((individual, index) => { phase.phaseData.push(individual) })
        zone128.map((individual, index) => { phase.phaseData.push(individual) })
        zone34567.map((individual, index) => { phase.phaseData.push(individual) })
        zoneAvi.map((individual, index) => { phase.phaseData.push(individual) })
        engRun.map((individual, index) => { phase.phaseData.push(individual) })
        phase.phaseData.push(structure);

        let checkPC = false;
        let msgPC = "";
        phase.phaseData.map((individual, index) => {
            if (individual.name && individual.name !== "") {
                let find = false;
                phase.powerSource.map((item, i) => {
                    if (individual.name === item.name) {
                        find = true;
                    }
                })
                if (!find) {
                    let pointHour = calculatePoint(individual);
                    checkPC = pointHour.code;
                    msgPC = pointHour.msg;
                    phase.powerSource.push({
                        STT: "",
                        ID: individual.ID,
                        name: individual.name,
                        work: 1,
                        WPoint: pointHour.point,
                        WHour: pointHour.hour,
                        hours: 8,
                        type: "",
                        fromTo: "EA"
                    })
                }
            }
        })
        if (checkPC) {
            let resData = await saveEA(phase);
            if (resData.EC === 0) {
                toast.success(resData.EM)
            } else {
                toast.error(resData.EM)
            }
        } else {
            toast.error(msgPC);
        }
    }

    const calculatePoint = (individual) => {
        let point = 0;
        let hour = 0;
        let code = true;
        let msg = "";
        pointCode.map((item, i) => {
            if (individual.job === item.code || individual.auth === item.code) {
                point = (+item.CRSWPoint) + (+item.MECHWPoint);
                hour = (+item.CRSWHour) + (+item.MECHWHour);
            }
        })
        if (point === 0) {
            code = false;
            msg = "Not found job: " + individual.job + " or auth: " + individual.auth;
        }
        return ({ code: code, msg: msg, point: point, hour: hour });
    }

    const onchangeGeneral = (value, name, index) => {
        const editData = general.map((item, i) =>
            i === index && name ? { ...item, [name]: value.toUpperCase() } : item
        )
        setGeneral(editData);
    }

    const onchangeZone128 = (value, name, index) => {
        const editData = zone128.map((item, i) =>
            i === index && name ? { ...item, [name]: value.toUpperCase() } : item
        )
        setZone128(editData);
    }

    const onchangeZone34 = (value, name, index) => {
        const editData = zone34567.map((item, i) =>
            i === index && name ? { ...item, [name]: value.toUpperCase() } : item
        )
        setZone34567(editData);
    }

    const onchangeZoneAvi = (value, name, index) => {
        const editData = zoneAvi.map((item, i) =>
            i === index && name ? { ...item, [name]: value.toUpperCase() } : item
        )
        setZoneAvi(editData);
    }

    const onchangeEngRun = (value, name, index) => {
        const editData = engRun.map((item, i) =>
            i === index && name ? { ...item, [name]: value.toUpperCase() } : item
        )
        setEngRun(editData);
    }

    const onchangeStructure = (value, name) => {
        let editData = { ...structure, [name]: value.toUpperCase() };
        setStructure(editData);
    }

    const handleSetDate = async (date) => {
        let serverData = await searchPointCode("EA");
        if (serverData && serverData.EC === 0) {
            setPointCode(serverData.DT);
        } else {
            toast.error(serverData.EM)
        }
        setDate(date);
    }

    const handleExport = () => {
        if (date) {
            let exportData = [
                ["Title", title],
                ["Rev", rev],
                ["JOB", "NAME", "VAE ID", "AUTH.", "DEP.", "OTHER JOBS", "REMARK"]
            ]
            general.map((individual, index) => {
                exportData.push([
                    individual.job, individual.name, individual.ID, individual.auth, individual.dep, individual.other, individual.remark
                ])
            })
            zone128.map((individual, index) => {
                exportData.push([
                    individual.job, individual.name, individual.ID, individual.auth, individual.dep, individual.other, individual.remark
                ])
            })
            zone34567.map((individual, index) => {
                exportData.push([
                    individual.job, individual.name, individual.ID, individual.auth, individual.dep, individual.other, individual.remark
                ])
            })
            zoneAvi.map((individual, index) => {
                exportData.push([
                    individual.job, individual.name, individual.ID, individual.auth, individual.dep, individual.other, individual.remark
                ])
            })
            engRun.map((individual, index) => {
                exportData.push([
                    individual.job, individual.name, individual.ID, individual.auth, individual.dep, individual.other, individual.remark
                ])
            })
            exportData.push([
                structure.job, structure.name, structure.ID, structure.auth, structure.dep, structure.other, structure.remark
            ])
            const worksheet = XLSX.utils.aoa_to_sheet(exportData);
            let merge = [
                { s: { r: 0, c: 1 }, e: { r: 0, c: 6 } },
                { s: { r: 1, c: 1 }, e: { r: 1, c: 6 } },
                { s: { r: 7, c: 0 }, e: { r: 12, c: 0 } },
                { s: { r: 13, c: 0 }, e: { r: 18, c: 0 } },
                { s: { r: 19, c: 0 }, e: { r: 22, c: 0 } },
                { s: { r: 23, c: 0 }, e: { r: 24, c: 0 } }
            ]
            worksheet["!merges"] = merge;
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Dates");
            XLSX.writeFile(workbook, "phaseCheck.xlsx");
        } else {
            toast.error("Please select date")
        }
    }

    return (
        <>
            <div className="header-container">
                <label >Choose date :</label>
                <DatePicker
                    selected={date}
                    onChange={date => handleSetDate(date)}
                    dateFormat="dd/MM/YYYY"
                />
                <button className='btn'
                    onClick={() => handleClear()}>Clear</button>
                <button className='btn'
                    onClick={() => handleLoad()}>Load</button>
                <button className='btn'
                    onClick={() => handleSave()}>Save</button>
                <button className='btn info'
                    onClick={() => handleExport()}>Export</button>
            </div>

            <div className="phase-container">
                {date &&
                    <table className='table-bordered' responsive>
                        <thead>
                            <tr>
                                <th >TITLE</th>
                                <th colSpan="7">
                                    <input
                                        name="title"
                                        value={title}
                                        type="text"
                                        onChange={(e) => setTitle(e.target.value.toUpperCase())}
                                        style={{ width: title === "" ? 10 + 'ch' : title.length + 2 + 'ch' }}
                                    />
                                </th>
                            </tr>
                            <tr>
                                <th>REV</th>
                                <td colSpan="7">{rev}</td>
                            </tr>
                            <tr>
                                <th className="multipleCell1">JOB</th>
                                <th>NAME</th>
                                <th>VAE ID</th>
                                <th>AUTH.</th>
                                <th>DEP.</th>
                                <th>OTHER JOBS</th>
                                <th>REMARK</th>
                            </tr>
                        </thead>

                        < tbody >
                            {general.map((individual, index) => (
                                <tr>
                                    <th>{individual.job}</th>
                                    <td>
                                        <input
                                            value={individual.name}
                                            type="text"
                                            onChange={(e) => onchangeGeneral(e.target.value, "name", index)}
                                            style={{ width: individual.name === "" ? 7 + 'ch' : individual.name.length + 2 + 'ch' }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            value={individual.ID}
                                            type="text"
                                            onChange={(e) => onchangeGeneral(e.target.value, "ID", index)}
                                            style={{ width: individual.ID === "" ? 7 + 'ch' : individual.ID.length + 2 + 'ch' }}
                                        />
                                    </td>
                                    <td>
                                        <select
                                            className='form-select'
                                            value={individual.auth}
                                            onChange={(e) => onchangeGeneral(e.target.value, "auth", index)}
                                        >
                                            <option selected value=""></option>
                                            <option value="B">B</option>
                                            <option value="A">A</option>
                                            <option value="M">M</option>
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            value={individual.dep}
                                            type="text"
                                            onChange={(e) => onchangeGeneral(e.target.value, "dep", index)}
                                            style={{ width: individual.dep === "" ? 7 + 'ch' : individual.dep.length + 2 + 'ch' }}
                                        />
                                    </td>
                                    <td>
                                        <textarea
                                            value={individual.other}
                                            type="text"
                                            onChange={(e) => onchangeGeneral(e.target.value, "other", index)}
                                            cols="40"
                                            rows={individual.other === "" && "1"}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            value={individual.remark}
                                            type="text"
                                            onChange={(e) => onchangeGeneral(e.target.value, "remark", index)}
                                            style={{ width: individual.remark === "" ? 7 + 'ch' : individual.remark.length + 2 + 'ch' }}
                                        />
                                    </td>
                                </tr>
                            ))}

                            <tr>
                                <th rowSpan="6">ZONE 128 + CABIN + CLEAN</th>
                                <td>
                                    <input
                                        value={zone128[0].name}
                                        type="text"
                                        onChange={(e) => onchangeZone128(e.target.value, "name", 0)}
                                        style={{ width: zone128[0].name === "" ? 7 + 'ch' : zone128[0].name.length + 2 + 'ch' }}
                                    />
                                </td>
                                <td>
                                    <input
                                        value={zone128[0].ID}
                                        type="text"
                                        onChange={(e) => onchangeZone128(e.target.value, "ID", 0)}
                                        style={{ width: zone128[0].ID === "" ? 7 + 'ch' : zone128[0].ID.length + 2 + 'ch' }}
                                    />
                                </td>
                                <td>
                                    <select
                                        className='form-select'
                                        value={zone128[0].auth}
                                        onChange={(e) => onchangeZone128(e.target.value, "auth", 0)}
                                    >
                                        <option selected value=""></option>
                                        <option value="B">B</option>
                                        <option value="A">A</option>
                                        <option value="M">M</option>
                                    </select>
                                </td>
                                <td>
                                    <input
                                        value={zone128[0].dep}
                                        type="text"
                                        onChange={(e) => onchangeZone128(e.target.value, "dep", 0)}
                                        style={{ width: zone128[0].dep === "" ? 7 + 'ch' : zone128[0].dep.length + 2 + 'ch' }}
                                    />
                                </td>
                                <td>
                                    <textarea
                                        value={zone128[0].other}
                                        type="text"
                                        onChange={(e) => onchangeZone128(e.target.value, "other", 0)}
                                        cols="40"
                                        rows={zone128[0].other === "" && "1"}
                                    />
                                </td>
                                <td>
                                    <input
                                        value={zone128[0].remark}
                                        type="text"
                                        onChange={(e) => onchangeZone128(e.target.value, "remark", 0)}
                                        style={{ width: zone128[0].remark === "" ? 7 + 'ch' : zone128[0].remark.length + 2 + 'ch' }}
                                    />
                                </td>
                            </tr>
                            {zone128.map((individual, index) => (
                                index > 0 &&
                                <tr>
                                    <td>
                                        <input
                                            value={individual.name}
                                            type="text"
                                            onChange={(e) => onchangeZone128(e.target.value, "name", index)}
                                            style={{ width: individual.name === "" ? 7 + 'ch' : individual.name.length + 2 + 'ch' }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            value={individual.ID}
                                            type="text"
                                            onChange={(e) => onchangeZone128(e.target.value, "ID", index)}
                                            style={{ width: individual.ID === "" ? 7 + 'ch' : individual.ID.length + 2 + 'ch' }}
                                        />
                                    </td>
                                    <td>
                                        <select
                                            className='form-select'
                                            value={individual.auth}
                                            onChange={(e) => onchangeZone128(e.target.value, "auth", index)}
                                        >
                                            <option selected value=""></option>
                                            <option value="B">B</option>
                                            <option value="A">A</option>
                                            <option value="M">M</option>
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            value={individual.dep}
                                            type="text"
                                            onChange={(e) => onchangeZone128(e.target.value, "dep", index)}
                                            style={{ width: individual.dep === "" ? 7 + 'ch' : individual.dep.length + 2 + 'ch' }}
                                        />
                                    </td>
                                    <td>
                                        <textarea
                                            value={individual.other}
                                            type="text"
                                            onChange={(e) => onchangeZone128(e.target.value, "other", index)}
                                            cols="40"
                                            rows={individual.other === "" && "1"}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            value={individual.remark}
                                            type="text"
                                            onChange={(e) => onchangeZone128(e.target.value, "remark", index)}
                                            style={{ width: individual.remark === "" ? 7 + 'ch' : individual.remark.length + 2 + 'ch' }}
                                        />
                                    </td>
                                </tr>
                            ))}

                            <tr>
                                <th rowSpan="6">ZONE 34 + 567</th>
                                <td>
                                    <input
                                        value={zone34567[0].name}
                                        type="text"
                                        onChange={(e) => onchangeZone34(e.target.value, "name", 0)}
                                        style={{ width: zone34567[0].name === "" ? 7 + 'ch' : zone34567[0].name.length + 2 + 'ch' }}
                                    />
                                </td>
                                <td>
                                    <input
                                        value={zone34567[0].ID}
                                        type="text"
                                        onChange={(e) => onchangeZone34(e.target.value, "ID", 0)}
                                        style={{ width: zone34567[0].ID === "" ? 7 + 'ch' : zone34567[0].ID.length + 2 + 'ch' }}
                                    />
                                </td>
                                <td>
                                    <select
                                        className='form-select'
                                        value={zone34567[0].auth}
                                        onChange={(e) => onchangeZone34(e.target.value, "auth", 0)}
                                    >
                                        <option selected value=""></option>
                                        <option value="B">B</option>
                                        <option value="A">A</option>
                                        <option value="M">M</option>
                                    </select>
                                </td>
                                <td>
                                    <input
                                        value={zone34567[0].dep}
                                        type="text"
                                        onChange={(e) => onchangeZone34(e.target.value, "dep", 0)}
                                        style={{ width: zone34567[0].dep === "" ? 7 + 'ch' : zone34567[0].dep.length + 2 + 'ch' }}
                                    />
                                </td>
                                <td>
                                    <textarea
                                        value={zone34567[0].other}
                                        type="text"
                                        onChange={(e) => onchangeZone34(e.target.value, "other", 0)}
                                        cols="40"
                                        rows={zone34567[0].other === "" && "1"}
                                    />
                                </td>
                                <td>
                                    <input
                                        value={zone34567[0].remark}
                                        type="text"
                                        onChange={(e) => onchangeZone34(e.target.value, "remark", 0)}
                                        style={{ width: zone34567[0].remark === "" ? 7 + 'ch' : zone34567[0].remark.length + 2 + 'ch' }}
                                    />
                                </td>
                            </tr>
                            {zone34567.map((individual, index) => (
                                index > 0 &&
                                <tr>
                                    <td>
                                        <input
                                            value={individual.name}
                                            type="text"
                                            onChange={(e) => onchangeZone34(e.target.value, "name", index)}
                                            style={{ width: individual.name === "" ? 7 + 'ch' : individual.name.length + 2 + 'ch' }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            value={individual.ID}
                                            type="text"
                                            onChange={(e) => onchangeZone34(e.target.value, "ID", index)}
                                            style={{ width: individual.ID === "" ? 7 + 'ch' : individual.ID.length + 2 + 'ch' }}
                                        />
                                    </td>
                                    <td>
                                        <select
                                            className='form-select'
                                            value={individual.auth}
                                            onChange={(e) => onchangeZone34(e.target.value, "auth", index)}
                                        >
                                            <option selected value=""></option>
                                            <option value="B">B</option>
                                            <option value="A">A</option>
                                            <option value="M">M</option>
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            value={individual.dep}
                                            type="text"
                                            onChange={(e) => onchangeZone34(e.target.value, "dep", index)}
                                            style={{ width: individual.dep === "" ? 7 + 'ch' : individual.dep.length + 2 + 'ch' }}
                                        />
                                    </td>
                                    <td>
                                        <textarea
                                            value={individual.other}
                                            type="text"
                                            onChange={(e) => onchangeZone34(e.target.value, "other", index)}
                                            cols="40"
                                            rows={individual.other === "" && "1"}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            value={individual.remark}
                                            type="text"
                                            onChange={(e) => onchangeZone34(e.target.value, "remark", index)}
                                            style={{ width: individual.remark === "" ? 7 + 'ch' : individual.remark.length + 2 + 'ch' }}
                                        />
                                    </td>
                                </tr>
                            ))}

                            <tr>
                                <th rowSpan="4">AVIONIC</th>
                                <td>
                                    <input
                                        value={zoneAvi[0].name}
                                        type="text"
                                        onChange={(e) => onchangeZoneAvi(e.target.value, "name", 0)}
                                        style={{ width: zoneAvi[0].name === "" ? 7 + 'ch' : zoneAvi[0].name.length + 2 + 'ch' }}
                                    />
                                </td>
                                <td>
                                    <input
                                        value={zoneAvi[0].ID}
                                        type="text"
                                        onChange={(e) => onchangeZoneAvi(e.target.value, "ID", 0)}
                                        style={{ width: zoneAvi[0].ID === "" ? 7 + 'ch' : zoneAvi[0].ID.length + 2 + 'ch' }}
                                    />
                                </td>
                                <td>
                                    <select
                                        className='form-select'
                                        value={zoneAvi[0].auth}
                                        onChange={(e) => onchangeZoneAvi(e.target.value, "auth", 0)}
                                    >
                                        <option selected value=""></option>
                                        <option value="B">B</option>
                                        <option value="A">A</option>
                                        <option value="M">M</option>
                                    </select>
                                </td>
                                <td>
                                    <input
                                        value={zoneAvi[0].dep}
                                        type="text"
                                        onChange={(e) => onchangeZoneAvi(e.target.value, "dep", 0)}
                                        style={{ width: zoneAvi[0].dep === "" ? 7 + 'ch' : zoneAvi[0].dep.length + 2 + 'ch' }}
                                    />
                                </td>
                                <td>
                                    <textarea
                                        value={zoneAvi[0].other}
                                        type="text"
                                        onChange={(e) => onchangeZoneAvi(e.target.value, "other", 0)}
                                        cols="40"
                                        rows={zoneAvi[0].other === "" && "1"}
                                    />
                                </td>
                                <td>
                                    <input
                                        value={zoneAvi[0].remark}
                                        type="text"
                                        onChange={(e) => onchangeZoneAvi(e.target.value, "remark", 0)}
                                        style={{ width: zoneAvi[0].remark === "" ? 7 + 'ch' : zoneAvi[0].remark.length + 2 + 'ch' }}
                                    />
                                </td>
                            </tr>
                            {zoneAvi.map((individual, index) => (
                                index > 0 &&
                                <tr>
                                    <td>
                                        <input
                                            value={individual.name}
                                            type="text"
                                            onChange={(e) => onchangeZoneAvi(e.target.value, "name", index)}
                                            style={{ width: individual.name === "" ? 7 + 'ch' : individual.name.length + 2 + 'ch' }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            value={individual.ID}
                                            type="text"
                                            onChange={(e) => onchangeZoneAvi(e.target.value, "ID", index)}
                                            style={{ width: individual.ID === "" ? 7 + 'ch' : individual.ID.length + 2 + 'ch' }}
                                        />
                                    </td>
                                    <td>
                                        <select
                                            className='form-select'
                                            value={individual.auth}
                                            onChange={(e) => onchangeZoneAvi(e.target.value, "auth", index)}
                                        >
                                            <option selected value=""></option>
                                            <option value="B">B</option>
                                            <option value="A">A</option>
                                            <option value="M">M</option>
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            value={individual.dep}
                                            type="text"
                                            onChange={(e) => onchangeZoneAvi(e.target.value, "dep", index)}
                                            style={{ width: individual.dep === "" ? 7 + 'ch' : individual.dep.length + 2 + 'ch' }}
                                        />
                                    </td>
                                    <td>
                                        <textarea
                                            value={individual.other}
                                            type="text"
                                            onChange={(e) => onchangeZoneAvi(e.target.value, "other", index)}
                                            cols="40"
                                            rows={individual.other === "" && "1"}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            value={individual.remark}
                                            type="text"
                                            onChange={(e) => onchangeZoneAvi(e.target.value, "remark", index)}
                                            style={{ width: individual.remark === "" ? 7 + 'ch' : individual.remark.length + 2 + 'ch' }}
                                        />
                                    </td>
                                </tr>
                            ))}

                            <tr>
                                <th rowSpan="2">ENG RUN</th>
                                <td>
                                    <input
                                        value={engRun[0].name}
                                        type="text"
                                        onChange={(e) => onchangeEngRun(e.target.value, "name", 0)}
                                        style={{ width: engRun[0].name === "" ? 7 + 'ch' : engRun[0].name.length + 2 + 'ch' }}
                                    />
                                </td>
                                <td>
                                    <input
                                        value={engRun[0].ID}
                                        type="text"
                                        onChange={(e) => onchangeEngRun(e.target.value, "ID", 0)}
                                        style={{ width: engRun[0].ID === "" ? 7 + 'ch' : engRun[0].ID.length + 2 + 'ch' }}
                                    />
                                </td>
                                <td>
                                    <select
                                        className='form-select'
                                        value={engRun[0].auth}
                                        onChange={(e) => onchangeEngRun(e.target.value, "auth", 0)}
                                    >
                                        <option selected value=""></option>
                                        <option value="B">B</option>
                                        <option value="A">A</option>
                                        <option value="M">M</option>
                                    </select>
                                </td>
                                <td>
                                    <input
                                        value={engRun[0].dep}
                                        type="text"
                                        onChange={(e) => onchangeEngRun(e.target.value, "dep", 0)}
                                        style={{ width: engRun[0].dep === "" ? 7 + 'ch' : engRun[0].dep.length + 2 + 'ch' }}
                                    />
                                </td>
                                <td>
                                    <textarea
                                        value={engRun[0].other}
                                        type="text"
                                        onChange={(e) => onchangeEngRun(e.target.value, "other", 0)}
                                        cols="40"
                                        rows={engRun[0].other === "" && "1"}
                                    />
                                </td>
                                <td>
                                    <input
                                        value={engRun[0].remark}
                                        type="text"
                                        onChange={(e) => onchangeEngRun(e.target.value, "remark", 0)}
                                        style={{ width: engRun[0].remark === "" ? 7 + 'ch' : engRun[0].remark.length + 2 + 'ch' }}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <input
                                        value={engRun[1].name}
                                        type="text"
                                        onChange={(e) => onchangeEngRun(e.target.value, "name", 1)}
                                        style={{ width: engRun[1].name === "" ? 7 + 'ch' : engRun[1].name.length + 2 + 'ch' }}
                                    />
                                </td>
                                <td>
                                    <input
                                        value={engRun[1].ID}
                                        type="text"
                                        onChange={(e) => onchangeEngRun(e.target.value, "ID", 1)}
                                        style={{ width: engRun[1].ID === "" ? 7 + 'ch' : engRun[1].ID.length + 2 + 'ch' }}
                                    />
                                </td>
                                <td>
                                    <select
                                        className='form-select'
                                        value={engRun[1].auth}
                                        onChange={(e) => onchangeEngRun(e.target.value, "auth", 1)}
                                    >
                                        <option selected value=""></option>
                                        <option value="B">B</option>
                                        <option value="A">A</option>
                                        <option value="M">M</option>
                                    </select>
                                </td>
                                <td>
                                    <input
                                        value={engRun[1].dep}
                                        type="text"
                                        onChange={(e) => onchangeEngRun(e.target.value, "dep", 1)}
                                        style={{ width: engRun[1].dep === "" ? 7 + 'ch' : engRun[1].dep.length + 2 + 'ch' }}
                                    />
                                </td>
                                <td>
                                    <textarea
                                        value={engRun[1].other}
                                        type="text"
                                        onChange={(e) => onchangeEngRun(e.target.value, "other", 1)}
                                        cols="40"
                                        rows={engRun[1].other === "" && "1"}
                                    />
                                </td>
                                <td>
                                    <input
                                        value={engRun[1].remark}
                                        type="text"
                                        onChange={(e) => onchangeEngRun(e.target.value, "remark", 1)}
                                        style={{ width: engRun[1].remark === "" ? 7 + 'ch' : engRun[1].remark.length + 2 + 'ch' }}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <th rowSpan="2">STRUCTURE</th>
                                <td>
                                    <input
                                        value={structure.name}
                                        type="text"
                                        onChange={(e) => onchangeStructure(e.target.value, "name")}
                                        style={{ width: structure.name === "" ? 7 + 'ch' : structure.name.length + 2 + 'ch' }}
                                    />
                                </td>
                                <td>
                                    <input
                                        value={structure.ID}
                                        type="text"
                                        onChange={(e) => onchangeStructure(e.target.value, "ID")}
                                        style={{ width: structure.ID === "" ? 7 + 'ch' : structure.ID.length + 2 + 'ch' }}
                                    />
                                </td>
                                <td>
                                    <select
                                        className='form-select'
                                        value={structure.auth}
                                        onChange={(e) => onchangeStructure(e.target.value, "auth")}
                                    >
                                        <option selected value=""></option>
                                        <option value="B">B</option>
                                        <option value="A">A</option>
                                        <option value="M">M</option>
                                    </select>
                                </td>
                                <td>
                                    <input
                                        value={structure.dep}
                                        type="text"
                                        onChange={(e) => onchangeStructure(e.target.value, "dep")}
                                        style={{ width: structure.dep === "" ? 7 + 'ch' : structure.dep.length + 2 + 'ch' }}
                                    />
                                </td>
                                <td>
                                    <textarea
                                        value={structure.other}
                                        type="text"
                                        onChange={(e) => onchangeStructure(e.target.value, "other")}
                                        cols="40"
                                        rows={structure.other === "" && "1"}
                                    />
                                </td>
                                <td>
                                    <input
                                        value={structure.remark}
                                        type="text"
                                        onChange={(e) => onchangeStructure(e.target.value, "remark")}
                                        style={{ width: structure.remark === "" ? 7 + 'ch' : structure.remark.length + 2 + 'ch' }}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                }
            </div >
        </>
    )
}

export default PhaseCheck;