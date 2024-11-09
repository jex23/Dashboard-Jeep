// pages/ForPickup.tsx
import React from "react";
import Sidebar from "../components/Sidebar";

const ForPickup: React.FC = () => {
  return (
    <div style={styles.container}>
      <Sidebar />
      <main style={styles.content}>
        <h1 style={styles.heading}>For Pickup Page</h1>
        <p style={styles.paragraph}>View and manage pickups scheduled for today.</p>
      </main>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    width: "100vw",
    height: "100vh",
    backgroundColor: "#f4f4f4",
  },
  content: {
    flex: 1,
    padding: "2rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #4c6ef5, #b23fef)",
    color: "#333",
  },
  heading: {
    fontSize: "2rem",
    color: "#333",
    marginBottom: "1rem",
  },
  paragraph: {
    fontSize: "1.25rem",
    color: "#666",
  },
};

export default ForPickup;
