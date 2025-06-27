import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import React, { useEffect, useState } from 'react';
import { auth, provider } from "../firebase.js";
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";


function LoginPage() {

  const [email, setEmail] = useState(null)
  const [password, setPassword] = useState(null)
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  function handleLogin() {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("User successfully logged in", userCredential.user)
        navigate("/")
      })
      .catch((error) => {
        console.log("Error: Login failed", error.message)
      });
  }

  function handleGoogleLogin() {
    signInWithPopup(auth, provider)
      .then(result => {
        console.log("User logged in: ", result.user);
      })
      .catch((error) => {
        console.error("Login error: ", error);
      });
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
    <div>
      <h1>Login Page</h1>
      <p>Email: </p>
      <input type="email" onChange={(event) => setEmail(event.target.value)}></input>
      <p>Password: </p>
      <input type="password" onChange={(event) => setPassword(event.target.value)}></input>

      <button onClick={handleLogin}>Login</button>
      <button onClick={handleGoogleLogin}>Google</button>

    </div>

  )
}

export default LoginPage;