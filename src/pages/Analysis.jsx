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
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line
} from "recharts";
import { TrendingUp, Users, Clock, Target, Calendar, Filter } from "lucide-react";

const BASE_URL = "https://sree-apparels-ems.onrender.com/api";

export default function Analysis() {
  const [staffList, setStaffList] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [viewMode, setViewMode] = useState("Daily");
  const [salaryData, setSalaryData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [stitchingData, setStitchingData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCard, setActiveCard] = useState(null);

  useEffect(() => {
    fetchStaffList();
  }, []);

  useEffect(() => {
    if (staffList.length) fetchAnalysis();
  }, [staffList, year, month, viewMode]);

  const fetchStaffList = async () => {
    try {
      setIsLoading(true);
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
      setSalaryData(salaryRes.data.map(s => ({ name: s.name, salary: s.salary })));

      // Attendance
      const attendanceRes = await axios.get(`${BASE_URL}/analysis/attendance?year=${year}&month=${monthStr}`);
      setAttendanceData(attendanceRes.data.map(s => ({
        name: s.name,
        presentShifts: s.presentShifts,
        absentShifts: s.absentShifts
      })));

      // Stitching
      const tailors = staffList.filter(s => s.role === "Tailor").map(s => s._id);
      if (tailors.length) {
        const stitchingRes = await axios.get(`${BASE_URL}/analysis/stitching?year=${year}&month=${monthStr}`);
        setStitchingData(stitchingRes.data.map(s => ({
          name: s.name,
          stitchedCount: s.stitchedCount
        })));
      }
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, delay = 0 }) => (
    <div 
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-white/20"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );

  const ChartContainer = ({ children, title, icon: Icon, isActive, delay = 0 }) => (
    <div 
      className={`bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl hover:shadow-2xl transform transition-all duration-500 border border-white/30 ${
        isActive ? 'ring-2 ring-blue-400 scale-[1.02]' : ''
      }`}
      style={{ animation: `slideInUp 0.8s ease-out ${delay}ms both`, cursor: 'pointer' }}
      onMouseEnter={() => setActiveCard(title)}
      onMouseLeave={() => setActiveCard(null)}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 bg-opacity-10">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-white/30">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' && entry.name.toLowerCase().includes('salary') ? '₹' : ''}{entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <div className="text-8xl font-bold text-white transform rotate-45">
            SREE APPARELS
          </div>
        </div>
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-8"></div>
            <div className="absolute top-6 left-6 w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Analytics</h2>
          <p className="text-gray-300">Preparing your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-indigo-500/10 to-pink-500/10 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <div className="text-9xl font-bold text-white transform rotate-12 select-none">
          SREE APPARELS
        </div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-12 text-center">
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Comprehensive insights into staff salary, attendance, and productivity
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/20">
            <Calendar className="w-4 h-4 text-blue-400" />
            <select 
              value={year} 
              onChange={e => setYear(Number(e.target.value))} 
              className="bg-transparent text-white p-2 rounded-lg focus:outline-none"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                <option key={y} value={y} className="bg-gray-800 text-white">{y}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/20">
            <Calendar className="w-4 h-4 text-purple-400" />
            <select 
              value={month} 
              onChange={e => setMonth(Number(e.target.value))} 
              className="bg-transparent text-white p-2 rounded-lg focus:outline-none"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m} className="bg-gray-800 text-white">
                  {new Date(2024, m - 1).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/20">
            <Filter className="w-4 h-4 text-green-400" />
            <select 
              value={viewMode} 
              onChange={e => setViewMode(e.target.value)} 
              className="bg-transparent text-white p-2 rounded-lg focus:outline-none"
            >
              <option value="Daily" className="bg-gray-800 text-white">Daily View</option>
              <option value="Weekly" className="bg-gray-800 text-white">Weekly View</option>
              <option value="Monthly" className="bg-gray-800 text-white">Monthly View</option>
            </select>
          </div>
        </div>

        {/* Charts */}
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Salary */}
          <ChartContainer title="Salary Comparison" icon={TrendingUp} isActive={activeCard === "Salary Comparison"} delay={600}>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={salaryData}>
                <defs>
                  <linearGradient id="salaryGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3}/>
                <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }}/>
                <YAxis tick={{ fill: '#6B7280', fontSize: 12 }}/>
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="salary" stroke="#3B82F6" strokeWidth={3} fill="url(#salaryGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Attendance */}
          <ChartContainer title="Attendance Comparison" icon={Clock} isActive={activeCard === "Attendance Comparison"} delay={800}>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3}/>
                <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }}/>
                <YAxis tick={{ fill: '#6B7280', fontSize: 12 }}/>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="presentShifts" fill="#10B981" name="Present Days" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absentShifts" fill="#EF4444" name="Absent Days" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Stitching */}
          {stitchingData.length > 0 && (
            <ChartContainer title="Stitching Performance (Tailors)" icon={Target} isActive={activeCard === "Stitching Performance (Tailors)"} delay={1000}>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={stitchingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3}/>
                  <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }}/>
                  <YAxis tick={{ fill: '#6B7280', fontSize: 12 }}/>
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="stitchedCount" stroke="#F59E0B" strokeWidth={4}
                        dot={{ fill: '#F59E0B', strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, stroke: '#F59E0B', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
