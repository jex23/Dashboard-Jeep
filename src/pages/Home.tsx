// pages/Home.tsx

import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLngExpression } from 'leaflet';
import { db } from "../firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";

// Define the custom icons
const passengerIcon = L.icon({
  iconUrl: 'src/assets/arm-up.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const busIcon = L.icon({
  iconUrl: 'src/assets/bus2.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Define TypeScript interfaces for Passenger and Conductor data
interface Passenger {
  id: string;
  fullName: string;
  latitude: number;
  longitude: number;
  passengerType: string;
}

interface BusLocation {
  latitude: number;
  longitude: number;
}

interface Conductor {
  id: string;
  name: string;
  busLocation: BusLocation;
  busNumber: number;
  busType: string;
  selectedRoute: string;
}

const Home: React.FC = () => {
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [conductors, setConductors] = useState<Conductor[]>([]);

  useEffect(() => {
    // Real-time listener for Passengers
    const unsubscribePassengers = onSnapshot(collection(db, "Passengers"), (snapshot) => {
      const passengersData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Passenger))
        .filter(data => data.latitude !== undefined && data.longitude !== undefined);
      setPassengers(passengersData);
    });

    // Real-time listener for Conductors
    const unsubscribeConductors = onSnapshot(collection(db, "Conductors"), (snapshot) => {
      const conductorsData = snapshot.docs
        .map(doc => {
          const data = doc.data() as Conductor;
          const busLocation = data.busLocation || { latitude: undefined, longitude: undefined };
          return {
            id: doc.id,
            name: data.name,
            busLocation: busLocation,
            busNumber: data.busNumber,
            busType: data.busType,
            selectedRoute: data.selectedRoute,
          };
        })
        .filter(
          (conductor): conductor is Conductor => 
            conductor.busLocation.latitude !== undefined && conductor.busLocation.longitude !== undefined
        );
      setConductors(conductorsData);
    });

    // Clean up listeners on component unmount
    return () => {
      unsubscribePassengers();
      unsubscribeConductors();
    };
  }, []);

  const defaultPosition: LatLngExpression = [12.983128578876736, 124.04054291948083];

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <Sidebar />

      {/* Full-Screen Map */}
      <MapContainer center={defaultPosition} zoom={12} style={styles.mapContainer}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Render each passenger as a marker, only if latitude and longitude are defined */}
        {passengers.map(passenger => (
          <Marker
            key={passenger.id}
            position={[passenger.latitude, passenger.longitude] as LatLngExpression}
            icon={passengerIcon}
          >
            <Popup>
              <strong>{passenger.fullName}</strong><br />
              Type: {passenger.passengerType}
            </Popup>
          </Marker>
        ))}

        {/* Render each conductor as a bus marker, only if latitude and longitude are defined */}
        {conductors.map(conductor => (
          <Marker
            key={conductor.id}
            position={[conductor.busLocation.latitude, conductor.busLocation.longitude] as LatLngExpression}
            icon={busIcon}
          >
            <Popup>
              <strong>{conductor.name}</strong><br />
              Bus Number: {conductor.busNumber}<br />
              Bus Type: {conductor.busType}<br />
              Route: {conductor.selectedRoute}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

// Full-Screen Styles for Home page layout
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    width: "100vw",
    height: "100vh",
    backgroundColor: "#f4f4f4",
  },
  mapContainer: {
    width: "100vw",
    height: "100vh",
  },
};

export default Home;
