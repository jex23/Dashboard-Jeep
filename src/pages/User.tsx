import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { db } from "../firebaseConfig";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";

interface Passenger {
  id: string;
  email: string;
  fullName: string;
  passengerType: string;
}

const User: React.FC = () => {
  const [passengers, setPassengers] = useState<Passenger[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "Passengers"), (snapshot) => {
      const passengersList: Passenger[] = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Passenger)
      );
      setPassengers(passengersList);
    });

    return () => unsubscribe();
  }, []);

  const deletePassenger = async (id: string) => {
    try {
      await deleteDoc(doc(db, "Passengers", id));
    } catch (error) {
      console.error("Error deleting passenger: ", error);
    }
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <main style={styles.content}>
        <h1 style={styles.heading}>User Management</h1>

        
        

       
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Email</th>
                <th style={styles.tableHeader}>Full Name</th>
                <th style={styles.tableHeader}>Passenger Type</th>
                <th style={styles.tableHeader}>Action</th>
              </tr>
            </thead>
            <tbody>
              {passengers.map((passenger) => (
                <tr key={passenger.id} style={styles.tableRow}>
                  <td style={styles.tableData}>{passenger.email}</td>
                  <td style={styles.tableData}>{passenger.fullName}</td>
                  <td style={styles.tableData}>{passenger.passengerType}</td>
                  <td style={styles.tableData}>
                    <button
                      style={styles.deleteButton}
                      onClick={() => deletePassenger(passenger.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
    alignItems: "center",
    background: "linear-gradient(135deg, #4c6ef5, #b23fef)",
    color: "#333",
  },
  heading: {
    fontSize: "2rem",
    color: "#fff",
    marginBottom: "1rem",
  },
  listHeading: {
    fontSize: "1.5rem",
    marginTop: "1.5rem",
    color: "#fff",
  },
  tableContainer: {
    width: "100%",
    maxWidth: "800px",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "1rem",
    borderRadius: "12px",
    overflow: "hidden",
  },
  tableHeader: {
    padding: "1rem",
    backgroundColor: "#333",
    color: "#fff",
    textAlign: "left",
    fontSize: "1rem",
  },
  tableRow: {
    transition: "background-color 0.2s",
  },
  tableData: {
    padding: "1rem",
    backgroundColor: "#fff",
    color: "#333",
    borderBottom: "1px solid #ddd",
    fontSize: "0.9rem",
  },
  deleteButton: {
    padding: "0.4rem 1rem",
    backgroundColor: "#ff4d4f",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  errorMessage: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    padding: "1rem",
    borderRadius: "4px",
    marginBottom: "1rem",
    width: "100%",
    maxWidth: "600px",
    textAlign: "center",
  },
};

export default User;
