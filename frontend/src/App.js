import './App.css';
import Navbar from "./components/Navbar";
import React, { useEffect, useState } from 'react';
import { Routes, Route } from "react-router-dom";
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import MapView from "./components/MapView";
import ProfilePage from './pages/ProfilePage';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getDoc } from "firebase/firestore";


function App() {

  const [alerts, setAlerts] = useState([]) // Holds array of alert data
  const [selected, setSelected] = useState([])
  const [preferredDays, setPreferredDays] = useState([0, 1, 2, 3, 4, 5, 6]);


  useEffect(() => {
    fetch("http://localhost:5000/subway_alerts") // Get data from Flask 
      .then(res => res.json()) // Turn the response into JSON
      .then(data => {
        console.log("Fetched delay:", data);
        setAlerts(data) // Save it into a state so React can use it
      });
  }, []); // Only runs one time, when the page first loads

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const db = getFirestore();
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setPreferredDays(userData.preferredDays || [0, 1, 2, 3, 4, 5, 6]);
          setSelected(userData.selectedRoutes || []);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage selected={selected} setSelected={setSelected} preferredDays={preferredDays} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/profile" element={<ProfilePage preferredDays={preferredDays} setPreferredDays={setPreferredDays} selected={selected} setSelected={setSelected} />} />
      </Routes>
    </div >
  );
}

export default App;