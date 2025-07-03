import './App.css';
import Navbar from "./components/Navbar";
import React, { useEffect, useState } from 'react';
import { Routes, Route } from "react-router-dom";
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import ProfilePage from './pages/ProfilePage';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { getFirestore, doc } from "firebase/firestore";
import { getDoc } from "firebase/firestore";


function App() {

  const [selected, setSelected] = useState([])
  const [preferredDays, setPreferredDays] = useState([0, 1, 2, 3, 4, 5, 6]);

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