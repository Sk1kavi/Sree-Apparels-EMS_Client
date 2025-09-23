import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminApp from "./AdminApp";
import StaffDetails from "./pages/StaffDetails";

export default function App() {
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [staffData, setStaffData] = useState(
    JSON.parse(localStorage.getItem("staff"))
  );

  const handleLogin = (role, data) => {
    localStorage.setItem("role", role);
    setRole(role);

    if (role === "staff") {
      localStorage.setItem("staff", JSON.stringify(data));
      setStaffData(data);
    } else {
      localStorage.setItem("admin", JSON.stringify(data));
    }
  };

  return (
    <Router>
      <Routes>
        {/* Login */}
        {!role && (
          <Route path="/*" element={<Login onLogin={handleLogin} />} />
        )}

        {/* Admin dashboard */}
        {role === "admin" && <Route path="/*" element={<AdminApp />} />}

        {/* StaffDetails */}
        {role === "staff" && staffData && (
          <Route
            path="/*"
            element={<StaffDetails staffId={staffData._id} />}
          />
        )}

        {/* Fallback */}
        <Route path="*" element={<Navigate to={role ? "/" : "/login"} />} />
      </Routes>
    </Router>
  );
}
