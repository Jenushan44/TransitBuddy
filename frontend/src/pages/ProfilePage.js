import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getDoc } from "firebase/firestore";

function ProfilePage({ preferredDays, setPreferredDays, selected, setSelected }) {
  const [telegramId, setTelegramId] = useState("");
  const [telegramIdInput, setTelegramIdInput] = useState(""); // Telegram Id input field value
  const [user, setUser] = useState(null); // Tracks the current user
  const database = getFirestore();
  const [allRoutes, setAllRoutes] = useState([]);
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
      const userDataReference = doc(database, "users", user.uid)
      // Save user's telegramID and preferredDays with existing data 
      await setDoc(userDataReference, {
        telegramId: telegramIdInput,
        preferredDays: preferredDays
      }, { merge: true });
      alert("Telegram ID saved");
      setTelegramId(telegramIdInput);
      setTelegramIdInput("");

      fetch("https://transitbuddy.onrender.com/send_alerts")
        .then(res => res.text())
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
        const userDocReference = doc(database, "users", user.uid);
        const userDoc = await getDoc(userDocReference);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setTelegramId(userData.telegramId || "");
          setTelegramIdInput("");
          setPreferredDays(userData.preferredDays || [0, 1, 2, 3, 4, 5, 6]);
          setSelected(userData.selectedRoutes || []);
        }
      } else {
        setUser(null);
        setSelected([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetch("https://transitbuddy.onrender.com/all_routes")
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
  )
    .filter(route =>
      !route.toLowerCase().includes("route_short_name") &&
      !route.toLowerCase().includes("route_long_name"));


  const saveSelectedRoutes = async () => {
    if (!user) {
      alert("Please log in to save routes");
      return;
    }

    try {
      const userDataReference = doc(database, "users", user.uid);
      await setDoc(userDataReference, {
        selectedRoutes: selected
      }, { merge: true });

      alert("Routes saved!");
    } catch (error) {
      alert("Failed to save routes.");
      console.error("Save routes error:", error);
    }
  };



  return (
    <div>
      <div className="profile-section">
        <h2>Your TransitBuddy Profile</h2>
        <div className="user-info-grid">
          <div className="user-label">Name:</div>
          <div className="user-value">{user?.displayName || "N/A"}</div>

          <div className="user-label">Email:</div>
          <div className="info-with-button">
            <div className="user-value">{user?.email || "N/A"}</div>
          </div>

          <div className="user-label">Telegram ID:</div>
          <div className="info-with-button">
            <div className="user-value">{telegramId}</div>
            {telegramId && (
              <button
                className="delete-button"
                onClick={async () => {
                  const userDataReference = doc(database, "users", user.uid);
                  await setDoc(userDataReference, { telegramId: "" }, { merge: true });
                  setTelegramId("");
                  setTelegramIdInput("");
                }}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="profile-section">
        <h2>Link Your Telegram for Alerts</h2>
        <div className="form-group">
          <input
            id="telegram"
            type="text"
            placeholder="Enter Telegram ID"
            className="form-input"
            value={telegramIdInput}
            onChange={e => setTelegramIdInput(e.target.value)}
          />
          <button className="navbar-button" onClick={handleSavedRoutes}>
            Save ID
          </button>
        </div>
      </div>

      <div className="profile-section">
        <h2>Set Your Alert Schedule</h2>
        <div className="day-buttons">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
            <button
              key={idx}
              className={`day-button ${preferredDays.includes(idx) ? "selected" : ""}`}
              onClick={() => selectDay(idx)}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <div className="profile-section">
        <h2>Choose your routes to personalize alerts</h2>
        <input
          type="text"
          className="form-input"
          placeholder="Search routes"
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
        />
        <div className="checkbox-grid">
          {filteredRoutes.map((item) => (
            <label key={item} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <input
                type="checkbox"
                checked={selected.includes(item)}
                onChange={() => handleCheckBoxChange(item)}
              />
              <span className="route-label-text">{item}</span>
            </label>
          ))}
        </div>
        <button className="save-routes-button" onClick={saveSelectedRoutes}>
          Save Routes
        </button>

      </div>
    </div>
  );

}
export default ProfilePage