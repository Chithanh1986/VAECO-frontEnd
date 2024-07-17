import React, { useEffect, useState } from 'react';
import './Users.scss';
import { fetchAllUsers, deleteUser, resetPassword, searchApi } from '../services/UserService';
import ReactPaginate from 'react-paginate';
import { toast } from 'react-toastify';
import ModalDelete from './ModalDelete';
import ModalUpdate from './ModalUpdate';
import ModalResetPass from './ModalResetPass';

const UserList = (props) => {
    const [listUsers, setListUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentLimit, setCurrentLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [isShowModalDelete, setIsShowModalDelete] = useState(false);
    const [dataModal, setDataModal] = useState({});
    const [isShowModalUpdate, setIsShowModalUpdate] = useState(false);
    const [dataModalUpdate, setDataModalUpdate] = useState({});
    const [modalResetPassword, setModalResetPassword] = useState({});
    const [isShowModalResetPassword, setIsShowModalResetPassword] = useState(false);
    const [searchValue, setSearchValue] = useState("");

    useEffect(() => {
        fetchUsers();
    }, [currentPage, isShowModalUpdate])

    const fetchUsers = async () => {
        let response = await fetchAllUsers(currentPage, currentLimit);
        if (response && response.EC === 0) {
            setTotalPages(response.DT.totalPages);
            setListUsers(response.DT.users);
        }
    }

    const handlePageClick = async (event) => {
        setCurrentPage(+event.selected + 1);
    };

    const handleDeleteUser = (user) => {
        setDataModal(user);
        setIsShowModalDelete(true);
    }

    const handleClose = () => {
        setIsShowModalDelete(false);
        setDataModal({});
    }

    const confirmDeleteUser = async () => {
        let response = await deleteUser(dataModal);
        if (response && response.EC === 0) {
            toast.success(response.EM)
            await fetchUsers();
            setIsShowModalDelete(false);
        } else {
            toast.error(response.EM)
        }
    }

    const onHideModalUpdate = () => {
        setIsShowModalUpdate(false)
    }

    const handleUpdateUser = (user) => {
        setDataModalUpdate(user);
        setIsShowModalUpdate(true);
    }

    const handleResetPassword = (user) => {
        setModalResetPassword(user);
        setIsShowModalResetPassword(true);
    }

    const handleCloseResetPass = () => {
        setIsShowModalResetPassword(false);
        setModalResetPassword({});
    }

    const confirmResetPass = async () => {

        let response = await resetPassword(modalResetPassword);
        if (response && response.EC === 0) {
            toast.success(response.EM)
            await fetchUsers();
            setIsShowModalResetPassword(false);
        } else {
            toast.error(response.EM)
        }
    }

    const handleSearch = async (searchValue) => {
        if (!searchValue) {
            toast.error("Pls enter vaeco name or id for search");
            return;
        }
        let response = await searchApi(searchValue);
        let data = [response.DT];
        if (response && response.EC === 0) {
            //sucess
            setTotalPages(1);
            setListUsers(data);
        } else {
            toast.error(response.EM)
        }

    }

    const handleClear = () => {
        setSearchValue("");
        fetchUsers();
    }

    return (
        <>
            <div>
                <div className='manage-users-container'>
                    <div className='user-header container'>
                        <div className='search-container' >
                            <input
                                type='text'
                                placeholder='Search by vaeco user or vaeco id'
                                value={searchValue}
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
                        <div className='title'><h3>Table users</h3></div>
                    </div>
                    <div className='users-body'>
                        <table className="table table-striped table-hover table-bordered">
                            <thead>
                                <tr>
                                    <th scope="col">No</th>
                                    <th scope="col">ID</th>
                                    <th scope="col">Vaeco name</th>
                                    <th scope="col">Vaeco ID</th>
                                    <th scope="col">Surname</th>
                                    <th scope="col">Name</th>
                                    <th scope="col">Division</th>
                                    <th scope="col">Station</th>
                                    <th scope="col">Group</th>
                                    <th scope="col">Remark</th>
                                    <th scope="col">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listUsers && listUsers.length > 0 ?
                                    <>
                                        {listUsers.map((item, index) => {
                                            return (
                                                <tr key={`row-${index}`}>
                                                    <td>{(currentPage - 1) * currentLimit + index + 1}</td>
                                                    <td>{item.id}</td>
                                                    <td>{item.vae_user}</td>
                                                    <td>{item.vae_id}</td>
                                                    <td>{item.surname}</td>
                                                    <td>{item.name}</td>
                                                    <td>{item.division}</td>
                                                    <td>{item.station}</td>
                                                    <td>{item.group}</td>
                                                    <td>{item.remark}</td>
                                                    <td>
                                                        <button className='btn btn-warning'
                                                            onClick={() => handleResetPassword(item)}
                                                        >Reset Pass</button>
                                                        <button className='btn btn-warning mx-1'
                                                            onClick={() => handleUpdateUser(item)}
                                                        >Edit</button>
                                                        <button className='btn btn-danger'
                                                            onClick={() => handleDeleteUser(item)}
                                                        >Delete</button>
                                                    </td>
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

                    {totalPages > 0 &&
                        <div className='user-footer'>
                            <ReactPaginate
                                nextLabel="next >"
                                onPageChange={handlePageClick}
                                pageRangeDisplayed={3}
                                marginPagesDisplayed={2}
                                pageCount={totalPages}
                                previousLabel="< previous"
                                pageClassName="page-item"
                                pageLinkClassName="page-link"
                                previousClassName="page-item"
                                previousLinkClassName="page-link"
                                nextClassName="page-item"
                                nextLinkClassName="page-link"
                                breakLabel="..."
                                breakClassName="page-item"
                                breakLinkClassName="page-link"
                                containerClassName="pagination"
                                activeClassName="active"
                                renderOnZeroPageCount={null}
                            />
                        </div>
                    }
                </div>
            </div>

            <ModalDelete
                show={isShowModalDelete}
                handleClose={handleClose}
                confirmDeleteUser={confirmDeleteUser}
                dataModal={dataModal}
            />
            <ModalUpdate
                title={"Edit user"}
                onHide={onHideModalUpdate}
                show={isShowModalUpdate}
                dataModalUpdate={dataModalUpdate}
            />
            <ModalResetPass
                show={isShowModalResetPassword}
                handleClose={handleCloseResetPass}
                confirmResetPass={confirmResetPass}
                dataModal={modalResetPassword}
            />
        </>
    )
}

export default UserList;

