import logo from './logo.svg';
import './App.css';
import Navbar from "./Navbar";
import React, { useEffect, useState } from 'react';
<<<<<<< HEAD
import { Routes, Route } from "react-router-dom";
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';

function App() {

=======

function App() {

  const [alerts, setAlerts] = useState([]) // Holds array of alert data

  useEffect(() => {
    fetch("http://localhost:5000/subway_alerts") // Get data from Flask 
      .then(res => res.json()) // Turn the response into JSON
      .then(data => {
        console.log("Fetched delay:", data);
        setAlerts(data) // Save it into a state so React can use it
      });
  }, []); // Only runs one time, when the page first loads

>>>>>>> 04a77da96180b0812ea17e321ae960d89f83e27b
  return (

    <div className="App">
      <Navbar />
<<<<<<< HEAD
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>

    </div >
  );

=======


      {alerts.map((alert, index) => (
        <div className="alert-box" key={index}>
          <p>{alert.description}</p>
        </div>
      ))}
    </div>
  );
>>>>>>> 04a77da96180b0812ea17e321ae960d89f83e27b
}

export default App;