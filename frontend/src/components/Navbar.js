import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, provider } from "../firebase.js";
import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";

function NavBar() {

  const [user, setUser] = useState(null);

  function handleLogout() {
    signOut(auth);
  }

  useEffect(() => {
    const stopAuthListener = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
    return () => stopAuthListener();
  }, []);

  return (
    <div className="navbar">
      <div className="navbar-left">
        <div className="logo">Transit<span className="highlight">Buddy</span></div>
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/profile" className="nav-link">Profile</Link>
      </div>

      <div className="navbar-right">
        {user ? (
          <>
            <span className="welcome">Welcome, {user.displayName || user.email}</span>
            <button className="navbar-button" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/signup"><button className="navbar-button">Sign Up</button></Link>
            <Link to="/login"><button className="navbar-button">Login</button></Link>
          </>
        )}
      </div>
    </div>

  );
}

export default NavBar
