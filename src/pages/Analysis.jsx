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

export default function Analysis() {
  const [staffList, setStaffList] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [viewMode, setViewMode] = useState("Daily");
  const [salaryData, setSalaryData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [stitchingData, setStitchingData] = useState([]);

  useEffect(() => {
    fetchStaffList();
  }, []);

  useEffect(() => {
    if (staffList.length) fetchAnalysis();
  }, [staffList, year, month, viewMode]);

  const fetchStaffList = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/staff`);
      setStaffList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnalysis = async () => {
    try {
      const monthStr = month.toString().padStart(2, "0");

      // Salary
      const salaryRes = await axios.get(`${BASE_URL}/analysis/salary?year=${year}&month=${monthStr}`);
      const salaryChart = salaryRes.data.map(s => ({
        name: s.name,
        salary: s.salary
      }));
      setSalaryData(salaryChart);

      // Attendance
      const attendanceRes = await axios.get(`${BASE_URL}/analysis/attendance?year=${year}&month=${monthStr}`);
      const attendanceChart = attendanceRes.data.map(s => ({
        name: s.name,
        presentShifts: s.presentShifts,
        absentShifts: s.absentShifts
      }));
      setAttendanceData(attendanceChart);

      // Stitching (Tailors Only)
      const tailors = staffList.filter(s => s.role === "Tailor").map(s => s._id);
      if (tailors.length) {
        const stitchingRes = await axios.get(`${BASE_URL}/analysis/stitching?year=${year}&month=${monthStr}`);
        const stitchingChart = stitchingRes.data.map(s => ({
          name: s.name,
          stitchedCount: s.stitchedCount
        }));
        setStitchingData(stitchingChart);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-8 flex flex-col items-center gap-12">
      {/* === Header === */}
      <div className="flex justify-between items-center w-full max-w-4xl mb-8">
        <h2 className="text-2xl font-bold text-indigo-700">Staff Comparison Dashboard</h2>
      </div>

      {/* === Filters === */}
      <div className="flex gap-4 justify-center w-full max-w-4xl mb-4">
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
      <div className="bg-white border rounded-lg shadow p-4 w-full max-w-4xl">
        <h3 className="text-lg font-bold text-indigo-700 mb-1 text-center">Salary Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salaryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={value => `₹${value}`} />
            <Legend />
            <Bar dataKey="salary" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* === Attendance Chart === */}
      <div className="bg-white border rounded-lg shadow p-4 w-full max-w-4xl">
        <h3 className="text-lg font-bold text-indigo-700 mb-1 text-center">Attendance Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={attendanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="presentShifts" fill="#10b981" name="Present Shifts" />
            <Bar dataKey="absentShifts" fill="#ef4444" name="Absent Shifts" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* === Stitching Chart (Tailors Only) === */}
      {stitchingData.length > 0 && (
        <div className="bg-white border rounded-lg shadow p-4 w-full max-w-4xl">
          <h3 className="text-lg font-bold text-indigo-700 mb-1 text-center">Stitching Performance (Tailors)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stitchingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="stitchedCount" fill="#f59e0b" name="Pieces Stitched" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
