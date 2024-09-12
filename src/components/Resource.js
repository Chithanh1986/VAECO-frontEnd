import React, { useEffect, useState } from 'react';
import './Resource.scss';
import { loadTeamData, searchApi } from '../services/UserService';
import { toast } from 'react-toastify';
import ModalUpdateForLeader from './ModalUpdateForLeader';

const Resource = (props) => {
    const [team1DAD, setTeam1DAD] = useState();
    const [team2DAD, setTeam2DAD] = useState();
    const [team3DAD, setTeam3DAD] = useState();
    const [team4DAD, setTeam4DAD] = useState();
    const [team1CXR, setTeam1CXR] = useState();
    const [team2CXR, setTeam2CXR] = useState();
    const [team3CXR, setTeam3CXR] = useState();
    const [team4CXR, setTeam4CXR] = useState();
    const [searchValue, setSearchValue] = useState("");
    const [searchResult, setSearchResult] = useState(null);
    const [isShowModalUpdateForLeader, setIsShowModalUpdateForLeader] = useState(false);
    const [dataModalUpdateForLeader, setDataModalUpdateForLeader] = useState({});

    useEffect(() => {
        fetchUsers();
    }, [])

    const fetchUsers = async () => {
        let response = await loadTeamData("Team 1", "DAD");
        if (response && response.EC === 0) {
            await setTeam1DAD(response.DT);
        }
        response = await loadTeamData("Team 2", "DAD");
        if (response && response.EC === 0) {
            await setTeam2DAD(response.DT);
        }
        response = await loadTeamData("Team 3", "DAD");
        if (response && response.EC === 0) {
            await setTeam3DAD(response.DT);
        }
        response = await loadTeamData("Team 4", "DAD");
        if (response && response.EC === 0) {
            await setTeam4DAD(response.DT);
        }
        response = await loadTeamData("Team 1", "CXR");
        if (response && response.EC === 0) {
            await setTeam1CXR(response.DT);
        }
        response = await loadTeamData("Team 2", "CXR");
        if (response && response.EC === 0) {
            await setTeam2CXR(response.DT);
        }
        response = await loadTeamData("Team 3", "CXR");
        if (response && response.EC === 0) {
            await setTeam3CXR(response.DT);
        }
        response = await loadTeamData("Team 4", "CXR");
        if (response && response.EC === 0) {
            await setTeam4CXR(response.DT);
        }
    }

    const handleSearch = async (searchValue) => {
        if (!searchValue) {
            toast.error("Pls enter vaeco name or id for search");
            return;
        }
        let response = await searchApi(searchValue);
        if (response && response.EC === 0) {
            // await setSearchResult(response.DT);
            setTimeout(() => setSearchResult(response.DT), 1);
        } else {
            toast.error(response.EM)
        }

    }

    const handleClear = () => {
        setSearchValue("");
        setSearchResult(null);
    }

    const updateUser = (user) => {
        setDataModalUpdateForLeader(user);
        setIsShowModalUpdateForLeader(true);
    }

    const onHideModalUpdate = () => {
        setIsShowModalUpdateForLeader(false);
        fetchUsers();
    }

    return (
        <div className='resource-container'>
            {searchResult ?
                <div className='search-container container'>
                    <label>Vae ID: {searchResult.vae_id}, Name: {searchResult.surname} {searchResult.name}, Division: {searchResult.division}, Remark: {searchResult.remark}</label>
                    <button className='btn btn-warning mx-1'
                        onClick={() => updateUser(searchResult)}
                    >Edit</button>
                    <button
                        className='btn btn-info'
                        onClick={() => handleClear()}
                    >Clear</button>
                </div>
                :
                <div className='search-container container'>
                    <lable>Search user for update :</lable>
                    <input
                        type='text'
                        placeholder='Search by vaeco user or vaeco id'
                        value={searchValue}
                        style={{ width: '30%' }}
                        onChange={(event) => setSearchValue(event.target.value)} />
                    <button
                        className='btn btn-info mx-1'
                        onClick={() => handleSearch(searchValue)}
                    >Search</button>
                    <button
                        className='btn btn-info'
                        onClick={() => handleClear()}
                    >Clear</button>
                </div>
            }

            <div className='table-container'>
                <table className='table-responsive table-striped table-bordered' responsive>
                    <thead>
                        <tr>
                            <th colSpan="5">List power of team 1 DAD</th>
                        </tr>
                        <tr>
                            <th scope="col">No</th>
                            <th scope="col">Vae ID</th>
                            <th scope="col">Surname</th>
                            <th scope="col">Name</th>
                            <th scope="col">Remark</th>
                        </tr>
                    </thead>
                    <tbody>
                        {team1DAD && team1DAD.length > 0 ?
                            <>
                                {team1DAD.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{item.vae_id}</td>
                                            <td>{item.surname}</td>
                                            <td>{item.name}</td>
                                            <td>{item.remark}</td>
                                        </tr>
                                    )
                                })}
                            </>
                            :
                            <><tr><td>Not found users</td></tr></>
                        }
                    </tbody>
                </table>

                <table className='table-responsive table-striped table-bordered' responsive>
                    <thead>
                        <tr>
                            <th colSpan="5">List power of team 2 DAD</th>
                        </tr>
                        <tr>
                            <th scope="col">No</th>
                            <th scope="col">Vae ID</th>
                            <th scope="col">Surname</th>
                            <th scope="col">Name</th>
                            <th scope="col">Remark</th>
                        </tr>
                    </thead>
                    <tbody>
                        {team2DAD && team2DAD.length > 0 ?
                            <>
                                {team2DAD.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{item.vae_id}</td>
                                            <td>{item.surname}</td>
                                            <td>{item.name}</td>
                                            <td>{item.remark}</td>
                                        </tr>
                                    )
                                })}
                            </>
                            :
                            <><tr><td>Not found users</td></tr></>
                        }
                    </tbody>
                </table>

                <table className='table-responsive table-striped table-bordered' responsive>
                    <thead>
                        <tr>
                            <th colSpan="5">List power of team 3 DAD</th>
                        </tr>
                        <tr>
                            <th scope="col">No</th>
                            <th scope="col">Vae ID</th>
                            <th scope="col">Surname</th>
                            <th scope="col">Name</th>
                            <th scope="col">Remark</th>
                        </tr>
                    </thead>
                    <tbody>
                        {team3DAD && team3DAD.length > 0 ?
                            <>
                                {team3DAD.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{item.vae_id}</td>
                                            <td>{item.surname}</td>
                                            <td>{item.name}</td>
                                            <td>{item.remark}</td>
                                        </tr>
                                    )
                                })}
                            </>
                            :
                            <><tr><td>Not found users</td></tr></>
                        }
                    </tbody>
                </table>

                <table className='table-responsive table-striped table-bordered' responsive>
                    <thead>
                        <tr>
                            <th colSpan="5">List power of team 4 DAD</th>
                        </tr>
                        <tr>
                            <th scope="col">No</th>
                            <th scope="col">Vae ID</th>
                            <th scope="col">Surname</th>
                            <th scope="col">Name</th>
                            <th scope="col">Remark</th>
                        </tr>
                    </thead>
                    <tbody>
                        {team4DAD && team4DAD.length > 0 ?
                            <>
                                {team4DAD.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{item.vae_id}</td>
                                            <td>{item.surname}</td>
                                            <td>{item.name}</td>
                                            <td>{item.remark}</td>
                                        </tr>
                                    )
                                })}
                            </>
                            :
                            <><tr><td>Not found users</td></tr></>
                        }
                    </tbody>
                </table>
            </div>

            <div className='table-container'>
                <table className='table-bordered' responsive>
                    <thead>
                        <tr>
                            <th colSpan="5">List power of team 1 CXR</th>
                        </tr>
                        <tr>
                            <th scope="col">No</th>
                            <th scope="col">Vae ID</th>
                            <th scope="col">Surname</th>
                            <th scope="col">Name</th>
                            <th scope="col">Remark</th>
                        </tr>
                    </thead>
                    <tbody>
                        {team1CXR && team1CXR.length > 0 ?
                            <>
                                {team1CXR.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{item.vae_id}</td>
                                            <td>{item.surname}</td>
                                            <td>{item.name}</td>
                                            <td>{item.remark}</td>
                                        </tr>
                                    )
                                })}
                            </>
                            :
                            <><tr><td>Not found users</td></tr></>
                        }
                    </tbody>
                </table>

                <table className='table-bordered' responsive>
                    <thead>
                        <tr>
                            <th colSpan="5">List power of team 2 CXR</th>
                        </tr>
                        <tr>
                            <th scope="col">No</th>
                            <th scope="col">Vae ID</th>
                            <th scope="col">Surname</th>
                            <th scope="col">Name</th>
                            <th scope="col">Remark</th>
                        </tr>
                    </thead>
                    <tbody>
                        {team2CXR && team2CXR.length > 0 ?
                            <>
                                {team2CXR.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{item.vae_id}</td>
                                            <td>{item.surname}</td>
                                            <td>{item.name}</td>
                                            <td>{item.remark}</td>
                                        </tr>
                                    )
                                })}
                            </>
                            :
                            <><tr><td>Not found users</td></tr></>
                        }
                    </tbody>
                </table>

                <table className='table-bordered' responsive>
                    <thead>
                        <tr>
                            <th colSpan="5">List power of team 3 CXR</th>
                        </tr>
                        <tr>
                            <th scope="col">No</th>
                            <th scope="col">Vae ID</th>
                            <th scope="col">Surname</th>
                            <th scope="col">Name</th>
                            <th scope="col">Remark</th>
                        </tr>
                    </thead>
                    <tbody>
                        {team3CXR && team3CXR.length > 0 ?
                            <>
                                {team3CXR.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{item.vae_id}</td>
                                            <td>{item.surname}</td>
                                            <td>{item.name}</td>
                                            <td>{item.remark}</td>
                                        </tr>
                                    )
                                })}
                            </>
                            :
                            <><tr><td>Not found users</td></tr></>
                        }
                    </tbody>
                </table>

                <table className='table-bordered' responsive>
                    <thead>
                        <tr>
                            <th colSpan="5">List power of team 4 CXR</th>
                        </tr>
                        <tr>
                            <th scope="col">No</th>
                            <th scope="col">Vae ID</th>
                            <th scope="col">Surname</th>
                            <th scope="col">Name</th>
                            <th scope="col">Remark</th>
                        </tr>
                    </thead>
                    <tbody>
                        {team4CXR && team4CXR.length > 0 ?
                            <>
                                {team4CXR.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{item.vae_id}</td>
                                            <td>{item.surname}</td>
                                            <td>{item.name}</td>
                                            <td>{item.remark}</td>
                                        </tr>
                                    )
                                })}
                            </>
                            :
                            <><tr><td>Not found users</td></tr></>
                        }
                    </tbody>
                </table>
            </div>
            <ModalUpdateForLeader
                title={"Edit user"}
                onHide={onHideModalUpdate}
                show={isShowModalUpdateForLeader}
                dataModalUpdate={dataModalUpdateForLeader}
            />
        </div>
    )
}

export default Resource;

