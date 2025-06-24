import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, provider } from "./firebase.js";
import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";

function NavBar() {

  const [user, setUser] = useState(null);

  function handleGoogleLogin() {
    signInWithPopup(auth, provider)
      .then(result => {
        console.log("User logged in: ", result.user);
      })
      .catch((error) => {
        console.error("Login error: ", error);
      });
  }

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
  }, [])

  return (
    <div className="navbar">
      <Link to="/login"><button className="navbar-button">Login</button></Link>
      <Link to="/signup"><button className="navbar-button">Sign Up</button></Link>
    </div>
  );
}

/* {user ? (
        <>
          <p>Welcome {user.displayName || user.email}</p>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <button className="navbar-button" onClick={handleGoogleLogin}>Login</button>
          <button className="navbar-button">Sign Up</button>
        </>
      )}
*/

export default NavBar
