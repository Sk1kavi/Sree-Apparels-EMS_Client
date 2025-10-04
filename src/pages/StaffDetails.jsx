import { useEffect, useState } from "react";
import axios from "axios";
import { format, parseISO, getISOWeek } from "date-fns";
import { 
  User, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Edit3, 
  Save, 
  X, 
  ArrowLeft, 
  LogOut,
  Trash2,
  Upload,
  Settings,
  DollarSign,
  CheckCircle,
  XCircle,
  Scissors,
  BarChart3,
  Filter,
  Download,
  Eye,
  EyeOff,
  ImageIcon,
  IndianRupee
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";

const BASE_URL = "https://sree-apparels-ems.onrender.com/api";

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

export default function StaffDetails({ staffId, goBack }) {
  const [staff, setStaff] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [viewMode, setViewMode] = useState("Daily");
  const [isEditing, setIsEditing] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [salaryData, setSalaryData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [stitchingData, setStitchingData] = useState([]);
  const [totals, setTotals] = useState({ salary: 0, presentShifts: 0, absentShifts: 0, stitchedCount: 0 });

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    role: "Tailor",
    address: {
      state: "",
      district: "",
      city: "",
      pincode: ""
    },
    imageUrl: ""
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    fetchStaffDetails();
  }, [staffId]);

  useEffect(() => {
    if (staff) fetchAnalysis();
  }, [staff, year, month, viewMode]);

  const fetchStaffDetails = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/staff/${staffId}`);
      setStaff(res.data);
      setFormData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnalysis = async () => {
    try {
      const monthStr = month.toString().padStart(2, "0");

      // Salary
      const salaryRes = await axios.get(`${BASE_URL}/analysis/salary/${staffId}?year=${year}&month=${monthStr}`);
      setSalaryData(salaryRes.data);
      const salaryTotal = salaryRes.data.reduce((acc, curr) => acc + (curr.salary || 0), 0);

      // Attendance
      const attendanceRes = await axios.get(`${BASE_URL}/analysis/attendance/${staffId}?year=${year}&month=${monthStr}`);
      let processedAttendance = aggregateData(attendanceRes.data, viewMode, "date", ["presentShifts", "absentShifts"]);
      setAttendanceData(processedAttendance);

      // Stitching (tailors only)
      let processedStitching = [];
      if (staff.role === "Tailor") {
        const stitchingRes = await axios.get(`${BASE_URL}/analysis/stitching/${staffId}?year=${year}&month=${monthStr}`);
        processedStitching = aggregateData(stitchingRes.data, viewMode, "date", ["stitchedCount"]);
        setStitchingData(processedStitching);
      }

      // Totals
      const present = processedAttendance.reduce((acc, cur) => acc + (cur.presentShifts || 0), 0);
      const absent = processedAttendance.reduce((acc, cur) => acc + (cur.absentShifts || 0), 0);
      const stitched = processedStitching.reduce((acc, cur) => acc + (cur.stitchedCount || 0), 0);

      setTotals({ salary: salaryTotal, presentShifts: present, absentShifts: absent, stitchedCount: stitched });

    } catch (err) {
      console.error(err);
    }
  };

  const aggregateData = (data, mode, key, valueKeys) => {
    if (mode === "Daily") return data;

    const grouped = {};
    data.forEach(d => {
      let groupKey;
      const dateObj = parseISO(d[key]);
      if (mode === "Weekly") groupKey = `Week ${getISOWeek(dateObj)}`;
      else if (mode === "Monthly") groupKey = format(dateObj, "MMMM");

      if (!grouped[groupKey]) {
        grouped[groupKey] = {};
        valueKeys.forEach(k => grouped[groupKey][k] = 0);
      }
      valueKeys.forEach(k => grouped[groupKey][k] += d[k] || 0);
    });

    return Object.keys(grouped).sort().map(k => ({ ...grouped[k], [key]: k }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview("");
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return formData.imageUrl;
    const fd = new FormData();
    fd.append("image", imageFile);
    try {
      const res = await axios.post(`${BASE_URL}/staff/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.imageUrl;
    } catch (err) {
      console.error(err);
      return formData.imageUrl;
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    let imageUrl = await uploadImage();

    const payload = {
      name: formData.name,
      phone: formData.phone,
      role: formData.role,
      address: {
        state: formData.address.state,
        district: formData.address.district,
        city: formData.address.city,
        pincode: formData.address.pincode,
      },
      imageUrl,
    };

    try {
      await axios.put(`${BASE_URL}/staff/${staffId}`, payload);
      setIsEditing(false);
      setShowProfile(false);
      fetchStaffDetails();
    } catch (err) {
      console.error("Update Staff error:", err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      setIsLoading(true);
      try {
        await axios.delete(`${BASE_URL}/staff/${staffId}`);
        goBack();
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const attendancePieData = [
    { name: 'Present', value: totals.presentShifts, color: '#10b981' },
    { name: 'Absent', value: totals.absentShifts, color: '#ef4444' }
  ];

  // Profile Edit Modal
  const ProfileEditModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Edit3 className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold">Edit Profile</h3>
            </div>
            <button
              onClick={() => setShowProfile(false)}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Profile Image Upload */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-200 shadow-lg bg-gradient-to-br from-indigo-100 to-purple-100">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : staff?.imageUrl ? (
                  <img src={staff.imageUrl} alt={staff.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-indigo-400" />
                  </div>
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Upload className="w-6 h-6 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-slate-500 mt-2">Click to change profile picture</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <User className="w-4 h-4" />
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Briefcase className="w-4 h-4" />
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              >
                <option value="Tailor">Tailor</option>
                <option value="Helper">Helper</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <MapPin className="w-4 h-4" />
                State
              </label>
              <input
                type="text"
                value={formData.address?.state || ""}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  address: { ...formData.address, state: e.target.value }
                })}
                className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">District</label>
              <input
                type="text"
                value={formData.address?.district || ""}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  address: { ...formData.address, district: e.target.value }
                })}
                className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">City</label>
              <input
                type="text"
                value={formData.address?.city || ""}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  address: { ...formData.address, city: e.target.value }
                })}
                className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Pincode</label>
              <input
                type="text"
                value={formData.address?.pincode || ""}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  address: { ...formData.address, pincode: e.target.value }
                })}
                className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-slate-200">
            <button
              onClick={handleUpdate}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-4 px-8 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:transform-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
            <button
              onClick={() => setShowProfile(false)}
              className="flex-1 bg-slate-500 text-white py-4 px-8 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:bg-slate-600 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!staff) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading staff details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Company Watermark */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none opacity-5 select-none">
        <div className="text-8xl font-bold text-slate-600 transform rotate-45">
          SREE APPARELS
        </div>
      </div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors duration-200 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
              Back to Staff List
            </button>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-colors duration-200 shadow-lg"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Staff Profile Card */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-8 text-white">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl">
                    {staff.imageUrl ? (
                      <img src={staff.imageUrl} alt={staff.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-white/20 flex items-center justify-center text-4xl font-bold">
                        {staff.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                    <Briefcase className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-4xl font-bold mb-2">{staff.name}</h1>
                  <div className="flex flex-col md:flex-row md:items-center gap-4 text-lg opacity-90">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      {staff.role}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-5 h-5" />
                      {staff.phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      {staff.address?.city}, {staff.address?.state}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowProfile(true)}
                    className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
                  >
                    <Edit3 className="w-5 h-5" />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-500/80 hover:bg-red-600 px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <IndianRupee className="w-8 h-8 opacity-80" />
                  <span className="text-2xl font-bold">₹{totals.salary.toLocaleString()}</span>
                </div>
                <div className="text-green-100">Total Salary</div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <CheckCircle className="w-8 h-8 opacity-80" />
                  <span className="text-2xl font-bold">{totals.presentShifts}</span>
                </div>
                <div className="text-blue-100">Present Days</div>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-pink-600 text-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <XCircle className="w-8 h-8 opacity-80" />
                  <span className="text-2xl font-bold">{totals.absentShifts}</span>
                </div>
                <div className="text-red-100">Absent Days</div>
              </div>

              {staff.role === "Tailor" && (
                <div className="bg-gradient-to-br from-orange-500 to-yellow-600 text-white p-6 rounded-2xl shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <Scissors className="w-8 h-8 opacity-80" />
                    <span className="text-2xl font-bold">{totals.stitchedCount}</span>
                  </div>
                  <div className="text-orange-100">Pieces Stitched</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-2">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === "overview"
                    ? "bg-indigo-500 text-white shadow-lg"
                    : "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab("salary")}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === "salary"
                    ? "bg-indigo-500 text-white shadow-lg"
                    : "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                }`}
              >
                <IndianRupee className="w-5 h-5" />
                Salary
              </button>
              <button
                onClick={() => setActiveTab("attendance")}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === "attendance"
                    ? "bg-indigo-500 text-white shadow-lg"
                    : "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                }`}
              >
                <Calendar className="w-5 h-5" />
                Attendance
              </button>
              {staff.role === "Tailor" && (
                <button
                  onClick={() => setActiveTab("stitching")}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    activeTab === "stitching"
                      ? "bg-indigo-500 text-white shadow-lg"
                      : "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                  }`}
                >
                  <Scissors className="w-5 h-5" />
                  Stitching
                </button>
              )}
            </div>
          </div>
        </div>
{/* Content Based on Active Tab */}
<div className="max-w-7xl mx-auto">
  {/* Common Date Selection Controls */}
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          <span className="font-semibold text-gray-700">Time Period:</span>
        </div>
        <select 
          value={year} 
          onChange={e => setYear(Number(e.target.value))} 
          className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        
        <select 
          value={month} 
          onChange={e => setMonth(Number(e.target.value))} 
          className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
            <option key={m} value={m}>{new Date(2024, m-1).toLocaleString('default', { month: 'long' })}</option>
          ))}
        </select>
      </div>

      {/* View Mode Selector (for attendance tab) */}
      {/* {activeTab === "attendance" && (
        <select 
          value={viewMode} 
          onChange={e => setViewMode(e.target.value)} 
          className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="Daily">Daily View</option>
          <option value="Weekly">Weekly View</option>
          <option value="Monthly">Monthly View</option>
        </select>
      )} */}

      {/* Summary Cards */}
      <div className="flex items-center gap-4 text-sm font-medium">
        <span className="text-gray-600">Showing data for:</span>
        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
          {new Date(year, month-1).toLocaleString('default', { month: 'long' })} {year}
        </span>
      </div>
    </div>
  </div>

  {activeTab === "overview" && (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      {/* Salary Overview */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
        <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <IndianRupee className="w-6 h-6 text-green-500" />
          Salary Trend - {new Date(year, month-1).toLocaleString('default', { month: 'long' })} {year}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salaryData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip 
              formatter={(value) => [`₹${value.toLocaleString()}`, "Salary"]}
              contentStyle={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
            />
            <Line type="monotone" dataKey="salary" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Attendance Overview */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
        <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-500" />
          Attendance Summary - {new Date(year, month-1).toLocaleString('default', { month: 'long' })} {year}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={attendancePieData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={5}
              dataKey="value"
            >
              {attendancePieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )}

  {activeTab === "salary" && (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 animate-in fade-in-0 slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <IndianRupee className="w-8 h-8 text-green-500" />
          Salary Analysis - {year}
        </h2>
      </div>
      
      <div className="mb-6 p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl text-white">
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">₹{totals.salary.toLocaleString()}</div>
          <div className="text-green-100">Total Salary Earned in {year}</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={salaryData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip 
            formatter={(value) => [`₹${value.toLocaleString()}`, "Salary"]}
            contentStyle={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
          />
          <Legend />
          <Bar dataKey="salary" fill="url(#salaryGradient)" radius={[8, 8, 0, 0]} />
          <defs>
            <linearGradient id="salaryGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
              <stop offset="95%" stopColor="#059669" stopOpacity={0.7}/>
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )}

  {activeTab === "attendance" && (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 animate-in fade-in-0 slide-in-from-left-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Calendar className="w-8 h-8 text-blue-500" />
          Attendance Analysis - {new Date(year, month-1).toLocaleString('default', { month: 'long' })} {year}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{totals.presentShifts}</div>
              <div className="text-green-100">Present Days</div>
            </div>
            <CheckCircle className="w-12 h-12 opacity-80" />
          </div>
        </div>
        <div className="p-6 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{totals.absentShifts}</div>
              <div className="text-red-100">Absent Days</div>
            </div>
            <XCircle className="w-12 h-12 opacity-80" />
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={attendanceData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
          />
          <Legend />
          <Bar dataKey="presentShifts" fill="#10b981" name="Present Shifts" radius={[4, 4, 0, 0]} />
          <Bar dataKey="absentShifts" fill="#ef4444" name="Absent Shifts" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )}

  {activeTab === "stitching" && staff.role === "Tailor" && (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Scissors className="w-8 h-8 text-orange-500" />
          Stitching Performance - {new Date(year, month-1).toLocaleString('default', { month: 'long' })} {year}
        </h2>
      </div>

      <div className="mb-8 p-6 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-2xl text-white">
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">{totals.stitchedCount}</div>
          <div className="text-orange-100">Total Pieces Stitched</div>
          <div className="text-sm text-orange-200 mt-2">
            Average: {stitchingData.length > 0 ? Math.round(totals.stitchedCount / stitchingData.length) : 0} pieces per {viewMode.toLowerCase()}
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={stitchingData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip 
            formatter={(value) => [`${value} pieces`, "Stitched Count"]}
            contentStyle={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
          />
          <Legend />
          <Bar dataKey="stitchedCount" fill="url(#stitchingGradient)" name="Pieces Stitched" radius={[8, 8, 0, 0]} />
          <defs>
            <linearGradient id="stitchingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9}/>
              <stop offset="95%" stopColor="#d97706" stopOpacity={0.7}/>
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>

      {/* Performance Insights */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-2xl border border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h4 className="font-semibold text-blue-800">Best {viewMode}</h4>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {stitchingData.length > 0 ? Math.max(...stitchingData.map(d => d.stitchedCount)) : 0} pieces
          </div>
          <div className="text-sm text-blue-600">Peak performance</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-2xl border border-green-200">
          <div className="flex items-center gap-3 mb-3">
            <BarChart3 className="w-6 h-6 text-green-600" />
            <h4 className="font-semibold text-green-800">Consistency</h4>
          </div>
          <div className="text-2xl font-bold text-green-900">
            {stitchingData.length > 0 ? Math.round((totals.stitchedCount / stitchingData.length) / Math.max(...stitchingData.map(d => d.stitchedCount)) * 100) : 0}%
          </div>
          <div className="text-sm text-green-600">Performance stability</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-6 rounded-2xl border border-purple-200">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-6 h-6 text-purple-600" />
            <h4 className="font-semibold text-purple-800">Efficiency</h4>
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {stitchingData.length > 0 ? (totals.stitchedCount / totals.presentShifts).toFixed(1) : 0}
          </div>
          <div className="text-sm text-purple-600">Pieces per day</div>
        </div>
      </div>
    </div>
  )}
</div>
        
      </div>

      {/* Profile Edit Modal */}
      {showProfile && <ProfileEditModal />}
    </div>
  );
}