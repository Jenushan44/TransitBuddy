import logo from './logo.svg';
import './App.css';
import Navbar from "./Navbar";
import React, { useEffect, useState } from 'react';
import { Routes, Route } from "react-router-dom";
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';

function App() {

  return (

    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>

    </div >
  );

}

export default App;