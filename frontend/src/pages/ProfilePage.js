import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getDoc } from "firebase/firestore";

function ProfilePage({ preferredDays, setPreferredDays, selected, setSelected }) {
  const [telegramId, setTelegramId] = useState(""); // Store Telegram user input
  const [user, setUser] = useState(null); // Tracks the current user
  const database = getFirestore();
  const [allRoutes, setAllRoutes] = useState([]); // Holds all available routes
  const [userSearch, setUserSearch] = useState(""); // Store users route search

  // Switch a selected day on or off in prefferedDays
  const selectDay = (dayIndex) => {
    setPreferredDays(prev =>
      prev.includes(dayIndex)
        ? prev.filter(d => d !== dayIndex) // Remove it from selected
        : [...prev, dayIndex] // Add it to selected
    );
  };

  // Save Telegram ID and preferred days to Firestore
  const handleSavedRoutes = async () => {
    if (!user) {
      alert("Please log in to save routes"); // Prevent save if user not logged in
      return;
    }

    try {
      const userDataRef = doc(database, "users", user.uid)
      // Save user's telegramID and preferredDays with existing data 
      await setDoc(userDataRef, {
        telegramId: telegramId,
        preferredDays: preferredDays
      }, { merge: true });
      alert("Routes saved");

      fetch("http://localhost:5000/send_alerts")
        .then(res => res.text())
        .then(data => {
        })
        .catch(error => {
          console.error("Error sending alerts:", error);
        });
    } catch (error) {
      alert("Error saving routes. Please try again")
    }
  }

  // Check for login/logout changes and fetch user preferences
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDocRef = doc(database, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setTelegramId(userData.telegramId || "");
          setPreferredDays(userData.preferredDays || [0, 1, 2, 3, 4, 5, 6]);
        }
      } else {
        setUser(null);
        setSelected([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/all_routes")
      .then(res => res.json())
      .then(data => {
        setAllRoutes(data)
      });
  }, []);

  // Update the selected routes when checkbox is changed
  function handleCheckBoxChange(item) {
    let newSelected = [...selected]

    if (newSelected.includes(item)) {
      newSelected = newSelected.filter(i => i !== item) // Remove from selected if already selected
    } else {
      newSelected.push(item); // Add to selected if not in selected 
    }
    setSelected(newSelected);
  }

  // Filters routes based on user search input
  const filteredRoutes = allRoutes.filter(route =>
    route.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div>
      <h1>Profile Page</h1>
      <div>
        <h1>Select preferred days</h1>
        <div style={{ padding: "10px", textAlign: "center" }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
            <button
              key={idx}
              onClick={() => selectDay(idx)}
              style={{
                margin: "5px",
                padding: "8px 12px",
                borderRadius: "5px",
                backgroundColor: preferredDays.includes(idx) ? "#007bff" : "#ccc",
                color: "white",
                border: "none",
                cursor: "pointer"
              }}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h2>Add Telegram Id Number</h2>
        <div>
          <p>Enter Telegram Id: </p>
          <input
            type="text"
            value={telegramId}
            onChange={e => setTelegramId(e.target.value)}
          />
        </div>
      </div>
      <button onClick={handleSavedRoutes}>Save Preferences</button>
      <div>
        <h1>Choose your routes to personalize alerts</h1>
        <input
          type='text'
          placeholder="Search routes"
          value={userSearch}
          onChange={(event) => {
            setUserSearch(event.target.value);
          }}
        >
        </input>
        <div className="route-scroll-bar" style={{ maxHeight: "300px", overflowY: "scroll", border: "1px solid #ccc", padding: "10px" }}>
          {filteredRoutes.map((item) => (
            <label key={item} style={{ display: "block", margin: "5px" }}>
              <input
                type="checkbox"
                checked={selected.includes(item)}
                onChange={() => handleCheckBoxChange(item)}
              />
              {item}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage