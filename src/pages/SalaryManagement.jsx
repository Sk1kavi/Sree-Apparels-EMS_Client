import { useEffect, useState } from "react";
import axios from "axios";
import {
  Calendar,
  Users,
  IndianRupee,
  TrendingUp,
  CheckCircle,
  Loader2,
  User,
  Briefcase,
} from "lucide-react";

const API = "https://sree-apparels-ems.onrender.com/api/salary";
const now = new Date();
const defaultMonth = `${now.getFullYear()}-${String(
  now.getMonth() + 1
).padStart(2, "0")}`;

export default function SalaryManagement() {
  const [month, setMonth] = useState(defaultMonth);
  const [ratePerPiece, setRatePerPiece] = useState("");
  const [ratePerShift, setRatePerShift] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Fetch summary data
  const fetchSummary = async () => {
    if (!month) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/summary`, {
        params: { month, ratePerPiece, ratePerShift },
      });
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Show animation on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Auto-fetch when month changes
  useEffect(() => {
    fetchSummary();
  }, [month]);

  const onApply = () => {
    fetchSummary();
  };

  const handleFinalize = async () => {
    if (!data) return alert("Apply first to calculate salary.");
    try {
      const tailorsWithId = data.tailors.map((t) => ({
        staffId: t._id,
        name: t.name,
        salary: t.salary,
        totalPieces: t.totalPieces,
      }));
      const helpersWithId = data.helpers.map((h) => ({
        staffId: h._id,
        name: h.name,
        salary: h.salary,
        presentShifts: h.presentShifts,
      }));

      await axios.post(`${API}/finalize`, {
        month,
        tailors: tailorsWithId,
        helpers: helpersWithId,
        totals: data.totals,
        rates: data.rates,
      });

      alert("Salaries finalized and saved!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Error finalizing salary");
    }
  };

  // Validation for Apply button
  const isApplyDisabled =
    loading ||
    ratePerPiece === "" ||
    ratePerShift === "" ||
    Number(ratePerPiece) < 0 ||
    Number(ratePerShift) < 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-violet-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Company Watermark */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0 opacity-5">
        <div className="text-9xl font-black text-gray-900 transform rotate-[-15deg] select-none">
          SREE APPARELS
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`relative z-10 p-6 lg:p-8 transition-all duration-1000 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >

        {/* Control Panel */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 mb-8 transform transition-all duration-500 hover:shadow-3xl">
          <div className="flex flex-wrap gap-6 items-end">
            {/* Month input */}
            <div className="flex flex-col group">
              <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Select Month
              </label>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-blue-300"
              />
            </div>

            {/* Rate per Piece */}
            <div className="flex flex-col group">
              <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-green-600" />
                Rate per Piece (Tailors)
              </label>
              <input
                type="number"
                value={ratePerPiece}
                onChange={(e) => setRatePerPiece(e.target.value)}
                className="border-2 border-gray-200 rounded-xl p-3 w-48 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 group-hover:border-green-300"
                placeholder="Enter amount"
                min="0"
                required
              />
            </div>

            {/* Rate per Shift */}
            <div className="flex flex-col group">
              <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-purple-600" />
                Rate per Shift (Helpers)
              </label>
              <input
                type="number"
                value={ratePerShift}
                onChange={(e) => setRatePerShift(e.target.value)}
                className="border-2 border-gray-200 rounded-xl p-3 w-48 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 group-hover:border-purple-300"
                placeholder="Enter amount"
                min="0"
                required
              />
            </div>

            {/* Apply Button */}
            <button
              onClick={onApply}
              disabled={isApplyDisabled}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" />
                  Calculate
                </>
              )}
            </button>

            {/* Finalize Button */}
            <button
              onClick={handleFinalize}
              disabled={!data}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Finalize
            </button>
          </div>
        </div>

            {/* Data Sections */}
        {data && (
          <div className="space-y-8">
            {/* Period Information */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full font-semibold shadow-lg">
                <Calendar className="w-4 h-4" />
                Period: {data.period?.start} → {data.period?.end}
              </div>
            </div>

            {/* Tailors Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white">
                  <User className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  Tailors ({data.tailors?.length || 0})
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.tailors?.map((t, index) => (
                  <div
                    key={t.staffId || index}
                    className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-white/50 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 group"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      {t.imageUrl ? (
                        <img
                          src={t.imageUrl}
                          alt={t.name}
                          className="w-16 h-16 rounded-full object-cover border-4 border-blue-200 shadow-lg group-hover:border-blue-400 transition-all duration-300"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-all duration-300">
                          {t.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors duration-300">
                          {t.name}
                        </h3>
                        <p className="text-gray-600">Tailor</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                        <span className="text-gray-700 font-medium">
                          Pieces Completed
                        </span>
                        <span className="font-bold text-blue-700 text-lg">
                          {t.totalPieces || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                        <span className="text-gray-700 font-medium">
                          Total Salary
                        </span>
                        <span className="font-bold text-green-700 text-xl">
                          ₹{t.salary || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Helpers Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl text-white">
                  <Users className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-violet-700 bg-clip-text text-transparent">
                  Helpers ({data.helpers?.length || 0})
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.helpers?.map((h, index) => (
                  <div
                    key={h.staffId || index}
                    className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-white/50 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 group"
                    style={{
                      animationDelay: `${(data.tailors?.length || 0 + index) * 100
                        }ms`,
                    }}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      {h.imageUrl ? (
                        <img
                          src={h.imageUrl}
                          alt={h.name}
                          className="w-16 h-16 rounded-full object-cover border-4 border-purple-200 shadow-lg group-hover:border-purple-400 transition-all duration-300"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-all duration-300">
                          {h.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 group-hover:text-purple-700 transition-colors duration-300">
                          {h.name}
                        </h3>
                        <p className="text-gray-600">Helper</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
                        <span className="text-gray-700 font-medium">
                          Shifts Present
                        </span>
                        <span className="font-bold text-purple-700 text-lg">
                          {h.presentShifts || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                        <span className="text-gray-700 font-medium">
                          Total Salary
                        </span>
                        <span className="font-bold text-green-700 text-xl">
                          ₹{h.salary || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Summary Section */}
            <section className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl shadow-2xl p-8 text-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-bold">Summary Overview</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="text-3xl font-bold text-blue-300 mb-2">
                    {data.totals?.pieces || 0}
                  </div>
                  <div className="text-gray-300">Total Pieces Completed</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="text-3xl font-bold text-purple-300 mb-2">
                    {data.totals?.shifts || 0}
                  </div>
                  <div className="text-gray-300">Total Shifts Worked</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="text-3xl font-bold text-green-300 mb-2">
                    ₹{data.totals?.payout || 0}
                  </div>
                  <div className="text-gray-300">Total Payout Amount</div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
