import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";

interface Passenger {
  id: string;
  email: string;
  fullName: string;
  passengerType: string;
}

const User: React.FC = () => {
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState({ email: "", fullName: "", passengerType: "Regular" });
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<Passenger | null>(null); // Track which user is being edited

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

  const addPassenger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.fullName || !formData.passengerType) {
      setError("All fields are required.");
      return;
    }

    try {
      setError(null);
      if (editingUser) {
        // Update existing user if editing
        const userRef = doc(db, "Passengers", editingUser.id);
        await updateDoc(userRef, formData);
      } else {
        // Add new user
        await addDoc(collection(db, "Passengers"), formData);
      }
      setFormData({ email: "", fullName: "", passengerType: "Regular" });
      setEditingUser(null); // Reset after adding or editing
      setShowForm(false);
    } catch (error: any) {
      console.error("Error adding or updating passenger: ", error);
      setError("An error occurred. Please try again.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const editPassenger = (passenger: Passenger) => {
    setEditingUser(passenger);
    setFormData({ email: passenger.email, fullName: passenger.fullName, passengerType: passenger.passengerType });
    setShowForm(true);
  };

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

        {/* Floating Add User Button */}
        <button
          style={styles.addButton}
          onClick={() => setShowForm(true)}
        >
          Add User
        </button>

        {/* Error message */}
        {error && (
          <div style={styles.errorMessage}>
            {error}
          </div>
        )}

        {/* Modal for Add/Edit User */}
        {showForm && (
          <>
            <div style={styles.backdrop} onClick={() => setShowForm(false)}></div>
            <div style={styles.modalContainer}>
              <div style={styles.formContainer}>
                <h3 style={styles.formHeading}>{editingUser ? "Edit User" : "Add New User"}</h3>
                <form onSubmit={addPassenger} style={styles.form}>
                  <div style={styles.formGroup}>
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label>Passenger Type</label>
                    <select
                      name="passengerType"
                      value={formData.passengerType}
                      onChange={handleInputChange}
                      required
                      style={styles.input}
                    >
                      <option value="Regular">Regular</option>
                      <option value="Student">Student</option>
                      <option value="PWD">PWD</option>
                      <option value="Senior">Senior</option>
                    </select>
                  </div>
                  <button type="submit" style={styles.submitButton}>{editingUser ? "Update User" : "Add User"}</button>
                </form>
              </div>
            </div>
          </>
        )}

        {/* List of Users */}
        <h3 style={styles.listHeading}>User List</h3>
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
                      style={styles.editButton}
                      onClick={() => editPassenger(passenger)}
                    >
                      Edit
                    </button>
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
  addButton: {
    padding: "0.8rem 1.5rem",
    backgroundColor: "#4c6ef5",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "1rem",
    boxShadow: "0px 4px 10px rgba(76, 110, 245, 0.4)",
    transition: "transform 0.2s, box-shadow 0.2s",
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: 1000,
  },
  formContainer: {
    background: "rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(12px)",
    borderRadius: "12px",
    padding: "2rem",
    width: "100%",
    maxWidth: "500px",
    marginBottom: "2rem",
    boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.3)",
    textAlign: "center",
    color: "#fff",
  },
  formHeading: {
    fontSize: "1.5rem",
    marginBottom: "1rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: "0.75rem",
    borderRadius: "8px",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    background: "rgba(255, 255, 255, 0.15)",
    color: "#fff",
  },
  select: {
    padding: "0.75rem",
    borderRadius: "8px",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    background: "rgba(255, 255, 255, 0.15)", // Transparent glass effect
    color: "#fff", // White text
    fontSize: "1rem",
    appearance: "none", // Remove default dropdown arrow
    backdropFilter: "blur(8px)", // Apply glass blur effect
  },
  submitButton: {
    padding: "0.8rem",
    backgroundColor: "#4c6ef5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    marginTop: "1rem",
    boxShadow: "0px 4px 10px rgba(76, 110, 245, 0.4)",
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
  editButton: {
    padding: "0.4rem 1rem",
    backgroundColor: "#4c6ef5",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
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
  backdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 999,
  },
  modalContainer: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 1000,
  },
};

export default User;
