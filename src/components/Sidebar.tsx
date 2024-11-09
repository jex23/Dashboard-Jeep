// components/Sidebar.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <aside style={styles.sidebar}>
      <h2 style={styles.sidebarHeading}>Dashboard</h2>
      <nav style={styles.nav}>
        <button style={styles.navItem} onClick={() => navigate("/home")}>
          <span style={styles.navIcon}>🏠</span>
          <span>Home</span>
        </button>
        <button style={styles.navItem} onClick={() => navigate("/conductor")}>
          <span style={styles.navIcon}>👷‍♂️</span>
          <span>Conductor</span>
        </button>
        <button style={styles.navItem} onClick={() => navigate("/fare")}>
          <span style={styles.navIcon}>💵</span>
          <span>Fare</span>
        </button>
        <button style={styles.navItem} onClick={() => navigate("/user")}>
          <span style={styles.navIcon}>👤</span>
          <span>User</span>
        </button>
        <button style={styles.navItem} onClick={() => navigate("/for-pickup")}>
          <span style={styles.navIcon}>🚐</span>
          <span>For Pickup</span>
        </button>
      </nav>
      <button style={styles.logoutButton} onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
};

// Sidebar styles
const styles: { [key: string]: React.CSSProperties } = {
  sidebar: {
    width: "250px",
    height: "100vh",
    backgroundColor: "#222",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "2rem 1rem",
    boxSizing: "border-box",
    boxShadow: "2px 0 10px rgba(0, 0, 0, 0.2)",
  },
  sidebarHeading: {
    fontSize: "1.5rem",
    marginBottom: "2rem",
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    marginBottom: "auto",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "90%",
    padding: "1rem",
    marginBottom: "1rem",
    backgroundColor: "#333",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "transform 0.2s, background-color 0.2s",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
    textAlign: "left",
  },
  navIcon: {
    marginRight: "0.75rem",
    fontSize: "1.25rem",
  },
  logoutButton: {
    padding: "0.8rem 1.5rem",
    backgroundColor: "#ff4d4f",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    cursor: "pointer",
    width: "90%",
    transition: "background-color 0.2s, transform 0.2s",
    marginTop: "1rem",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
  },
};

export default Sidebar;
