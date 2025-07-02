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
      {user ? (
        <>
          <Link to="/"><button className="navbar-button">Home</button></Link>
          <Link to="/Profile"><button className="navbar-button">Profile</button></Link>

          <p>Welcome {user.displayName || user.email}</p>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/"><button className="navbar-button">Home</button></Link>
          <Link to="/Profile"><button className="navbar-button">Profile</button></Link>

          <Link to="/login"><button className="navbar-button">Login</button></Link>
          <Link to="/signup"><button className="navbar-button">Sign Up</button></Link>
        </>
      )}
    </div>
  );
}

export default NavBar
