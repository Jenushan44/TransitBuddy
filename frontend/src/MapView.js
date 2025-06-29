import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

function MapView() {

  const [allRoutes, setAllRoutes] = useState([])

  const subwayStations = [
    { name: "Union Station", position: [43.6453, -79.3806] },
    { name: "Bloor-Yonge", position: [43.6717, -79.3857] },
    { name: "Finch Station", position: [43.7803, -79.4149] },
    { name: "Kipling Station", position: [43.6366, -79.5357] }
  ];

  const stationCoordinates =
  {
    "Union": [43.6453, -79.3806],
    "Finch": [43.6717, -793857],
    "Kipling Station": [43.6366, -79.5357]
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
      if (alert.title.includes(stationName)) {
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




