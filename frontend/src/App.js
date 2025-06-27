import logo from './logo.svg';
import './App.css';
import Navbar from "./Navbar";
import React, { useEffect, useState } from 'react';
import { Routes, Route } from "react-router-dom";
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';

function App() {

  const [alerts, setAlerts] = useState([]) // Holds array of alert data
  const options = ["504 King", "Line 1", "Line 2", "985 Sheppard East"]
  const [selected, setSelected] = useState([])

  useEffect(() => {
    fetch("http://localhost:5000/subway_alerts") // Get data from Flask 
      .then(res => res.json()) // Turn the response into JSON
      .then(data => {
        console.log("Fetched delay:", data);
        setAlerts(data) // Save it into a state so React can use it
      });
  }, []); // Only runs one time, when the page first loads

  function handleCheckBoxChange(item) {
    let newSelected = [...selected] // Create new copy of array

    if (newSelected.includes(item)) {
      // Keep only items in array not equal to item
      // If item in array, remove it because user is unchecking
      newSelected = newSelected.filter(i => i !== item)
    } else {
      newSelected.push(item);
    }
    setSelected(newSelected);
  }

  return (

    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>
      <div>
        <h1>Choose your routes to personalize alerts</h1>
        {options.map((item) => {
          return (
            <label key={item} style={{ display: "block", margin: "5px" }}>
              <input
                type='checkbox'
                checked={selected.includes(item)}
                onChange={() => handleCheckBoxChange(item)}
              >
              </input>
              {item}
            </label>
          );
        })}
      </div>

    </div >
  );
}

export default App;