import React, { useContext } from 'react';
import './App.scss';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter } from "react-router-dom";
import Header from './components/Header';
import AppRoutes from './roustes/AppRoutes';
import { ColorRing } from 'react-loader-spinner';
import { UserContext } from "./context/UserContext";

function App() {
  const { user } = useContext(UserContext);
  return (
    <BrowserRouter>
      {user && user.isLoading ?
        <div className='loading-container'>
          <ColorRing
            visible={true}
            height="80"
            width="80"
            ariaLabel="color-ring-loading"
            wrapperStyle={{}}
            wrapperClass="color-ring-wrapper"
            colors={['#e15b64', '#f47e60', '#f8b26a', '#abbd81', '#849b87']}
          />
          <div>Loading data ...</div>
        </div>
        :
        <>
          <div className='app-header'>
            <Header />
          </div>
          <div className='app-container'>
            <AppRoutes />
          </div>
        </>
      }
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

    </BrowserRouter>
  );
}

export default App;
