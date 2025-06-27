import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import React, { useEffect, useState } from 'react';
import { auth, provider } from "../firebase.js";
import { useNavigate } from 'react-router-dom';

function SignUpPage() {

  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const navigate = useNavigate()

  function handleSignUp() {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("User successfully signed up", userCredential.user)
        navigate("/")
      })
      .catch((error) => {
        console.log("Error: User sign up failed", error.message)
      })
  }

  return (

    <div>
      <h1>Sign Up</h1>
      <p>Enter Email: </p>
      <input type="email" onChange={(event) => setEmail(event.target.value)}></input>
      <p>Enter Password: </p>
      <input type="password" onChange={(event) => setPassword(event.target.value)}></input>
      <button onClick={handleSignUp}>Sign up</button>
    </div>
  )
}

export default SignUpPage;