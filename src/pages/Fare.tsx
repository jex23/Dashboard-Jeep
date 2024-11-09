// pages/Fare.tsx
import React from "react";
import Sidebar from "../components/Sidebar";

const Fare: React.FC = () => {
  return (
    <div style={styles.container}>
      <Sidebar />
      <main style={styles.content}>
        <h1 style={styles.heading}>Fare Page</h1>
        <p style={styles.paragraph}>View and update fare details and pricing information here.</p>
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

export default Fare;
