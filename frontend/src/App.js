import logo from './logo.svg';
import './App.css';
import Navbar from "./Navbar";
import React, { useEffect, useState } from 'react';

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

  return (

    <div className="App">
      <Navbar />


      {alerts.map((alert, index) => (
        <div className="alert-box" key={index}>
          <p>{alert.description}</p>
        </div>
      ))}
    </div>
  );
}

export default App;