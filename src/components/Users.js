import React, { useEffect, useState } from 'react';
import './Users.scss';
import { fetchAllUsers, deleteUser } from '../services/UserService';
import ReactPaginate from 'react-paginate';
import { toast } from 'react-toastify';
import ModalDelete from './ModalDelete';
import ModalUpdate from './ModalUpdate';

const UserList = (props) => {
    const [listUsers, setListUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentLimit, setCurrentLimit] = useState(5);
    const [totalPages, setTotalPages] = useState(0);
    const [isShowModalDelete, setIsShowModalDelete] = useState(false);
    const [dataModal, setDataModal] = useState({});
    const [isShowModalUpdate, setIsShowModalUpdate] = useState(false);
    const [dataModalUpdate, setDataModalUpdate] = useState({});

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

    return (
        <>
            <div className='container'>
                <div className='manage-users-container'>
                    <div className='user-header'>
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
                                    <th scope="col">Group</th>
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
                                                    <td>{item.group}</td>
                                                    <td>
                                                        <button className='btn btn-warning'>Reset Pass</button>
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
        </>
    )
}

export default UserList;

