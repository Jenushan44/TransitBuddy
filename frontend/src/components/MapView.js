import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Polyline, Popup } from "react-leaflet";

function MapView({ selected, preferredDays, alerts, lastFetched }) {

  const [routeShapes, setRouteShapes] = useState({}); // Store all route shape data

  function cleanRouteName(rawRoute) {
    return rawRoute.trim(); // Removes whitespace around route name
  }

  useEffect(() => {
    fetch("/ordered_route_shapes.json")
      .then(res => res.json())
      .then(data => {
        setRouteShapes(data);
      })
      .catch(err => console.error("Failed to load shapes:", err));
  }, []);

  console.log("Selected routes:", selected);

  // Check if route has an active alert
  function hasAlert(routeName) {
    return alerts.some(alert =>
      alert.title && alert.title.toLowerCase().includes(routeName.toLowerCase()) // Check through all alerts to match route name
    );
  }

  return (
    <div style={{ position: "relative" }}>

      <MapContainer
        center={[43.651070, -79.347015]}
        zoom={13}
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {selected.map((routeName, idx) => {
          const name = cleanRouteName(routeName);
          const shape = routeShapes[name];
          if (!shape) return null;

          const alertActive = hasAlert(routeName);
          const color = alertActive ? "red" : "green"; // Assign color based on route status

          return (
            <Polyline
              key={idx}
              positions={shape}
              pathOptions={{ color, weight: 2 }}
            >
              <Popup>{`${routeName} (${alertActive ? "Alert" : "No Alert"})`}</Popup>
            </Polyline>
          );
        })}

      </MapContainer >
      {lastFetched && (
        <div className="last-updated">
          Last updated: {lastFetched.toLocaleString()}
        </div>
      )}
    </div>
  );
}

export default MapView;