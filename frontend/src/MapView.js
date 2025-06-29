import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

function MapView() {

  const [allRoutes, setAllRoutes] = useState([])

  const stationCoordinates =
  {
    "Union": [43.6453, -79.3806],
    "Finch": [43.6717, -79.4149],
    "Kipling Station": [43.6366, -79.5357],
    "504": [43.652, -79.379],      // King streetcar
    "85": [43.775, -79.345],       // Sheppard East bus
    "501": [43.6503, -79.3967],  // Queen streetcar
    "9 Bellamy": [43.7434, -79.2314] // 9 Bellamy

  }


  useEffect(() => {
    fetch("http://localhost:5000/subway_alerts")
      .then(res => res.json())
      .then(data => {
        console.log("Fetched delay:", data);
        setAllRoutes(data)
      });
  }, [])

  const alertMarkers = []

  for (let i = 0; i < allRoutes.length; i++) {
    let alert = allRoutes[i];
    for (let stationName in stationCoordinates) {
      if (alert.title.toLowerCase().includes(stationName.toLowerCase())) {
        let coordinates = stationCoordinates[stationName];
        alertMarkers.push({
          position: coordinates,
          message: alert.title
        });
      }
    }
  }

  return (
    <MapContainer
      center={[43.651070, -79.347015]}
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {/*{subwayStations.map((station, index) => (
        <Marker key={index} position={station.position}>
          <Popup>{station.name}</Popup>
        </Marker>
      ))}*/}

      {alertMarkers.map((alert, index) => (
        <Marker key={index} position={alert.position}>
          <Popup>{alert.message}</Popup>
        </Marker>
      ))}

    </MapContainer>
  );
}

export default MapView;




