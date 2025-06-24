import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import React, { useEffect, useState } from 'react';
import { auth, provider } from "../firebase.js";

function SignUpPage() {

  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);

  function handleSignUp() {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("User successfully signed up", userCredential.user)
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