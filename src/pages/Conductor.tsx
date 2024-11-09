import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { auth, db } from "../firebaseConfig";
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

interface Conductor {
  id: string;
  name: string;
  busNumber: number;
  email: string;
  busType: string;
}

const ConductorPage: React.FC = () => {
  const [conductors, setConductors] = useState<Conductor[]>([]);
  const [nextBusNumber, setNextBusNumber] = useState<number>(1);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", busType: "Bulan" });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "Conductors"), (snapshot) => {
      const conductorsList: Conductor[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Conductor[];
      setConductors(conductorsList);
    });

    const getLastBusNumber = async () => {
      const q = query(collection(db, "Conductors"), orderBy("busNumber", "desc"), limit(1));
      onSnapshot(q, (snapshot) => {
        const lastBus = snapshot.docs[0]?.data();
        const highestBusNumber = lastBus ? lastBus.busNumber : 0;
        setNextBusNumber(highestBusNumber + 1);
      });
    };

    getLastBusNumber();
    return () => unsubscribe();
  }, []);

  const addConductor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await addDoc(collection(db, "Conductors"), {
        name: formData.name,
        busNumber: nextBusNumber,
        email: formData.email,
        busType: formData.busType,
        busLocation: "",
      });
      setNextBusNumber((prev) => prev + 1);
      setFormData({ name: "", email: "", password: "", busType: "Bulan" });
      setShowForm(false);
    } catch (error) {
      console.error("Error adding conductor: ", error);
    }
  };

  const deleteConductor = async (id: string) => {
    try {
      await deleteDoc(doc(db, "Conductors", id));
    } catch (error) {
      console.error("Error deleting conductor: ", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <main style={styles.content}>
        <h1 style={styles.heading}>Conductor Page</h1>
        <button style={styles.addButton} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Close Form" : "Add Conductor"}
        </button>

        {showForm && (
          <>
            <div style={styles.backdrop} onClick={() => setShowForm(false)}></div>
            <div style={styles.modalContainer}>
              <div style={styles.formContainer}>
                <h3 style={styles.formHeading}>Add New Conductor</h3>
                <form onSubmit={addConductor} style={styles.form}>
                  <div style={styles.formGroup}>
                    <label>Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      style={styles.input}
                    />
                  </div>
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
                    <label>Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label>Bus Type</label>
                    <select
                      name="busType"
                      value={formData.busType}
                      onChange={handleInputChange}
                      required
                      style={styles.input}
                    >
                      <option value="Bulan">Bulan</option>
                      <option value="Matnog">Matnog</option>
                    </select>
                  </div>
                  <button type="submit" style={styles.submitButton}>Add Conductor</button>
                </form>
              </div>
            </div>
          </>
        )}

        <h3 style={styles.listHeading}>Conductor List</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Name</th>
              <th style={styles.tableHeader}>Bus Number</th>
              <th style={styles.tableHeader}>Email</th>
              <th style={styles.tableHeader}>Bus Type</th>
              <th style={styles.tableHeader}>Action</th>
            </tr>
          </thead>
          <tbody>
            {conductors.map((conductor) => (
              <tr key={conductor.id} style={styles.tableRow}>
                <td style={styles.tableData}>{conductor.name}</td>
                <td style={styles.tableData}>{conductor.busNumber}</td>
                <td style={styles.tableData}>{conductor.email}</td>
                <td style={styles.tableData}>{conductor.busType}</td>
                <td style={styles.tableData}>
                  <button style={styles.deleteButton} onClick={() => deleteConductor(conductor.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    marginBottom: "2rem",
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
  table: {
    width: "100%",
    maxWidth: "800px",
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
    boxShadow: "0px 2px 5px rgba(255, 77, 79, 0.3)",
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

export default ConductorPage;
