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
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Target, 
  Calendar, 
  Filter,
  Download,
  FileText,
  CheckSquare,
  X,
  Plus,
  File,
  FileSpreadsheet
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; 


const BASE_URL = "https://sree-apparels-ems.onrender.com/api";

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function ReportsAnalysis() {
  const [staffList, setStaffList] = useState([]);
  const [activeTab, setActiveTab] = useState("analysis"); // "analysis" or "reports"
  
  // Analysis states
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [salaryData, setSalaryData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [stitchingData, setStitchingData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCard, setActiveCard] = useState(null);

  // Reports states
  const [selectedReportTypes, setSelectedReportTypes] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [selectedYears, setSelectedYears] = useState([new Date().getFullYear()]);
  const [reportData, setReportData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    { id: 'attendance', label: 'Attendance Report', icon: Clock, color: 'bg-blue-500' },
    { id: 'salary', label: 'Salary Report', icon: TrendingUp, color: 'bg-green-500' },
    { id: 'stitching', label: 'Stitching Report', icon: Target, color: 'bg-orange-500' },
    { id: 'pieceTracking', label: 'Piece Tracking Report', icon: FileText, color: 'bg-purple-500' }
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    fetchStaffList();
  }, []);

  useEffect(() => {
    if (staffList.length && activeTab === "analysis") fetchAnalysis();
  }, [staffList, year, month, activeTab]);

  const fetchStaffList = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${BASE_URL}/staff`);
      setStaffList(res.data);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const fetchAnalysis = async () => {
    try {
      const monthStr = month.toString().padStart(2, "0");

      const salaryRes = await axios.get(`${BASE_URL}/analysis/salary?year=${year}&month=${monthStr}`);
      setSalaryData(salaryRes.data.map(s => ({ name: s.name, salary: s.salary })));

      const attendanceRes = await axios.get(`${BASE_URL}/analysis/attendance?year=${year}&month=${monthStr}`);
      setAttendanceData(attendanceRes.data.map(s => ({
        name: s.name,
        presentShifts: s.presentShifts,
        absentShifts: s.absentShifts
      })));

      const tailors = staffList.filter(s => s.role === "Tailor").map(s => s._id);
      if (tailors.length) {
        const stitchingRes = await axios.get(`${BASE_URL}/analysis/stitching?year=${year}&month=${monthStr}`);
        setStitchingData(stitchingRes.data.map(s => ({
          name: s.name,
          stitchedCount: s.stitchedCount
        })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleReportType = (typeId) => {
    setSelectedReportTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(t => t !== typeId)
        : [...prev, typeId]
    );
  };

  const toggleMonth = (monthIndex) => {
    setSelectedMonths(prev => 
      prev.includes(monthIndex)
        ? prev.filter(m => m !== monthIndex)
        : [...prev, monthIndex]
    );
  };

  const toggleYear = (yearVal) => {
    setSelectedYears(prev =>
      prev.includes(yearVal)
        ? prev.filter(y => y !== yearVal)
        : [...prev, yearVal]
    );
  };

  const selectAllMonths = () => {
    setSelectedMonths(selectedMonths.length === 12 ? [] : Array.from({ length: 12 }, (_, i) => i + 1));
  };

  const generateReport = async () => {
    if (selectedReportTypes.length === 0 || selectedMonths.length === 0 || selectedYears.length === 0) {
      alert("Please select at least one report type, month, and year");
      return;
    }

    setIsGenerating(true);
    const data = {};

    try {
      for (const year of selectedYears) {
        for (const month of selectedMonths) {
          const monthStr = month.toString().padStart(2, "0");
          const key = `${year}-${monthStr}`;

          if (selectedReportTypes.includes('salary')) {
            const res = await axios.get(`${BASE_URL}/analysis/salary?year=${year}&month=${monthStr}`);
            if (!data.salary) data.salary = [];
            data.salary.push(...res.data.map(s => ({ ...s, period: key })));
          }

          if (selectedReportTypes.includes('attendance')) {
            const res = await axios.get(`${BASE_URL}/analysis/attendance?year=${year}&month=${monthStr}`);
            if (!data.attendance) data.attendance = [];
            data.attendance.push(...res.data.map(s => ({ ...s, period: key })));
          }

          if (selectedReportTypes.includes('stitching')) {
            const res = await axios.get(`${BASE_URL}/analysis/stitching?year=${year}&month=${monthStr}`);
            if (!data.stitching) data.stitching = [];
            data.stitching.push(...res.data.map(s => ({ ...s, period: key })));
          }

          if (selectedReportTypes.includes('pieceTracking')) {
            // Placeholder - adjust endpoint as needed
            if (!data.pieceTracking) data.pieceTracking = [];
            // Add your piece tracking API call here
          }
        }
      }

      setReportData(data);
    } catch (err) {
      console.error(err);
      alert("Error generating report");
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToExcel = () => {
    if (!reportData) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    
    Object.keys(reportData).forEach(reportType => {
      csvContent += `\n${reportType.toUpperCase()} REPORT\n`;
      const data = reportData[reportType];
      if (data.length > 0) {
        const headers = Object.keys(data[0]);
        csvContent += headers.join(",") + "\n";
        data.forEach(row => {
          csvContent += headers.map(h => row[h]).join(",") + "\n";
        });
      }
      csvContent += "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

const exportToPDF = (reportData) => {
  if (!reportData || Object.keys(reportData).length === 0) {
    alert("No report data to export!");
    return;
  }

  const doc = new jsPDF();

  // --- HEADER ---
  doc.setFontSize(18);
  doc.text("SREE APPARELS", 105, 20, { align: "center" });

  doc.setFontSize(12);
  doc.text("Official Report", 105, 28, { align: "center" });

  doc.setFontSize(10);
  doc.text("Email: sreeapparels.gbi@gmail.com", 20, 36);
  doc.text("Phone: 9344931717", 20, 41);

  const addrLines = [
    "11A, Jawaharlal Nehru Street,",
    "Amman Mess opposite,",
    "Erode main road, Gobi."
  ];
  let y = 36;
  addrLines.forEach(line => {
    doc.text(line, 190, y, { align: "right" });
    y += 5;
  });

  // Move line further down to give space below header
  doc.setLineWidth(0.5);
  doc.line(15, 50, 195, 50); // moved from 46 -> 50

  // --- TABLES ---
  let startY = 55; // start below the line

  Object.keys(reportData).forEach((reportType) => {
    const rows = Array.isArray(reportData[reportType]) ? reportData[reportType] : [];
    if (rows.length === 0) return;

    // Report type title
    doc.setFontSize(12);
    doc.text(`${reportType} Data`, 15, startY);
    startY += 6; // a bit of space after title

    // Column headers
    const columns = Object.keys(rows[0] || {});
    const head = [columns.map(col => col.charAt(0).toUpperCase() + col.slice(1))];

    // Table body - ALL rows
    const body = rows.map(row => columns.map(col => row[col]));

    autoTable(doc, {
      startY,
      head,
      body,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [200, 200, 200] },
      margin: { left: 15, right: 15 },
      theme: "grid",
      didDrawPage: (data) => {
        // Repeat header on each new page if needed
        if (data.pageNumber > 1) {
          doc.setFontSize(18);
          doc.text("SREE APPARELS", 105, 20, { align: "center" });
          doc.setFontSize(12);
          doc.text("Official Report", 105, 28, { align: "center" });
          doc.setFontSize(10);
          doc.text("Email: sreeapparels.gbi@gmail.com", 20, 36);
          doc.text("Phone: 9344931717", 20, 41);
          let yHeader = 36;
          addrLines.forEach(line => {
            doc.text(line, 190, yHeader, { align: "right" });
            yHeader += 5;
          });
          doc.setLineWidth(0.5);
          doc.line(15, 50, 195, 50);
        }
      }
    });

    startY = doc.lastAutoTable.finalY + 10;
  });

  // --- FOOTER ---
  const today = new Date();
  doc.setFontSize(10);
  doc.text(`Generated on: ${today.toLocaleDateString()} at ${today.toLocaleTimeString()}`, 15, startY);
  doc.text("End of Report", 105, startY, { align: "center" });

  // --- SAVE PDF ---
  doc.save(`report_${Date.now()}.pdf`);
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
      style={{ animation: `slideInUp 0.8s ease-out ${delay}ms both` }}
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-8 mx-auto"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Dashboard</h2>
          <p className="text-gray-300">Preparing your data...</p>
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
        {/* Header with Tabs */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
              <p className="text-gray-300">Analytics & Reports Management</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20 w-fit">
            <button
              onClick={() => setActiveTab("analysis")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === "analysis"
                  ? "bg-white text-gray-900 shadow-lg"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              Analysis View
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === "reports"
                  ? "bg-white text-gray-900 shadow-lg"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <FileText className="w-5 h-5" />
              Reports Generator
            </button>
          </div>
        </div>

        {/* Analysis Tab Content */}
        {activeTab === "analysis" && (
          <>
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
            </div>

            {/* Charts */}
            <div className="max-w-7xl mx-auto space-y-12">
              <ChartContainer title="Salary Comparison" icon={TrendingUp} isActive={activeCard === "Salary Comparison"} delay={200}>
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

              <ChartContainer title="Attendance Comparison" icon={Clock} isActive={activeCard === "Attendance Comparison"} delay={400}>
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

              {stitchingData.length > 0 && (
                <ChartContainer title="Stitching Performance (Tailors)" icon={Target} isActive={activeCard === "Stitching Performance (Tailors)"} delay={600}>
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
          </>
        )}

        {/* Reports Tab Content */}
        {activeTab === "reports" && (
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/30 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Generate Custom Report</h2>
              
              {/* Report Type Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5" />
                  Select Report Types
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {reportTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => toggleReportType(type.id)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        selectedReportTypes.includes(type.id)
                          ? `${type.color} border-transparent text-white shadow-lg scale-105`
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <type.icon className="w-6 h-6 mx-auto mb-2" />
                      <p className="font-medium text-sm">{type.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Year Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Select Years
                </h3>
                <div className="flex flex-wrap gap-3">
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                    <button
                      key={y}
                      onClick={() => toggleYear(y)}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                        selectedYears.includes(y)
                          ? 'bg-blue-500 text-white shadow-lg scale-105'
                          : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {/* Month Selection */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Select Months
                  </h3>
                  <button
                    onClick={selectAllMonths}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors"
                  >
                    {selectedMonths.length === 12 ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {months.map((monthName, index) => (
                    <button
                      key={index}
                      onClick={() => toggleMonth(index + 1)}
                      className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                        selectedMonths.includes(index + 1)
                          ? 'bg-green-500 text-white shadow-lg scale-105'
                          : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-green-300'
                      }`}
                    >
                      {monthName.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex justify-center">
                <button
                  onClick={generateReport}
                  disabled={isGenerating}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="w-6 h-6" />
                      Generate Report
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Report Results */}
            {reportData && (
              <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/30">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Generated Report</h2>
                  <div className="flex gap-3">
                    <button
                      onClick={exportToExcel}
                      className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <FileSpreadsheet className="w-5 h-5" />
                      Export Excel
                    </button>
                    <button
                      onClick={() => exportToPDF(reportData)}
                      className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <File className="w-5 h-5" />
                      Export PDF
                    </button>

                  </div>
                </div>

                {/* Report Charts */}
                <div className="space-y-8">
                  {reportData.salary && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-700 mb-4">Salary Report</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={reportData.salary.slice(0, 20)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 10 }} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="salary" fill="#3B82F6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {reportData.attendance && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-700 mb-4">Attendance Report</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={reportData.attendance.slice(0, 20)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 10 }} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="presentShifts" fill="#10B981" name="Present" />
                          <Bar dataKey="absentShifts" fill="#EF4444" name="Absent" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {reportData.stitching && reportData.stitching.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-700 mb-4">Stitching Performance Report</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={reportData.stitching.slice(0, 20)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 10 }} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="stitchedCount" stroke="#F59E0B" strokeWidth={3} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Data Tables */}
                <div className="mt-8 space-y-6">
                  {Object.keys(reportData).map(reportType => (
                    <div key={reportType} className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 capitalize">{reportType} Data</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-200">
                            <tr>
                              {reportData[reportType].length > 0 && Object.keys(reportData[reportType][0]).map(key => (
                                <th key={key} className="px-4 py-2 text-left font-semibold capitalize">{key}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {reportData[reportType].slice(0, 10).map((row, idx) => (
                              <tr key={idx} className="border-b border-gray-200 hover:bg-gray-100">
                                {Object.values(row).map((val, i) => (
                                  <td key={i} className="px-4 py-2">{val}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {reportData[reportType].length > 10 && (
                          <p className="text-center text-gray-500 mt-4">
                            Showing 10 of {reportData[reportType].length} entries
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
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