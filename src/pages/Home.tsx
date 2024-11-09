// pages/Home.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login"); // Redirect to login page after logging out
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.heading}>Welcome to the Home Page</h1>
        <p style={styles.paragraph}>You are successfully logged in!</p>
        <button style={styles.button} onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

// Updated styles
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100vw",           // Full viewport width
    height: "100vh",          // Full viewport height
    background: "linear-gradient(135deg, #4c6ef5, #b23fef)",
    padding: "1rem",
    boxSizing: "border-box",   // Ensure padding doesn’t push content beyond viewport
  },
  card: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.15)",
    width: "100%",             // Make the card take up all available width
    maxWidth: "600px",          // Optional max-width for larger screens
    textAlign: "center",
  },
  heading: {
    fontSize: "2rem",
    color: "#333",
    marginBottom: "1rem",
  },
  paragraph: {
    fontSize: "1.25rem",
    color: "#666",
    marginBottom: "1.5rem",
  },
  button: {
    padding: "0.8rem 1.5rem",
    backgroundColor: "#ff4d4f",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    fontSize: "1rem",
    cursor: "pointer",
    marginTop: "1rem",
  },
};

export default Home;
