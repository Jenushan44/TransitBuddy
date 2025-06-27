import React, { useEffect, useState } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getDoc, getDocs, collection } from "firebase/firestore";


function HomePage() {
  const [alerts, setAlerts] = useState([]) // Holds array of alert data
  const options = ["504 King", "Line 1", "Line 2", "985 Sheppard East"]
  const [selected, setSelected] = useState([])
  const [user, setUser] = useState(null);
  const database = getFirestore();
  const [allRoutes, setAllRoutes] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const routesPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch("http://localhost:5000/subway_alerts") // Get data from Flask 
      .then(res => res.json()) // Turn the response into JSON
      .then(data => {
        console.log("Fetched delay:", data);
        setAlerts(data) // Save it into a state so React can use it
      });
  }, []); // Only runs one time, when the page first loads

  function handleCheckBoxChange(item) {
    let newSelected = [...selected] // Create new copy of array

    if (newSelected.includes(item)) {
      // Keep only items in array not equal to item
      // If item in array, remove it because user is unchecking
      newSelected = newSelected.filter(i => i !== item)
    } else {
      newSelected.push(item);
    }
    setSelected(newSelected);
  }

  async function handleSavedRoutes() {
    if (!user) {
      alert("Please log in to save routes");
      return;
    }

    try {

      const userDataRef = doc(database, "users", user.uid) // Points to the users document in the users collection
      await setDoc(userDataRef, {
        selectedRoutes: selected
      });
      alert("Routes saved");

    } catch (error) {
      alert("Error saving routes. Please try again")
    }
  }

  async function displaySavedRoutes() {
    if (!user) {
      alert("Please log in to view saved routes");
      return;
    }

    try {
      const userDocRef = doc(database, "users", user.uid)
      const userInfo = await getDoc(userDocRef)


      if (userInfo.exists()) {
        const data = userInfo.data();
        setSelected(data.selectedRoutes || []);
      } else {
        alert("No saved routes found.");
      }



    } catch (error) {
      alert("Error viewing routes, Please try again")
    }
  }


  useEffect(() => {
    const stopAuthListener = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);

        displaySavedRoutes();

      } else {
        setUser(null);
      }
    });
    return () => stopAuthListener();
  }, [])

  useEffect(() => {
    fetch("http://localhost:5000/all_routes")
      .then(res => res.json())
      .then(data => {
        console.log("Fetched delay:", data);
        setAllRoutes(data)
      });
  }, []);

  const start = (currentPage - 1) * routesPerPage;
  const end = start + routesPerPage;

  const filteredRoutes = allRoutes.filter(route => route.toLowerCase().includes(userSearch.toLowerCase()));


  return (
    <div>
      {alerts.map((alert, index) => (
        <div className="alert-box" key={index}>
          <p>{alert.description}</p>

        </div>
      ))}

      <div>
        <h1>Choose your routes to personalize alerts</h1>
        <input
          type='text'
          placeholder="Search routes"
          value={userSearch}
          onChange={(event) => {
            setUserSearch(event.target.value);
            setCurrentPage(1);
          }}

        >

        </input>

        <div className="route-scroll-bar">
          {filteredRoutes.map((item) => {
            return (
              <label key={item} style={{ display: "block", margin: "5px" }}>
                <input
                  type='checkbox'
                  checked={selected.includes(item)}
                  onChange={() => handleCheckBoxChange(item)}
                >
                </input>
                {item}
              </label>
            );
          })}

        </div>

      </div>

      <button onClick={handleSavedRoutes}>Save Routes</button>

      <div>
        <h1>Your Saved Routes</h1>
        <button onClick={displaySavedRoutes} disabled={!user}>View your routes</button>
        <p>Selected: {selected.join(", ")}</p>


      </div>


    </div>
  )
}

export default HomePage;