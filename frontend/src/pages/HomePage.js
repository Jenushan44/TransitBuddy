import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getDoc } from "firebase/firestore";
import MapView from '../components/MapView';

function HomePage({ selected, setSelected }) {
  const [alerts, setAlerts] = useState([]) // All current TTC alerts
  const [user, setUser] = useState(null); // Logged in user
  const [lastFetched, setLastFetched] = useState(null); // Last time alerts were updated

  function fetchAlerts() {
    fetch("http://localhost:5000/subway_alerts") // Sends a Get request to /subway_alerts route
      .then(res => res.json())
      .then(data => {
        setAlerts(data)
        setLastFetched(new Date()); // Store the timestamp of fetch 
      });
  }

  useEffect(() => {
    fetchAlerts();
    const fetchInterval = setInterval(fetchAlerts, 60000); // Set timer to run fetch alerts every 60 seconds
    return () => clearInterval(fetchInterval) // Stop timer when page changes or componenet is removed 
  }, []);

  function timeAgo(unixTime) {
    if (!unixTime || isNaN(unixTime) || Number(unixTime) < 1000000000) return "unknown time"; // Handles any invalid timestamps
    const diff = Date.now() / 1000 - Number(unixTime); // Difference between now  and the start time
    if (diff < 60) return `Just now`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  }

  useEffect(() => {
    const stopAuth = onAuthStateChanged(auth, async (user) => { // Sets up firebase auth listener that watches user login/logout
      if (user) {
        setUser(user);
        const userDocRef = doc(getFirestore(), "users", user.uid); // Get path to user document in Firestore
        const userDoc = await getDoc(userDocRef); // Fetch user document 
        if (userDoc.exists()) {
          const userData = userDoc.data(); // Get actual data inside document
          setSelected(userData.selectedRoutes || []);
        }
      } else {
        setUser(null);
        setSelected([]);
      }
    });
    return () => stopAuth();
  }, []);

  return (
    <div>
      {alerts.map((alert, index) => {
        return (
          <div className="alert-box" key={index}>
            <p>{alert.description}</p>
            <p>
              {alert.start_time
                ? `Started ${timeAgo(alert.start_time)}`
                : "Start time not available"}
            </p>
          </div>
        );
      })}
      <div>
        <h1>Your Saved Routes</h1>
        <p>Selected: {selected.join(", ")}</p>
      </div>
      <MapView selected={selected} alerts={alerts} lastFetched={lastFetched} />
    </div>
  )
}

export default HomePage;