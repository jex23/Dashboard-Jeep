import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { db } from "../firebaseConfig";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  limit,
  startAfter,
  endBefore,
} from "firebase/firestore";

const FarePage: React.FC = () => {
  const [route, setRoute] = useState<string>("Bulan");
  const [selectedTab, setSelectedTab] = useState<string>("Bulan");
  const [km, setKm] = useState<number>(0);
  const [location, setLocation] = useState<string>("");
  const [farePerKm, setFarePerKm] = useState<number>(0);
  const [first4KmPrice, setFirst4KmPrice] = useState<number>(0);
  const [fareData, setFareData] = useState<
    { id: string; Km: number; Location: string }[]
  >([]);
  const [showAddDistance, setShowAddDistance] = useState<boolean>(false);
  const [showFareDetails, setShowFareDetails] = useState<boolean>(false);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [firstVisible, setFirstVisible] = useState<any>(null);

  const checkInitialKm = async (route: string) => {
    try {
      const routeDocRef = doc(collection(db, "fare_matrix"), route);
      const distancesCollection = collection(routeDocRef, "distances");
      const kmQuery = query(
        distancesCollection,
        orderBy("Km", "desc"),
        limit(1)
      );
      const querySnapshot = await getDocs(kmQuery);

      setKm(querySnapshot.empty ? 0 : querySnapshot.docs[0].data().Km + 1);
    } catch (error) {
      console.error("Error checking initial kilometer:", error);
      setKm(0);
    }
  };

  const fetchFarePerKm = async () => {
    try {
      const fareMatrixDocRef = doc(db, "fare_matrix", "fare_per_km");
      const unsubscribe = onSnapshot(fareMatrixDocRef, (fareDoc) => {
        if (fareDoc.exists()) {
          setFarePerKm(fareDoc.data().farePerKm);
          setFirst4KmPrice(fareDoc.data().first_4km_price || 0);
        }
      });
      return () => unsubscribe();
    } catch (error) {
      console.error("Error fetching fare per km:", error);
    }
  };

  const fetchFareData = async (direction?: "next" | "previous") => {
    const routeDocRef = doc(db, "fare_matrix", selectedTab);
    const distancesCollection = collection(routeDocRef, "distances");

    let q;
    if (direction === "next" && lastVisible) {
      q = query(
        distancesCollection,
        orderBy("Km", "asc"),
        startAfter(lastVisible),
        limit(rowsPerPage)
      );
    } else if (direction === "previous" && firstVisible) {
      q = query(
        distancesCollection,
        orderBy("Km", "asc"),
        endBefore(firstVisible),
        limit(rowsPerPage)
      );
    } else {
      q = query(distancesCollection, orderBy("Km", "asc"), limit(rowsPerPage));
    }

    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as { id: string; Km: number; Location: string }[];
    setFareData(data);
    setFirstVisible(querySnapshot.docs[0]);
    setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);

    if (direction === "next") setCurrentPage((prev) => prev + 1);
    else if (direction === "previous") setCurrentPage((prev) => prev - 1);
  };

  useEffect(() => {
    fetchFarePerKm();
    checkInitialKm(route);
  }, [selectedTab, rowsPerPage]);

  useEffect(() => {
    const routeDocRef = doc(db, "fare_matrix", selectedTab);
    const distancesCollection = collection(routeDocRef, "distances");

    const unsubscribe = onSnapshot(distancesCollection, (querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as { id: string; Km: number; Location: string }[];
      setFareData(data);
    });

    return () => unsubscribe();
  }, [selectedTab, rowsPerPage]);

  const handleRouteChange = (newRoute: string) => {
    setRoute(newRoute);
    setLocation("");
    if (newRoute) checkInitialKm(newRoute);
  };

  const addToFareMatrix = async () => {
    if (!route || !location) {
      alert("Please select a route and enter a location.");
      return;
    }

    try {
      const routeDocRef = doc(collection(db, "fare_matrix"), route);
      const kmSubDocRef = doc(collection(routeDocRef, "distances"), `km_${km}`);
      await setDoc(kmSubDocRef, { Km: km, Location: location });
      alert("Location added successfully!");
      setKm(km + 1);
      setLocation("");
    } catch (error) {
      console.error("Error adding location to Firestore:", error);
      alert("Failed to add location. Please try again.");
    }
  };

  const deleteFare = async (id: string) => {
    try {
      const routeDocRef = doc(db, "fare_matrix", selectedTab);
      const kmSubDocRef = doc(collection(routeDocRef, "distances"), id);
      await deleteDoc(kmSubDocRef);
      alert("Location deleted successfully!");
      fetchFareData();
    } catch (error) {
      console.error("Error deleting location:", error);
      alert("Failed to delete location. Please try again.");
    }
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
    fetchFareData();
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <main style={styles.content}>
        <h1 style={styles.heading}>Fare Matrix</h1>

        <div style={styles.toggleContainer}>
          <button
            style={styles.toggleButton}
            onClick={() => setShowAddDistance(true)}
          >
            Show Add Distance
          </button>
          <button
            style={styles.toggleButton}
            onClick={() => setShowFareDetails(true)}
          >
            Show Fare Details
          </button>
        </div>

        {showAddDistance && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <h3>Add Distance</h3>
              <label>Select Route:</label>
              <select
                value={route}
                onChange={(e) => handleRouteChange(e.target.value)}
                style={styles.select}
              >
                <option value="Bulan">Bulan</option>
                <option value="Matnog">Matnog</option>
              </select>
              <div>
                <label>Km: {km}</label>
              </div>
              <input
                type="text"
                placeholder="Enter location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={styles.input}
              />
              <button onClick={addToFareMatrix} style={styles.addButton}>
                Add Location
              </button>
              <button
                onClick={() => setShowAddDistance(false)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {showFareDetails && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <h3>Fare Details</h3>
              <label>Fare per Km:</label>
              <input
                type="number"
                value={farePerKm}
                onChange={(e) => setFarePerKm(Number(e.target.value))}
                style={styles.input}
              />
              <label>First 4 Km Price:</label>
              <input
                type="number"
                value={first4KmPrice}
                onChange={(e) => setFirst4KmPrice(Number(e.target.value))}
                style={styles.input}
              />
              <button onClick={() => {}} style={styles.updateButton}>
                Update Fare
              </button>
              <button
                onClick={() => setShowFareDetails(false)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <h4 style={styles.listHeading}>Fare Data for {selectedTab}</h4>
        <div style={styles.tabContainer}>
          <button
            style={
              selectedTab === "Bulan" ? styles.activeTab : styles.inactiveTab
            }
            onClick={() => setSelectedTab("Bulan")}
          >
            Bulan
          </button>
          <button
            style={
              selectedTab === "Matnog" ? styles.activeTab : styles.inactiveTab
            }
            onClick={() => setSelectedTab("Matnog")}
          >
            Matnog
          </button>
        </div>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Location</th>
                <th style={styles.tableHeader}>Km</th>
                <th style={styles.tableHeader}>Action</th>
              </tr>
            </thead>
            <tbody>
              {fareData.map((data) => (
                <tr key={data.id} style={styles.tableRow}>
                  <td>{data.Location}</td>
                  <td>{data.Km}</td>
                  <td>
                    <button
                      onClick={() => deleteFare(data.id)}
                      style={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={styles.paginationContainer}>
          <button
            onClick={() => fetchFareData("previous")}
            style={styles.paginationButton}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span style={styles.pageIndicator}>Page {currentPage}</span>
          <button
            onClick={() => fetchFareData("next")}
            style={styles.paginationButton}
          >
            Next
          </button>
        </div>

        <div style={styles.rowsPerPageContainer}>
          <label>Rows per page:</label>
          <select
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            style={styles.rowLimitSelect}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
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
  tabContainer: {
    display: "flex",
    marginBottom: "1rem",
  },
  activeTab: {
    padding: "0.8rem 1.5rem",
    backgroundColor: "#4c6ef5",
    color: "#fff",
    border: "none",
    borderRadius: "8px 8px 0 0",
    cursor: "pointer",
    fontWeight: "bold",
  },
  inactiveTab: {
    padding: "0.8rem 1.5rem",
    backgroundColor: "#aaa",
    color: "#fff",
    border: "none",
    borderRadius: "8px 8px 0 0",
    cursor: "pointer",
  },
  toggleContainer: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1rem",
  },
  toggleButton: {
    padding: "0.8rem 1.5rem",
    backgroundColor: "#4c6ef5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    background: "rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(12px)",
    borderRadius: "12px",
    padding: "2rem",
    textAlign: "center",
    color: "#fff",
    maxWidth: "500px",
    boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.3)",
  },
  input: {
    padding: "0.75rem",
    borderRadius: "8px",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    background: "rgba(255, 255, 255, 0.15)",
    color: "#fff",
  },
  addButton: {
    padding: "0.8rem",
    backgroundColor: "#4c6ef5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  cancelButton: {
    padding: "0.8rem",
    backgroundColor: "#ff4d4f",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginLeft: "1rem",
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
    backgroundColor: "#fff",
  },
  tableHeader: {
    padding: "1rem",
    backgroundColor: "#000",
    color: "#fff",
    textAlign: "left",
    fontSize: "1rem",
  },
  tableRow: {
    transition: "background-color 0.2s",
  },
  deleteButton: {
    padding: "0.4rem 1rem",
    backgroundColor: "#ff4d4f",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  paginationContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: "1rem",
  },
  paginationButton: {
    padding: "0.8rem 1.5rem",
    backgroundColor: "#4c6ef5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  pageIndicator: {
    margin: "0 1rem",
    color: "#fff",
    fontSize: "1rem",
  },
  rowLimitSelect: {
    padding: "0.8rem",
    backgroundColor: "#fff",
    color: "#333",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginRight: "1rem",
  },
  rowsPerPageContainer: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: "1rem",
  },
};

export default FarePage;
