import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, provider } from "./firebase.js";
import React, { useEffect, useState } from 'react';
<<<<<<< HEAD
import { Link } from "react-router-dom";
=======
>>>>>>> 04a77da96180b0812ea17e321ae960d89f83e27b

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
<<<<<<< HEAD
  }, [])

  return (
    <div className="navbar">
      <Link to="/login"><button className="navbar-button">Login</button></Link>
      <Link to="/signup"><button className="navbar-button">Sign Up</button></Link>
    </div>
  );
}

/* {user ? (
=======
  })

  return (
    <div className="navbar">
      {user ? (
>>>>>>> 04a77da96180b0812ea17e321ae960d89f83e27b
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
<<<<<<< HEAD
*/

export default NavBar
=======
    </div>

  );
}

export default NavBar
>>>>>>> 04a77da96180b0812ea17e321ae960d89f83e27b
