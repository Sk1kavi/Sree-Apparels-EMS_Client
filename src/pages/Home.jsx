// Home.jsx
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-indigo-200 p-6">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
        Sree Apparels EMS
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Employee & Production Management System
      </p>

      {/* Stats Section */}
      <div className="grid grid-cols-2 gap-6 mb-10">
        <div className="bg-white shadow-xl rounded-2xl p-6 text-center">
          <p className="text-2xl font-bold text-indigo-600">42</p>
          <p className="text-gray-500">Total Staff</p>
        </div>
        <div className="bg-white shadow-xl rounded-2xl p-6 text-center">
          <p className="text-2xl font-bold text-green-600">38</p>
          <p className="text-gray-500">Present Today</p>
        </div>
        <div className="bg-white shadow-xl rounded-2xl p-6 text-center">
          <p className="text-2xl font-bold text-orange-600">3</p>
          <p className="text-gray-500">Active orders</p>
        </div>
        <div className="bg-white shadow-xl rounded-2xl p-6 text-center">
          <p className="text-2xl font-bold text-blue-600">1250</p>
          <p className="text-gray-500">Pieces Stitched</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap gap-4">
        <Link
          to="/staff"
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl shadow hover:bg-indigo-700 transition"
        >
          Manage Staff
        </Link>
        <Link
          to="/attendance"
          className="px-6 py-3 bg-green-600 text-white rounded-xl shadow hover:bg-green-700 transition"
        >
          Attendance
        </Link>
        <Link
          to="/stitching"
          className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
        >
          Stitching
        </Link>
        <Link
          to="/pieces"
          className="px-6 py-3 bg-orange-600 text-white rounded-xl shadow hover:bg-orange-700 transition"
        >
          Pieces Tracking
        </Link>
        <Link
          to="/salary"
          className="px-6 py-3 bg-purple-600 text-white rounded-xl shadow hover:bg-purple-700 transition"
        >
          Salary
        </Link>
      </div>
    </div>
  );
}
