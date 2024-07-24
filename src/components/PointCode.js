import React, { useEffect, useState } from 'react';
import './PointCode.scss';
import { loadPointCode, deletePC, searchPointCode } from '../services/UserService';
import { toast } from 'react-toastify';
import ModalPointCode from './ModalPointCode';
import ReactPaginate from 'react-paginate';
import ModalPCUpdate from './ModalPCUpdate';
import ModalDeletePC from './ModalDetetePC';

const PointCode = (props) => {
    const [pointCode, setPointCode] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const currentLimit = 10;
    const [totalPages, setTotalPages] = useState(0);
    const [searchValue, setSearchValue] = useState("");
    const [isShowModalPointCode, setIsShowModalPointCode] = useState(false);
    const [isShowModalPCUpdate, setIsShowModalPCUpdate] = useState(false);
    const [dataModalPCUpdate, setDataModalPCUpdate] = useState({});
    const [isShowModalDelete, setIsShowModalDelete] = useState(false);
    const [dataModalDelete, setDataModalDelete] = useState({});

    useEffect(() => {
        fetchPointCode();
    }, [currentPage])

    const fetchPointCode = async () => {
        let response = await loadPointCode(currentPage, currentLimit);
        if (response && response.EC === 0) {
            setTotalPages(response.DT.totalPages);
            await setPointCode(response.DT.pointCode);
        }
    }

    const handleSearch = async (searchValue) => {
        if (!searchValue) {
            toast.error("Pls enter code or AC type or type for search");
            return;
        }
        let response = await searchPointCode(searchValue);
        if (response && response.EC === 0) {
            //sucess
            await setPointCode(response.DT);
        } else {
            toast.error(response.EM)
        }
    }

    const handleClear = () => {
        setSearchValue("");
        fetchPointCode();
    }

    const handleUpdatePointCode = (item) => {
        setDataModalPCUpdate(item);
        setIsShowModalPCUpdate(true);
    }

    const onHideModalPCUpdate = () => {
        setIsShowModalPCUpdate(false);
        fetchPointCode();
    }

    const handleDeletePointCode = (item) => {
        setDataModalDelete(item);
        setIsShowModalDelete(true);
    }

    const confirmDeletePC = async () => {
        let response = await deletePC(dataModalDelete);
        if (response && response.EC === 0) {
            toast.success(response.EM)
            await fetchPointCode();
            setIsShowModalDelete(false);
        } else {
            toast.error(response.EM)
        }
    }

    const handleCloseDeletePC = () => {
        setIsShowModalDelete(false);
        setDataModalDelete({});
    }

    const handlePageClick = async (event) => {
        setCurrentPage(+event.selected + 1);
    };

    const handleCreatePointCode = async () => {
        setIsShowModalPointCode(true)
    }

    const onHideModalPointCode = () => {
        setIsShowModalPointCode(false);
        fetchPointCode();
    }

    const handleClosePointCode = () => {
        setIsShowModalPointCode(false);
    }

    return (
        <>
            <div>
                <div className='pointCode-container'>
                    <div className='user-header container'>
                        <div className='search-container' >
                            <label>Search point code :</label>
                            <input
                                type='text'
                                placeholder='Search by code or AC type or type'
                                value={searchValue}
                                style={{ width: '30%' }}
                                onChange={(event) => setSearchValue(event.target.value.toUpperCase())} />
                            <button
                                className='btn btn-info mx-1'
                                onClick={() => handleSearch(searchValue)}
                            >Search</button>
                            <button
                                className='btn btn-info'
                                onClick={() => handleClear()}
                            >Clear</button>
                        </div>
                        <div className='title'><h3>Table point code</h3></div>
                    </div>
                    <div className='pointCode-body'>
                        <table className='table-striped table-bordered' responsive>
                            <thead>
                                <tr>
                                    <th scope="col">No</th>
                                    <th scope="col">Airline</th>
                                    <th scope="col">Code</th>
                                    <th scope="col">AC type</th>
                                    <th scope="col">Type</th>
                                    <th scope="col">Max time (min)</th>
                                    <th scope="col">Remark</th>
                                    <th scope="col">CRS W.H</th>
                                    <th scope="col">MECH W.H</th>
                                    <th scope="col">CRS W.P</th>
                                    <th scope="col">MECH W.P</th>
                                    <th scope="col">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pointCode && pointCode.length > 0 ?
                                    <>
                                        {pointCode.map((item, index) => {
                                            return (
                                                <tr key={`row-${index}`}>
                                                    <td>{(currentPage - 1) * currentLimit + index + 1}</td>
                                                    <td>{item.airline}</td>
                                                    <td>{item.code}</td>
                                                    <td>{item.ACType}</td>
                                                    <td>{item.type}</td>
                                                    <td>{item.maxTime}</td>
                                                    <td>{item.remark}</td>
                                                    <td>{item.CRSWHour}</td>
                                                    <td>{item.MECHWHour}</td>
                                                    <td>{item.CRSWPoint}</td>
                                                    <td>{item.MECHWPoint}</td>
                                                    <td>
                                                        <button className='btn btn-warning mx-1'
                                                            onClick={() => handleUpdatePointCode(item)}
                                                        >Edit</button>
                                                        <button className='btn btn-danger'
                                                            onClick={() => handleDeletePointCode(item)}
                                                        >Delete</button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </>
                                    :
                                    <><tr><td>Not found users</td></tr></>
                                }
                                <tr>
                                    <th colSpan="12">
                                        <button className='btn btn-info'
                                            onClick={() => handleCreatePointCode()}
                                        >Create point code</button>
                                    </th>
                                </tr>
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

            <ModalDeletePC
                show={isShowModalDelete}
                handleClose={handleCloseDeletePC}
                confirmDeletePC={confirmDeletePC}
                dataModalDelete={dataModalDelete}
            />
            <ModalPCUpdate
                title={"Edit point code"}
                onHide={onHideModalPCUpdate}
                show={isShowModalPCUpdate}
                dataModalPCUpdate={dataModalPCUpdate}
            />
            <ModalPointCode
                show={isShowModalPointCode}
                handleClose={handleClosePointCode}
                onHide={onHideModalPointCode}
            />
        </>
    )
}

export default PointCode;

