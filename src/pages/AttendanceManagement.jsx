import { useEffect, useState } from "react";
import axios from "axios";

export default function AttendanceManagement() {
  const [date, setDate] = useState("");
  const [shift, setShift] = useState("");
  const [staff, setStaff] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);

  // ✅ Load attendance/staff whenever called
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
      console.log("Attendance data:", res.data);
      if (res.data.type === "attendance") {
        // Case 1: Attendance already saved
        const mapped = {};
        res.data.data.forEach((rec) => {
          mapped[rec.staffId._id] = rec.status;
        });
        setAttendance(mapped);
        setStaff(res.data.data.map((r) => r.staffId));
      } else if (res.data.type === "staff") {
        // Case 2: No attendance yet → mark everyone Absent
        const mapped = {};
        res.data.data.forEach((s) => {
          mapped[s._id] = "Absent";
        });
        setAttendance(mapped);
        setStaff(res.data.data);
      }
    } catch (err) {
      console.error("Error loading attendance:", err);
      alert("❌ Failed to load attendance.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Toggle attendance
  const toggleAttendance = (id) => {
    setAttendance((prev) => ({
      ...prev,
      [id]: prev[id] === "Present" ? "Absent" : "Present",
    }));
  };

  // ✅ Submit all attendance
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
      loadAttendance(); // reload to reflect saved state
    } catch (err) {
      console.error("Error saving attendance:", err);
      alert("❌ Failed to save attendance.");
    }
  };
  // Avatar component (Image or First Letter)
    const Avatar = ({ imageUrl, name, size = "w-24 h-24", textSize = "text-2xl" }) => {
        if (imageUrl) {
            return (
                <img
                    src={imageUrl}
                    alt={name}
                    className={`${size} rounded-full object-cover border-4 border-indigo-200`}
                />
            );
        }
        return (
            <div
                className={`${size} rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold ${textSize} border-4 border-indigo-200`}
            >
                {name?.charAt(0).toUpperCase()}
            </div>
        );
    };
  
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Attendance Management</h2>

      {/* Date & Shift selectors + Load Button */}
      <div className="flex gap-4 mb-8">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 rounded-lg shadow-sm focus:ring focus:ring-blue-200"
        />
        <select
          value={shift}
          onChange={(e) => setShift(e.target.value)}
          className="border p-2 rounded-lg shadow-sm focus:ring focus:ring-blue-200"
        >
          <option value="">Select Shift</option>
          <option value="Morning">Morning</option>
          <option value="Afternoon">Afternoon</option>
          <option value="Evening">Evening</option>
        </select>

        <button
          onClick={loadAttendance}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Load Attendance
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <>
          {/* Staff List */}
          <div className="grid gap-4">
            {staff.map((s) => (
              <div
                key={s._id}
                className="flex items-center justify-between border p-4 rounded-xl shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center gap-3">
                     <Avatar imageUrl={s.imageUrl} name={s.name} />
                  <div>
                    <p className="font-semibold">{s.name}</p>
                    <p className="text-sm text-gray-500">{s.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleAttendance(s._id)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    attendance[s._id] === "Present"
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                >
                  {attendance[s._id]}
                </button>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          {staff.length > 0 && (
            <div className="mt-8 text-center">
              <button
                onClick={submitAttendance}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700"
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
