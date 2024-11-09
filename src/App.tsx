// App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Conductor from "./pages/Conductor";
import Fare from "./pages/Fare";
import User from "./pages/User";
import ForPickup from "./pages/ForPickup";
import ProtectedRoute from "./components/ProtectedRoute";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} /> {/* Redirect root path to /login */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes for authenticated pages */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/conductor" element={<Conductor />} />
          <Route path="/fare" element={<Fare />} />
          <Route path="/user" element={<User />} />
          <Route path="/for-pickup" element={<ForPickup />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
