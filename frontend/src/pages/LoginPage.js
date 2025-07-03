import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useEffect, useState } from 'react';
import { auth, provider } from "../firebase.js";
import { useNavigate, Link } from 'react-router-dom';
import { signInWithPopup, onAuthStateChanged, sendPasswordResetEmail } from "firebase/auth";

function LoginPage() {

  const [email, setEmail] = useState(null) // Store user email input 
  const [password, setPassword] = useState(null) // Store user password input 
  const navigate = useNavigate(); // Redirect user after login

  function handleLogin() {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("User logged in successfully", userCredential.user)
        navigate("/")
      })
      .catch((error) => {
        console.log("Error: Login failed", error.message)
      });
  }

  function handlePasswordReset() {
    if (!email) {
      alert("Please enter your email first.");
      return;
    }

    sendPasswordResetEmail(auth, email)
      .then(() => {
        alert("Password reset email sent");
      })
      .catch((error) => {
        console.error("Password reset error:", error);
        alert("Failed to send reset email. Please try again.");
      });
  }


  function handleGoogleLogin() {
    signInWithPopup(auth, provider)
      .then(result => {
        console.log("User logged in: ", result.user);
        navigate("/")
      })
      .catch((error) => {
        console.error("Login error: ", error);
      });
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Login</h1>

        <input
          type="email"
          className="login-input"
          placeholder="Enter email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="login-input"
          placeholder="Enter password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="login-buttons">
          <button className="login-btn" onClick={handleLogin}>Login</button>
          <button className="google-btn" onClick={handleGoogleLogin}>Google</button>
        </div>

        <p className="forgot-password" onClick={handlePasswordReset}>
          Forgot password?
        </p>


        <p className="signup-text">
          Don’t have an account?{" "}
          <Link className="signup-link" to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>

  )
}

export default LoginPage;