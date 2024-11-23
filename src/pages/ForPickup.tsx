import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { db } from "../firebaseConfig";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { collection, getDocs, doc, getDoc, deleteDoc } from "firebase/firestore";

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
  docId: string;
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
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPickupData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "For_Pick_Up"));
        const pickupDataPromises = querySnapshot.docs.map(async (pickupDoc) => {
          const data = pickupDoc.data();
          const { uid } = data;

          // Fetching passenger data
          const passengerDocRef = doc(db, "Passengers", uid);
          const passengerDoc = await getDoc(passengerDocRef);
          const passengerData = passengerDoc.exists() ? passengerDoc.data() as PassengerData : { fullName: "N/A", passengerType: "N/A", email: "N/A" };

          return {
            docId: pickupDoc.id, // Include the document ID here (still necessary for deletion)
            busNumber: data.busNumber,
            check: data.check,
            destination: data.destination,
            distance: data.distance,
            fare: data.fare,
            status: data.status,
            uid: data.uid,
            passengerName: passengerData.fullName,
            passengerType: passengerData.passengerType,
            passengerEmail: passengerData.email,
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

  const deletePickup = async (docId: string) => {
    try {
      console.log("Attempting to delete document with Doc ID:", docId);
      await deleteDoc(doc(db, "For_Pick_Up", docId));
      console.log("Deleted from 'For_Pick_Up':", docId);
      setPickupData((prevData) => prevData.filter((data) => data.docId !== docId));
      toast.success("Record successfully deleted!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete the record.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

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
                {/* Removed Doc ID header */}
                <th style={styles.tableHeader}>Passenger Name</th>
                <th style={styles.tableHeader}>Passenger Type</th>
                <th style={styles.tableHeader}>Email</th>
                <th style={styles.tableHeader}>Bus Number</th>
                <th style={styles.tableHeader}>Check</th>
                <th style={styles.tableHeader}>Destination</th>
                <th style={styles.tableHeader}>Distance (Km)</th>
                <th style={styles.tableHeader}>Fare ($)</th>
                <th style={styles.tableHeader}>Status</th>
                <th style={styles.tableHeader}>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((data) => (
                <tr key={data.docId} style={styles.tableRow}>
                  {/* Removed Doc ID column */}
                  <td style={styles.tableData}>{data.passengerName}</td>
                  <td style={styles.tableData}>{data.passengerType}</td>
                  <td style={styles.tableData}>{data.passengerEmail}</td>
                  <td style={styles.tableData}>{data.busNumber}</td>
                  <td style={styles.tableData}>{data.check}</td>
                  <td style={styles.tableData}>{data.destination}</td>
                  <td style={styles.tableData}>{data.distance}</td>
                  <td style={styles.tableData}>{data.fare.toFixed(2)}</td>
                  <td style={styles.tableData}>{data.status}</td>
                  <td style={styles.tableData}>
                    <button
                      style={styles.deleteButton}
                      onClick={() => setDeleteDocId(data.docId)}
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

        <div style={styles.rowsPerPageContainer}>
          <label>Rows per page:</label>
          <select value={rowsPerPage} onChange={handleRowsPerPageChange} style={styles.rowLimitSelect}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
          </select>
        </div>
      </main>

      {deleteDocId && (
        <div style={styles.confirmationDialog}>
          <p>Are you sure you want to delete this record?</p>
          <button
            style={styles.confirmButton}
            onClick={() => {
              deletePickup(deleteDocId);
              setDeleteDocId(null); // Clear the docId after deletion
            }}
          >
            Confirm
          </button>
          <button
            style={styles.cancelButton}
            onClick={() => setDeleteDocId(null)}
          >
            Cancel
          </button>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  deleteButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#e63946",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
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
  },
  tableRow: {
    borderBottom: "1px solid #ddd",
  },
  tableData: {
    padding: "0.8rem",
    textAlign: "left",
  },
  paginationContainer: {
    display: "flex",
    alignItems: "center",
    marginTop: "1rem",
  },
  paginationButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    margin: "0 1rem",
  },
  pageIndicator: {
    fontSize: "1rem",
  },
  rowsPerPageContainer: {
    marginTop: "1rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  rowLimitSelect: {
    padding: "0.5rem",
    borderRadius: "5px",
    border: "1px solid #ccc",
    marginTop: "0.5rem",
  },
  confirmationDialog: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#fff",
    padding: "2rem",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    borderRadius: "8px",
    zIndex: 1000,
  },
  confirmButton: {
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    padding: "0.5rem 1rem",
    margin: "0 1rem",
    borderRadius: "5px",
    cursor: "pointer",
  },
  cancelButton: {
    backgroundColor: "#e63946",
    color: "#fff",
    border: "none",
    padding: "0.5rem 1rem",
    margin: "0 1rem",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default ForPickup;
