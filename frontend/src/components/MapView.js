import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Polyline, Popup } from "react-leaflet";
import { useRef } from 'react';

function MapView({ selected, preferredDays, alerts, lastFetched, clickedRoute }) {

  const [routeShapes, setRouteShapes] = useState({});
  const popupRefs = useRef({});

  function normalize(name) {
    if (!name || typeof name !== "string") {
      return "";
    }
    return name.toLowerCase().replace(/^\d+\s*/, '').trim();
  }

  useEffect(() => {
    fetch("/ordered_route_shapes.json")
      .then(res => res.json())
      .then(data => {
        setRouteShapes(data);
      })
      .catch(err => console.error("Failed to load shapes:", err));
  }, []);

  // Check if route has an active alert
  function hasAlert(routeName) {
    const normRoute = normalize(routeName);
    return alerts.some(alert => {
      const alertTitle = alert.title?.toLowerCase() || "";
      return normalize(alertTitle).includes(normRoute);
    });
  }


  useEffect(() => {
    const normClicked = normalize(clickedRoute);
    popupRefs.current[normClicked]?._source?.openPopup();
  }, [clickedRoute]);


  return (
    <div style={{ position: "relative" }}>

      <MapContainer
        center={[43.5, -79.35]}
        zoom={11}
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {selected.map((routeName, index) => {
          const name = routeName.trim();
          const shapeKey = Object.keys(routeShapes).find(key =>
            key.toLowerCase().includes(name.toLowerCase())
          );
          const shape = routeShapes[shapeKey];

          if (!shape) return null;

          const alertActive = hasAlert(routeName);
          const color = alertActive ? "red" : "green"; // Assign color based on route status

          return (
            <Polyline
              key={index}
              positions={shape}
              pathOptions={{ color, weight: 2 }}
            >
              <Popup
                ref={(ref) => {
                  if (ref) {
                    popupRefs.current[normalize(routeName)] = ref;
                  }
                }}
              >
                {`${routeName} (${alertActive ? "Alert" : "No Alert"})`}
              </Popup>
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