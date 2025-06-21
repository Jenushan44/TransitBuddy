import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState } from 'react';


function App() {
  useEffect(() => {
    fetch("http://localhost:5000/subway_alerts")
      .then(res => res.json())
      .then(data => {
        console.log("Fetched delay:", data);
      });
  }, []);

  return (
    <div className="App">

    </div>
  );
}

export default App;


