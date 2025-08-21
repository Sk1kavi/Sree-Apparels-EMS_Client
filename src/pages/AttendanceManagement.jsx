import { useEffect, useState } from "react";
import axios from "axios";

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
      const res = await axios.get("https://sree-apparels-ems.onrender.com/api/attendance", {
        params: { date, shift },
      });
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
          mapped[s._id] = "Absent";
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

      await axios.post("https://sree-apparels-ems.onrender.com/api/attendance", payload);

      alert("✅ Attendance saved successfully!");
      loadAttendance();
    } catch (err) {
      alert("❌ Failed to save attendance.");
    }
  };

  // Avatar component (Image or First Letter)
  const Avatar = ({ imageUrl, name, size = "w-16 h-16", textSize = "text-xl" }) => {
    if (imageUrl) {
      return (
        <img
          src={imageUrl}
          alt={name}
          className={`${size} rounded-full object-cover border-4 border-indigo-300 shadow-lg`}
        />
      );
    }
    return (
      <div
        className={`${size} rounded-full bg-gradient-to-br from-indigo-500 to-blue-400 text-white flex items-center justify-center font-bold ${textSize} border-4 border-indigo-300 shadow-lg`}
      >
        {name?.charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <div className="p-8 max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100">
      <h2 className="text-3xl font-extrabold mb-8 text-indigo-700 text-center tracking-wide drop-shadow">
        Attendance Management
      </h2>

      {/* Date & Shift selectors + Load Button */}
      <div className="flex flex-wrap gap-4 mb-10 justify-center items-center">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border-2 border-indigo-300 p-3 rounded-xl shadow focus:ring focus:ring-indigo-200 transition"
        />
        <select
          value={shift}
          onChange={(e) => setShift(e.target.value)}
          className="border-2 border-indigo-300 p-3 rounded-xl shadow focus:ring focus:ring-indigo-200 transition"
        >
          <option value="">Select Shift</option>
          <option value="Morning">Morning</option>
          <option value="Afternoon">Afternoon</option>
          <option value="Evening">Evening</option>
        </select>

        <button
          onClick={loadAttendance}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-xl font-semibold shadow-lg hover:scale-105 hover:from-indigo-600 hover:to-blue-600 transition"
        >
          Load Attendance
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-indigo-500"></div>
          <span className="ml-4 text-indigo-500 font-semibold">Loading...</span>
        </div>
      ) : (
        <>
          {/* Staff List */}
          <div className="grid gap-6">
            {staff.map((s) => (
              <div
                key={s._id}
                className="flex items-center justify-between border border-indigo-100 p-5 rounded-2xl shadow-md bg-gradient-to-br from-white via-indigo-50 to-blue-50 hover:shadow-xl transition"
              >
                <div className="flex items-center gap-4">
                  <Avatar imageUrl={s.imageUrl} name={s.name} />
                  <div>
                    <p className="font-bold text-lg text-indigo-700">{s.name}</p>
                    <p className="text-sm text-gray-500">{s.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleAttendance(s._id)}
                  className={`px-6 py-2 rounded-xl font-bold shadow transition ${
                    attendance[s._id] === "Present"
                      ? "bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white"
                      : "bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white"
                  }`}
                >
                  {attendance[s._id]}
                </button>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          {staff.length > 0 && isStaff === true && (
            <div className="mt-10 text-center">
              <button
                onClick={submitAttendance}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl font-bold shadow-xl hover:scale-105 hover:from-indigo-700 hover:to-blue-700 transition"
              >
                Submit All
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
