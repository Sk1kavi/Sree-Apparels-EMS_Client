// StaffDetails.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";
import { format, parseISO, getISOWeek } from "date-fns";

const BASE_URL = "https://sree-apparels-ems.onrender.com/api";

export default function StaffDetails({ staffId, goBack }) {
    const [staff, setStaff] = useState(null);
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [viewMode, setViewMode] = useState("Daily"); // Daily | Weekly | Monthly
    const [salaryData, setSalaryData] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [stitchingData, setStitchingData] = useState([]);
    const [totals, setTotals] = useState({ salary: 0, presentShifts: 0, absentShifts: 0, stitchedCount: 0 });

    // 🔹 Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        role: "Tailor",
        state: "",
        district: "",
        city: "",
        pincode: "",
        imageUrl: ""
        });
    const [imageFile, setImageFile] = useState(null);

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
            setFormData(res.data); // preload edit form
        } catch (err) {
            console.error(err);
        }
    };

    const fetchAnalysis = async () => {
        try {
            const monthStr = month.toString().padStart(2, "0");

            // Salary
            const salaryRes = await axios.get(`${BASE_URL}/analysis/salary/${staffId}?year=${year}&month=${monthStr}`);
            console.log(salaryRes.data);
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

    // Utility to aggregate daily data into weekly or monthly
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

    const uploadImage = async () => {
        if (!imageFile) return "";
        const fd = new FormData();
        fd.append("image", imageFile);
        try {
            const res = await axios.post(`${BASE_URL}/staff/upload`, fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data.imageUrl;
        } catch (err) {
            console.error(err);
            return "";
        }
    };

   const handleUpdate = async (e) => {
    e.preventDefault();
    let imageUrl = formData.imageUrl;
    if (imageFile) imageUrl = await uploadImage();

    const payload = {
        name: formData.name,
        phone: formData.phone,
        role: formData.role,
        address: {
        state: formData.state,
        district: formData.district,
        city: formData.city,
        pincode: formData.pincode,
        },
        imageUrl,
    };

    try {
        await axios.put(`${BASE_URL}/staff/${staffId}`, payload);
        setIsEditing(false);
        fetchStaffDetails(); // refresh
    } catch (err) {
        console.error("Update Staff error:", err.response?.data || err.message);
    }
    };

    if (!staff) return <div className="text-center mt-12">Loading...</div>;

    // 🔹 Show Edit Form
    if (isEditing) {
        return (
            <form
                onSubmit={handleUpdate}
                className="bg-white border border-indigo-100 shadow-xl rounded-2xl p-8 max-w-lg mx-auto mt-12"
                >
                <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">
                    Edit Staff
                </h2>
                <div className="space-y-4">
                    {/* Name */}
                    <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        placeholder="Enter full name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="border p-3 w-full rounded-lg"
                        required
                    />
                    </div>

                    {/* Phone */}
                    <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                    </label>
                    <input
                        id="phone"
                        type="text"
                        placeholder="Enter phone number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="border p-3 w-full rounded-lg"
                    />
                    </div>

                    {/* Role */}
                    <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                    </label>
                    <select
                        id="role"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="border p-3 w-full rounded-lg"
                    >
                        <option value="Tailor">Tailor</option>
                        <option value="Helper">Helper</option>
                    </select>
                    </div>

                    {/* Address fields */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                        type="text"
                        placeholder="State"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="border p-3 w-full rounded-lg"
                        />
                        <input
                        type="text"
                        placeholder="District"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        className="border p-3 w-full rounded-lg"
                        />
                        <input
                        type="text"
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="border p-3 w-full rounded-lg"
                        />
                        <input
                        type="text"
                        placeholder="Pincode"
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        className="border p-3 w-full rounded-lg"
                        />
                    </div>
                    </div>

                    {/* Image */}
                    <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                        Profile Image
                    </label>
                    <input
                        id="image"
                        type="file"
                        onChange={(e) => setImageFile(e.target.files[0])}
                        className="border p-3 w-full rounded-lg"
                    />
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-between mt-8">
                    <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-500 text-white rounded-lg shadow"
                    >
                    Update Staff
                    </button>
                    <button
                    type="button"
                    onClick={() => setView("list")}
                    className="px-6 py-2 bg-gray-400 text-white rounded-lg"
                    >
                    Cancel
                    </button>
                </div>
                </form>
        );
    }

    // 🔹 Show Details + Charts
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-8 flex flex-col items-center gap-12">
            {/* === Staff Info Section === */}
            <div className="bg-white border border-indigo-100 shadow-xl rounded-2xl p-8 max-w-lg w-full text-center">
                <div className="flex justify-center mb-6">
                    {staff.imageUrl ? (
                        <img
                            src={staff.imageUrl}
                            alt={staff.name}
                            className="w-28 h-28 rounded-full object-cover border-4 border-indigo-200"
                        />
                    ) : (
                        <div className="w-28 h-28 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-3xl border-4 border-indigo-200">
                            {staff.name?.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <h2 className="text-2xl font-bold text-indigo-700 mb-2">{staff.name}</h2>
                <p className="text-indigo-500 font-medium mb-4">{staff.role}</p>
                <div className="space-y-2 text-gray-700 text-lg text-left">
                    <p>📞 <span className="font-semibold">{staff.phone}</span></p>

                    {/* Address */}
                    <p>🏠 
                        <span className="font-semibold">
                        {[staff.address?.city, staff.address?.district, staff.address?.state, staff.address?.pincode]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                    </p>
                    </div>

                <div className="flex justify-center gap-4 mt-8">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-lg shadow"
                    >
                        Edit
                    </button>
                    <button
                        onClick={async () => {
                            if (window.confirm("Delete this staff?")) {
                                await axios.delete(`${BASE_URL}/staff/${staffId}`);
                                goBack(); // return to list
                            }
                        }}
                        className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow"
                    >
                        Delete
                    </button>
                    <button
                        onClick={goBack}
                        className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg shadow"
                    >
                        Back
                    </button>
                </div>
            </div>

            {/* === Analysis / Chart Section === */}
            <div className="space-y-8 w-full max-w-4xl">
                {/* === Filters === */}
                <div className="flex gap-4 justify-center mb-4">
                    <select value={year} onChange={e => setYear(Number(e.target.value))} className="p-2 border rounded">
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    <select value={month} onChange={e => setMonth(Number(e.target.value))} className="p-2 border rounded">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                    <select value={viewMode} onChange={e => setViewMode(e.target.value)} className="p-2 border rounded">
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                    </select>
                </div>

                {/* === Salary Chart === */}
                <div className="bg-white border rounded-lg shadow p-4">
                    <h3 className="text-lg font-bold text-indigo-700 mb-1 text-center">Salary</h3>
                    <p className="text-center text-gray-600 mb-2">Total: ₹{totals.salary}</p>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={salaryData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => `₹${value}`} />
                            <Legend />
                            <Bar dataKey="salary" fill="#4f46e5" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* === Attendance Chart === */}
                <div className="bg-white border rounded-lg shadow p-4">
                    <h3 className="text-lg font-bold text-indigo-700 mb-1 text-center">Attendance</h3>
                    <p className="text-center text-gray-600 mb-2">
                        Present: {totals.presentShifts}, Absent: {totals.absentShifts}
                    </p>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={attendanceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="presentShifts" fill="#10b981" name="Present Shifts" />
                            <Bar dataKey="absentShifts" fill="#ef4444" name="Absent Shifts" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* === Stitching Chart (Tailors Only) === */}
                {staff.role === "Tailor" && (
                    <div className="bg-white border rounded-lg shadow p-4">
                        <h3 className="text-lg font-bold text-indigo-700 mb-1 text-center">Stitching Performance</h3>
                        <p className="text-center text-gray-600 mb-2">
                            Total Pieces Stitched: {totals.stitchedCount}
                        </p>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stitchingData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="stitchedCount" fill="#f59e0b" name="Pieces Stitched" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}
