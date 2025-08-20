import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import StaffManagement from "./pages/StaffManagement";
import AttendanceManagement from "./pages/AttendanceManagement";

function App() {
  return (
    <Router>
  {/* Use min-h-screen for the whole page */}
  <div className="flex min-h-screen">
    {/* Sidebar */}
    <div className="w-64 bg-gray-800 text-white p-4">
      <h2 className="text-xl font-bold mb-6">Sree Apparels EMS</h2>
      <nav className="flex flex-col space-y-3">
        <Link to="/staff" className="hover:bg-gray-700 p-2 rounded">👥 Staff</Link>
        <Link to="/attendance" className="hover:bg-gray-700 p-2 rounded">🗓️ Attendance</Link>
        <Link to="/stitching" className="hover:bg-gray-700 p-2 rounded">🧵 Stitching</Link>
        <Link to="/pieces" className="hover:bg-gray-700 p-2 rounded">📦 Piece Tracking</Link>
        <Link to="/salary" className="hover:bg-gray-700 p-2 rounded">💰 Salary</Link>
        <Link to="/analysis" className="hover:bg-gray-700 p-2 rounded">📊 Analysis</Link>
      </nav>
    </div>

    {/* Main Content */}
    <div className="flex-1 p-6 bg-gray-100">
      <div className="min-h-screen">
        <Routes>
          <Route path="/staff" element={<StaffManagement />} />
          <Route path="/attendance" element={<AttendanceManagement />} />
          <Route path="/stitching" element={<h1>Stitching Dashboard</h1>} />
          <Route path="/pieces" element={<h1>Piece Tracking Dashboard</h1>} />
          <Route path="/salary" element={<h1>Salary Dashboard</h1>} />
          <Route path="/analysis" element={<h1>Analysis Dashboard</h1>} />
          <Route path="/" element={<h1>Welcome to Sree Apparels EMS</h1>} />
        </Routes>
      </div>
    </div>
  </div>
</Router>

  );
}

export default App;
