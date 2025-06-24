import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import React, { useEffect, useState } from 'react';
import { auth, provider } from "../firebase.js";


function LoginPage() {

  const [email, setEmail] = useState(null)
  const [password, setPassword] = useState(null)

  function handleLogin() {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("User successfully logged in", userCredential.user)
      })
      .catch((error) => {
        console.log("Error: Login failed", error.message)
      });
  }

  return (
    <div>
      <h1>Login Page</h1>
      <p>Email: </p>
      <input type="email" onChange={(event) => setEmail(event.target.value)}></input>
      <p>Password: </p>
      <input type="password" onChange={(event) => setPassword(event.target.value)}></input>

      <button onClick={handleLogin}>Login</button>
      <button>Sign Up</button>

    </div>

  )
}

export default LoginPage;