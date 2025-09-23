import { Routes, Route, Link, useNavigate } from "react-router-dom";
import StaffManagement from "./pages/StaffManagement";
import AttendanceManagement from "./pages/AttendanceManagement";
import PieceTracking from "./pages/PieceTracking";
import StitchingManagement from "./pages/StitchingManagement";
import SalaryManagement from "./pages/SalaryManagement";
import Home from "./pages/Home";

export default function AdminApp() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-4 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-6">Sree Apparels EMS</h2>
          <nav className="flex flex-col space-y-3">
            <Link to="/staff" className="hover:bg-gray-700 p-2 rounded">👥 Staff</Link>
            <Link to="/attendance" className="hover:bg-gray-700 p-2 rounded">🗓️ Attendance</Link>
            <Link to="/stitching" className="hover:bg-gray-700 p-2 rounded">🧵 Stitching</Link>
            <Link to="/pieces" className="hover:bg-gray-700 p-2 rounded">📦 Piece Tracking</Link>
            <Link to="/salary" className="hover:bg-gray-700 p-2 rounded">💰 Salary</Link>
          </nav>
        </div>

        {/* Logout Button */}
       <button
  onClick={() => {
    localStorage.removeItem("role");
    localStorage.removeItem("admin");
    window.location.href = "/login"; // forces navigation to login component
  }}
  className="mt-8 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold shadow"
>
  Logout
</button>

      </div>

      {/* Main content */}
      <div className="flex-1 p-6 bg-gray-100">
        <Routes>
          <Route path="/staff" element={<StaffManagement />} />
          <Route path="/attendance" element={<AttendanceManagement />} />
          <Route path="/stitching" element={<StitchingManagement />} />
          <Route path="/pieces" element={<PieceTracking />} />
          <Route path="/salary" element={<SalaryManagement />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </div>
  );
}
