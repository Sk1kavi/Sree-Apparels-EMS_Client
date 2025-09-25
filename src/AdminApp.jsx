import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import {
  AnimatedBackground,
  CompanyWatermark,
  ModernFooter
} from "./ModernUIComponents";

import StaffManagement from "./pages/StaffManagement";
import AttendanceManagement from "./pages/AttendanceManagement";
import PieceTracking from "./pages/PieceTracking";
import StitchingManagement from "./pages/StitchingManagement";
import SalaryManagement from "./pages/SalaryManagement";
import Home from "./pages/Home";
import Analysis from "./pages/Analysis";

import { Users, Calendar, Scissors, Package, IndianRupee, BarChart3, Menu, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Sidebar Component
const ModernSidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { icon: Users, label: "Staff Management", path: "/staff", color: "from-blue-500 to-cyan-500" },
    { icon: Calendar, label: "Attendance", path: "/attendance", color: "from-green-500 to-emerald-500" },
    { icon: Scissors, label: "Stitching", path: "/stitching", color: "from-purple-500 to-pink-500" },
    { icon: Package, label: "Piece Tracking", path: "/pieces", color: "from-orange-500 to-red-500" },
    { icon: IndianRupee, label: "Salary Management", path: "/salary", color: "from-yellow-500 to-orange-500" },
    { icon: BarChart3, label: "Analytics", path: "/analysis", color: "from-indigo-500 to-purple-500" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed left-0 top-0 h-full w-80 bg-white/95 backdrop-blur-xl border-r border-white/20 shadow-2xl z-50"
        >
          <div className="p-8 border-b border-gray-200/50 flex items-center justify-between">
            <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">SREE APPARELS</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={24} />
            </button>
          </div>
          <nav className="p-6 flex flex-col gap-2">
            {navItems.map((item, index) => (
              <motion.a
                key={item.path}
                href={item.path}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 10 }}
                className="flex items-center gap-4 p-4 mb-2 rounded-2xl hover:bg-gray-50 transition-all duration-300 group"
              >
                <div className={`p-3 rounded-xl bg-gradient-to-r ${item.color} text-white group-hover:scale-110 transition-transform`}>
                  <item.icon size={20} />
                </div>
                <span className="font-semibold text-gray-800 group-hover:text-gray-900">{item.label}</span>
                <ChevronRight className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
              </motion.a>
            ))}
          </nav>

          <div className="absolute bottom-8 left-6 right-6">
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/login";
              }}
              className="w-full py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-all"
            >
              Logout
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
const AttractiveHeader = () => {
  return (
    <div className="flex-1 mx-4">
      <motion.div 
        className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl px-6 py-3 text-white"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <h1 className="text-xl font-black text-center drop-shadow-lg">SREE APPARELS</h1>
        <div className="flex items-center justify-center space-x-4 text-xs opacity-90 mt-1">
          <span>✓ Quality Guaranteed</span>
          <span>•</span>
          <span>✓ Excellence in every stitch</span>
        </div>
      </motion.div>
    </div>
  );
};

// AdminApp Component
export default function AdminApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen relative bg-gray-50 flex flex-col">
      <AnimatedBackground />
      <CompanyWatermark />

      {/* Header */}
      <motion.header className="w-full z-10 p-4 backdrop-blur-sm border-b border-white/20 flex items-center">
        <button onClick={() => setSidebarOpen(true)} className="p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow hover:shadow-xl">
          <Menu size={24} />
        </button>

        {/* Scrolling Company Name */}
        <AttractiveHeader />

        {/* Welcome text */}
        <div className="text-right">
          <p className="text-sm text-gray-600">Welcome back,</p>
          <p className="font-bold text-gray-800">Administrator</p>
        </div>
      </motion.header>

      <div className="flex flex-1">
        <ModernSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/staff" element={<StaffManagement />} />
            <Route path="/attendance" element={<AttendanceManagement />} />
            <Route path="/stitching" element={<StitchingManagement />} />
            <Route path="/pieces" element={<PieceTracking />} />
            <Route path="/salary" element={<SalaryManagement />} />
            <Route path="/analysis" element={<Analysis />} />
          </Routes>
        </main>
      </div>

      <ModernFooter />
    </div>
  );
}
