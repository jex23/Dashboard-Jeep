import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { db } from "../firebaseConfig";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

interface PickupData {
  busNumber: number;
  check: string;
  destination: string;
  distance: number;
  fare: number;
  status: string;
  uid: string;
  passengerName: string;
  passengerType: string;
  passengerEmail: string;
}

interface PassengerData {
  fullName: string;
  passengerType: string;
  email: string;
}

const ForPickup: React.FC = () => {
  const [pickupData, setPickupData] = useState<PickupData[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5); // Default rows per page
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    const fetchPickupData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "For_Pick_Up"));
        const pickupDataPromises = querySnapshot.docs.map(async (pickupDoc) => {
          const data = pickupDoc.data();
          const { uid } = data;

          const passengerDocRef = doc(db, "Passengers", uid);
          const passengerDoc = await getDoc(passengerDocRef);
          const passengerData = (passengerDoc.exists() ? passengerDoc.data() : {}) as PassengerData;

          return {
            busNumber: data.busNumber,
            check: data.check,
            destination: data.destination,
            distance: data.distance,
            fare: data.fare,
            status: data.status,
            uid: data.uid,
            passengerName: passengerData.fullName || "N/A",
            passengerType: passengerData.passengerType || "N/A",
            passengerEmail: passengerData.email || "N/A",
          };
        });

        const fetchedData = await Promise.all(pickupDataPromises);
        setPickupData(fetchedData);
        setTotalPages(Math.ceil(fetchedData.length / rowsPerPage));
      } catch (error) {
        console.error("Error fetching pickup data:", error);
      }
    };

    fetchPickupData();
  }, [rowsPerPage]);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = pickupData.slice(indexOfFirstRow, indexOfLastRow);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to the first page when rows per page change
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <main style={styles.content}>
        <h1 style={styles.heading}>For Pickup Page</h1>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Passenger Name</th>
                <th style={styles.tableHeader}>Passenger Type</th>
                <th style={styles.tableHeader}>Email</th>
                <th style={styles.tableHeader}>Bus Number</th>
                <th style={styles.tableHeader}>Check</th>
                <th style={styles.tableHeader}>Destination</th>
                <th style={styles.tableHeader}>Distance (Km)</th>
                <th style={styles.tableHeader}>Fare ($)</th>
                <th style={styles.tableHeader}>Status</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((data, index) => (
                <tr key={index} style={styles.tableRow}>
                  <td style={styles.tableData}>{data.passengerName}</td>
                  <td style={styles.tableData}>{data.passengerType}</td>
                  <td style={styles.tableData}>{data.passengerEmail}</td>
                  <td style={styles.tableData}>{data.busNumber}</td>
                  <td style={styles.tableData}>{data.check}</td>
                  <td style={styles.tableData}>{data.destination}</td>
                  <td style={styles.tableData}>{data.distance}</td>
                  <td style={styles.tableData}>{data.fare.toFixed(2)}</td>
                  <td style={styles.tableData}>{data.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div style={styles.paginationContainer}>
          <button onClick={handlePreviousPage} style={styles.paginationButton} disabled={currentPage === 1}>
            Previous
          </button>
          <span style={styles.pageIndicator}>
            Page {currentPage} of {totalPages}
          </span>
          <button onClick={handleNextPage} style={styles.paginationButton} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>

        {/* Rows Per Page Selector */}
        <div style={styles.rowsPerPageContainer}>
          <label>Rows per page:</label>
          <select value={rowsPerPage} onChange={handleRowsPerPageChange} style={styles.rowLimitSelect}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
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
  tableContainer: {
    width: "100%",
    overflowX: "hidden",
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
    color: "#333",
    borderBottom: "1px solid #ddd",
    fontSize: "0.9rem",
  },
  paginationContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "1rem",
  },
  paginationButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#4c6ef5",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    margin: "0 0.5rem",
  },
  pageIndicator: {
    margin: "0 1rem",
    color: "#fff",
    fontSize: "1rem",
  },
  rowsPerPageContainer: {
    display: "flex",
    alignItems: "center",
    marginTop: "1rem",
  },
  rowLimitSelect: {
    marginLeft: "0.5rem",
    padding: "0.5rem",
    borderRadius: "4px",
    border: "1px solid #ddd",
  },
};

export default ForPickup;
