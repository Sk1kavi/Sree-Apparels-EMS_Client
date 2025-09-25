import { useEffect, useState } from "react";
import axios from "axios";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  Save,
  UserCheck,
  BarChart3,
  Activity,
} from "lucide-react";

export default function AttendanceManagement() {
  const [date, setDate] = useState("");
  const [shift, setShift] = useState("");
  const [staff, setStaff] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [isStaff, setIsStaff] = useState(false);

  // Load attendance/staff whenever called
  const loadAttendance = async () => {
    if (!date || !shift) {
      alert("Please select both date and shift.");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(
        "https://sree-apparels-ems.onrender.com/api/attendance",
        {
          params: { date, shift },
        }
      );
      if (res.data.type === "attendance") {
        const mapped = {};
        res.data.data.forEach((rec) => {
          mapped[rec.staffId._id] = rec.status;
        });
        setAttendance(mapped);
        setStaff(res.data.data.map((r) => r.staffId));
        setIsStaff(false);
      } else if (res.data.type === "staff") {
        setIsStaff(true);
        const mapped = {};
        res.data.data.forEach((s) => {
          mapped[s._id] = "Present";
        });
        setAttendance(mapped);
        setStaff(res.data.data);
      }
    } catch (err) {
      alert("❌ Failed to load attendance.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle attendance
  const toggleAttendance = (id) => {
    setAttendance((prev) => ({
      ...prev,
      [id]: prev[id] === "Present" ? "Absent" : "Present",
    }));
  };

  // Submit all attendance
  const submitAttendance = async () => {
    try {
      const payload = staff.map((s) => ({
        staffId: s._id,
        date,
        shift,
        status: attendance[s._id] || "Absent",
      }));

      await axios.post(
        "https://sree-apparels-ems.onrender.com/api/attendance",
        payload
      );

      alert("✅ Attendance saved successfully!");
      loadAttendance();
    } catch (err) {
      alert("❌ Failed to save attendance.");
    }
  };

  // Avatar component with enhanced design
  const Avatar = ({
    imageUrl,
    name,
    size = "w-16 h-16",
    textSize = "text-xl",
  }) => {
    const colors = [
      "from-blue-500 to-purple-600",
      "from-green-500 to-teal-600",
      "from-orange-500 to-red-600",
      "from-pink-500 to-rose-600",
      "from-indigo-500 to-blue-600",
    ];
    const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;

    if (imageUrl) {
      return (
        <img
          src={imageUrl}
          alt={name}
          className={`${size} rounded-2xl object-cover ring-4 ring-white/50 shadow-xl`}
        />
      );
    }
    return (
      <div
        className={`${size} rounded-2xl bg-gradient-to-br ${colors[colorIndex]} text-white flex items-center justify-center font-bold ${textSize} ring-4 ring-white/50 shadow-xl`}
      >
        {name?.charAt(0).toUpperCase()}
      </div>
    );
  };

  // Calculate stats
  const stats = {
    total: staff.length,
    present: Object.values(attendance).filter((s) => s === "Present").length,
    absent: Object.values(attendance).filter((s) => s === "Absent").length,
    percentage:
      staff.length > 0
        ? Math.round(
            (Object.values(attendance).filter((s) => s === "Present").length /
              staff.length) *
              100
          )
        : 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-300/10 to-blue-300/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Watermark */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="text-8xl font-bold text-gray-200/10 rotate-12 select-none">
          SREE APPARELS
        </div>
      </div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">

            {/* Stats Cards */}
{staff.length > 0 && (
  <div className="mb-6">
    {isStaff ? (
      // ✅ Fresh attendance → show zeros + message
      <>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg">
            <p className="text-blue-100 text-sm">Total Staff</p>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-lg">
            <p className="text-green-100 text-sm">Present</p>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-2xl text-white shadow-lg">
            <p className="text-red-100 text-sm">Absent</p>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg">
            <p className="text-purple-100 text-sm">Attendance %</p>
            <p className="text-3xl font-bold">0%</p>
          </div>
        </div>
        <p className="text-center text-gray-500 italic">
          Attendance not marked yet
        </p>
      </>
    ) : (
      // ✅ Stored attendance → show real stats
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg">
          <p className="text-blue-100 text-sm">Total Staff</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-lg">
          <p className="text-green-100 text-sm">Present</p>
          <p className="text-3xl font-bold">{stats.present}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-2xl text-white shadow-lg">
          <p className="text-red-100 text-sm">Absent</p>
          <p className="text-3xl font-bold">{stats.absent}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg">
          <p className="text-purple-100 text-sm">Attendance %</p>
          <p className="text-3xl font-bold">{stats.percentage}%</p>
        </div>
      </div>
    )}
  </div>
)}


            {/* Date & Shift Controls */}
            <div className="flex flex-wrap gap-6 mb-8 justify-center items-center">
              <div className="flex items-center space-x-3">
                <Calendar className="w-6 h-6 text-blue-600" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-700"
                />
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-indigo-600" />
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-indigo-500 text-gray-700"
                >
                  <option value="">Select Shift</option>
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                </select>
              </div>
              <button
                onClick={loadAttendance}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:scale-105 transition disabled:opacity-50"
              >
                <Activity className="w-5 h-5" />
                <span>Load Attendance</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/70 rounded-3xl shadow-2xl p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading attendance data...</p>
            </div>
          </div>
        )}

        {/* Staff List */}
        {!loading && staff.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/70 rounded-3xl shadow-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
                  <UserCheck className="w-7 h-7 text-blue-600" />
                  Staff Attendance
                </h3>
                {date && shift && (
                  <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    {new Date(date).toLocaleDateString()} - {shift} Shift
                  </div>
                )}
              </div>
              <div className="grid gap-6">
                {staff.map((s, index) => (
                  <div
                    key={s._id}
                    className="group bg-white/60 border border-white/30 rounded-2xl p-6 hover:shadow-xl transition"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <Avatar
                          imageUrl={s.imageUrl}
                          name={s.name}
                          size="w-16 h-16"
                          textSize="text-xl"
                        />
                        <div>
                          <h4 className="text-xl font-bold">{s.name}</h4>
                          <p className="text-gray-600 text-sm">{s.role}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleAttendance(s._id)}
                        className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg hover:scale-105 transition ${
                          attendance[s._id] === "Present"
                            ? "bg-gradient-to-r from-green-500 to-green-600"
                            : "bg-gradient-to-r from-red-500 to-red-600"
                        }`}
                      >
                        {attendance[s._id] === "Present" ? (
                          <CheckCircle2 className="inline w-5 h-5 mr-2" />
                        ) : (
                          <XCircle className="inline w-5 h-5 mr-2" />
                        )}
                        {attendance[s._id]}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {staff.length > 0 && isStaff && (
                <div className="mt-8 text-center">
                  <button
                    onClick={submitAttendance}
                    disabled={loading}
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:scale-105 transition font-bold mx-auto"
                  >
                    <Save className="w-6 h-6" />
                    Submit All Attendance
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && staff.length === 0 && (date || shift) && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/70 rounded-3xl shadow-2xl p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-600">
                No Staff Data Found
              </h3>
              <p className="text-gray-500">
                Please select a date and shift to load attendance data.
              </p>
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
}
