import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";


// Animated Background
export const AnimatedBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden">
    <div className="absolute -top-40 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-600/20 blur-3xl animate-pulse"></div>
    <div className="absolute -bottom-40 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-pink-400/20 to-orange-600/20 blur-3xl animate-pulse delay-1000"></div>
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-br from-green-400/10 to-blue-600/10 blur-2xl animate-bounce"></div>
  </div>
);

// Company Watermark
export const CompanyWatermark = () => (
  <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0 select-none">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 0.03, scale: 1 }}
      transition={{ duration: 2, ease: "easeOut" }}
      className="text-9xl font-black text-gray-900 transform -rotate-12"
    >
      SREE APPARELS
    </motion.div>
  </div>
);

// Animated Header
export const AnimatedHeader = ({ title, subtitle }) => (
  <motion.div
    initial={{ opacity: 0, y: -50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    className="text-center mb-12 relative z-10"
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
      className="inline-block"
    >
      <h1 className="text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
        {title}
      </h1>
      <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-6 rounded-full"></div>
    </motion.div>
    {subtitle && (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-xl text-gray-600 font-light"
      >
        {subtitle}
      </motion.p>
    )}
  </motion.div>
);

// Glass Card
export const GlassCard = ({ children, className = "", hover = true, ...props }) => (
  <motion.div
    whileHover={hover ? { scale: 1.02, y: -5 } : {}}
    whileTap={{ scale: 0.98 }}
    className={`bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl ${className}`}
    {...props}
  >
    {children}
  </motion.div>
);

// Footer
export const ModernFooter = () => (
  <motion.footer
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 1 }}
    className="relative z-10 mt-20 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 text-white"
  >
    <div className="absolute inset-0 bg-black/20"></div>
    <div className="relative px-8 py-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* About */}
        <div className="space-y-4">
          <h3 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            SREE APPARELS
          </h3>
          <p className="text-gray-300 leading-relaxed">
            Professional Employee Management System designed for modern apparel manufacturing.
          </p>
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-white mb-4">Contact Information</h4>
          <div className="space-y-3 text-gray-300">
            <p>📍 11A, Jawaharlal Nehru Street, Amman Mess opposite, Erode main road, Gobi</p>
            <p>📞 9344931717</p>
            <p>✉️ sreeapparels.gbi@gmail.com</p>
          </div>
        </div>

        {/* Quick Access */}
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-white mb-4">Quick Access</h4>
          <div className="flex flex-col gap-2">
            <Link to="/staff" className="text-gray-300 hover:text-white transition-all duration-300">
              Staff Management
            </Link>
            <Link to="/attendance" className="text-gray-300 hover:text-white transition-all duration-300">
              Attendance
            </Link>
              <Link to="/stitching" className="text-gray-300 hover:text-white transition-all duration-300">
              Stitching Management
            </Link>
              <Link to="/pieces" className="text-gray-300 hover:text-white transition-all duration-300">
              Piece Tracking
            </Link>
            <Link to="/salary" className="text-gray-300 hover:text-white transition-all duration-300">
              Salary Management
            </Link>
            <Link to="/analysis" className="text-gray-300 hover:text-white transition-all duration-300">
              Analytics
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-gray-700 mt-8 pt-8 text-center">
        <p className="text-gray-400">
          © 2024 Sree Apparels EMS. All rights reserved. | Designed for modern workforce management.
        </p>
      </div>
    </div>
  </motion.footer>
);

