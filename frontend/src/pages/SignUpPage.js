import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import React, { useEffect, useState } from 'react';
import { auth, provider } from "../firebase.js";
import { useNavigate, Link } from 'react-router-dom';

function SignUpPage() {
  const [email, setEmail] = useState(null); // Store user email input
  const [password, setPassword] = useState(null); // Store user password input
  const navigate = useNavigate()

  function handleSignUp() {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("User signed up successfully", userCredential.user)
        navigate("/")
      })
      .catch((error) => {
        console.log("Error: User sign up failed", error.message)
      })
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Create Account</h1>

        <input
          type="email"
          placeholder="Enter email"
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
        />

        <input
          type="password"
          placeholder="Enter password"
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
        />

        <button onClick={handleSignUp} className="login-btn">
          Sign Up
        </button>

        <p className="signup-text">
          Already have an account? <a href="/login" className="signup-link">Log in</a>
        </p>
      </div>
    </div>


  );
}

export default SignUpPage;