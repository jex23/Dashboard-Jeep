    // pages/Home.tsx
    import React from "react";
    import Sidebar from "../components/Sidebar";

    const Home: React.FC = () => {
    return (
        <div style={styles.container}>
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main style={styles.content}>
            <h1 style={styles.heading}>Welcome to the Home Page</h1>
            <p style={styles.paragraph}>You are successfully logged in!</p>
        </main>
        </div>
    );
    };

    // Styles for Home page layout
    const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: "flex",
        width: "100vw",
        height: "100vh",
        backgroundColor: "#f4f4f4",
    },
    content: {
        flex: 1, // Takes up the remaining width after the sidebar
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

    export default Home;
