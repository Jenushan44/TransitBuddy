import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getDoc } from "firebase/firestore";
import MapView from '../components/MapView';
import { useRef } from 'react';


function HomePage({ selected, setSelected }) {
  const [alerts, setAlerts] = useState([]) // All current TTC alerts
  const [user, setUser] = useState(null); // Logged in user
  const [lastFetched, setLastFetched] = useState(null); // Last time alerts were updated
  const [clickedRoute, setClickedRoute] = useState(null);


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
    if (!unixTime || isNaN(unixTime)) { // Handles any invalid timestamps 
      return "unknown time";
    }
    const diff = Date.now() / 1000 - Number(unixTime); // Difference between now  and the start time

    if (diff < 60) {
      return "Just now";
    }

    if (diff < 3600) {
      return `${Math.floor(diff / 60)} minutes ago`;
    }

    if (diff < 86400) {
      return `${Math.floor(diff / 3600)} hours ago`;
    }
    return `${Math.floor(diff / 86400)} days ago`;
  }

  useEffect(() => {
    const stopAuth = onAuthStateChanged(auth, async (user) => { // Sets up firebase auth listener that watches user login/logout
      if (user) {
        setUser(user);
        const userDocReference = doc(getFirestore(), "users", user.uid); // Get path to user document in Firestore
        const userDoc = await getDoc(userDocReference); // Fetch user document 
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

  const handleRouteClick = (routeName) => {
    setClickedRoute(routeName);
    const match = alerts.find(alert => {
      const cleanAlert = alert.description?.toLowerCase().replace(/\d+\sline\s/, 'line ');
      const cleanRoute = routeName.toLowerCase().replace(/\d+\s*/, '');
      return cleanAlert && cleanAlert.includes(cleanRoute);
    });


    if (match) {
      const alertId = `alert-${alerts.indexOf(match)}`;
      const alertElement = document.getElementById(alertId);

      if (alertElement) {
        alertElement.scrollIntoView({ behavior: 'smooth', block: 'center' }); // Scroll to alert box smoothly
        alertElement.classList.add('flash-highlight'); // Highlight selected alert
        setTimeout(() => {
          alertElement.classList.remove('flash-highlight');
        }, 3000); // Remore highlight effect after 3 seconds 
      }
    }
  };

  return (
    <div className="homepage-container">
      <div className="banner-section">
        <div className="homepage-title">Welcome to TransitBuddy</div>
        <div className="homepage-subtitle">Save your routes to receive real-time TTC delay alerts via email or Telegram.</div>
      </div>

      <div className="main-grid">
        <div className="left-panel">
          <div className="alerts-section">
            <h2 className="section-title">Current Alerts</h2>
            <div className="alerts-scroll">
              {alerts.map((alert, index) => {
                const alertId = `alert-${index}`;
                return (
                  <div className="alert-box" key={index} id={alertId}>
                    <p className="alert-description">{alert.description}</p>
                    <p className="alert-time">
                      {alert.start_time
                        ? `Started ${timeAgo(alert.start_time)}`
                        : "Start time not available"}
                    </p>
                  </div>
                );
              })}

            </div>
          </div>
        </div>

        <div className="right-panel">
          <div className="saved-section">
            <h2>Your Saved Routes</h2>
            <div className="saved-routes">
              {selected.length > 0 ? (
                selected.map((route, index) => (
                  <button
                    key={route}
                    className="saved-route-pill"
                    onClick={() => handleRouteClick(route)}
                  >
                    {route}
                  </button>
                ))
              ) : (
                <span className="no-saved">None saved yet</span>
              )}
            </div>
          </div>

          <div className="map-section">
            <MapView selected={selected} alerts={alerts} lastFetched={lastFetched} clickedRoute={clickedRoute} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;