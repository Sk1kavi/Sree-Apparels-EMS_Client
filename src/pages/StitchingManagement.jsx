import { useState } from "react";
import axios from "axios";
import { 
  Calendar, 
  Clock, 
  Users, 
  Save, 
  RefreshCw, 
  TrendingUp, 
  Scissors,
  Upload,
  Download,
  Filter,
  Eye,
  EyeOff,
  ImageIcon
} from "lucide-react";

const API_BASE = "https://sree-apparels-ems.onrender.com/api/stitching";

function StitchingManagement() {
    const [date, setDate] = useState("");
    const [shift, setShift] = useState("");
    const [tailors, setTailors] = useState([]);
    const [counts, setCounts] = useState({});
    const [loading, setLoading] = useState(false);
    const [animateCards, setAnimateCards] = useState(false);

    // Load tailors present for date+shift
    const loadTailors = async () => {
        if (!date || !shift) {
            alert("Please select both date and shift");
            return;
        }
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/tailors`, {
                params: { date, shift },
            });
            setTailors(res.data);
            setAnimateCards(true);
            setTimeout(() => setAnimateCards(false), 800);
            
            // Pre-fill counts if already exist
            const prefilled = {};
            res.data.forEach((t) => {
                if (t.stitchedCount) {
                    prefilled[t._id] = t.stitchedCount;
                }
            });
            setCounts(prefilled);
        } catch (err) {
            console.error(err);
            alert("Error loading staff");
        } finally {
            setLoading(false);
        }
    };

    // Input change handler
    const handleCountChange = (id, value) => {
        setCounts((prev) => ({ ...prev, [id]: value }));
    };

    // Save stitched count for one tailor
    const saveCount = async (tailorId, isUpdate = false) => {
        try {
            await axios.post(`${API_BASE}`, {
                date,
                shift,
                tailorId,
                stitchedCount: counts[tailorId] || 0,
                isUpdate,
            });
            alert(isUpdate ? "Stitched count updated!" : "Stitched count saved!");
        } catch (err) {
            console.error(err);
            alert("Error saving count");
        }
    };

    // Bulk save
    const bulkSave = async () => {
        setLoading(true);
        try {
            const payload = tailors.map((t) => ({
                tailorId: t._id,
                stitchedCount: counts[t._id] || 0,
            }));
            await axios.post(`${API_BASE}/bulk`, {
                date,
                shift,
                records: payload,
            });
            alert("All counts saved successfully!");
        } catch (err) {
            console.error(err);
            alert("Error in bulk save");
        } finally {
            setLoading(false);
        }
    };

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
                <div className="max-w-7xl mx-auto mb-8 text-center">
                    <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                        Professional production tracking system for tailoring operations
                    </p>
                </div>

                {/* Control Panel */}
                <div className="max-w-7xl mx-auto mb-8">
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 hover:shadow-indigo-500/20 transition-all duration-500">
                        <div className="flex flex-wrap items-end justify-center gap-8">
                            {/* Date Input */}
                            <div className="group">
                                <label className="flex items-center gap-2 text-slate-700 font-semibold mb-3 text-lg">
                                    <Calendar className="w-5 h-5 text-indigo-600" />
                                    Production Date
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="bg-white/50 backdrop-blur border-2 border-slate-300 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-300 w-48 group-hover:border-slate-400"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                </div>
                            </div>

                            {/* Shift Select */}
                            <div className="group">
                                <label className="flex items-center gap-2 text-slate-700 font-semibold mb-3 text-lg">
                                    <Clock className="w-5 h-5 text-indigo-600" />
                                    Work Shift
                                </label>
                                <div className="relative">
                                    <select
                                        value={shift}
                                        onChange={(e) => setShift(e.target.value)}
                                        className="bg-white/50 backdrop-blur border-2 border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-300 w-48 group-hover:border-slate-400 appearance-none cursor-pointer"
                                    >
                                        <option value="" className="bg-white">Select Shift</option>
                                        <option value="Morning" className="bg-white">🌅 Morning</option>
                                        <option value="Afternoon" className="bg-white">☀️ Afternoon</option>
                                        <option value="Evening" className="bg-white">🌆 Evening</option>
                                    </select>
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                </div>
                            </div>

                            {/* Load Button */}
                            <button
                                onClick={loadTailors}
                                disabled={loading}
                                className="group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white px-8 py-4 rounded-xl font-bold shadow-2xl shadow-indigo-500/40 transition-all duration-300 transform hover:scale-105 hover:shadow-indigo-500/60 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="flex items-center gap-3">
                                    {loading ? (
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Users className="w-5 h-5" />
                                    )}
                                    <span>{loading ? "Loading..." : "Load Staff"}</span>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Staff Cards */}
                {tailors.length > 0 && (
                    <div className="max-w-7xl mx-auto space-y-6">
                        <div className="flex items-center gap-3 justify-center text-slate-700 mb-6">
                            <TrendingUp className="w-6 h-6 text-green-500" />
                            <span className="text-xl font-semibold">Production Team ({tailors.length} Staff)</span>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {tailors.map((tailor, index) => (
                                <div
                                    key={tailor._id}
                                    className={`bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:bg-white/90 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-2 group ${
                                        animateCards ? 'animate-bounce' : ''
                                    }`}
                                    style={{
                                        animationDelay: animateCards ? `${index * 100}ms` : '0ms'
                                    }}
                                >
                                    {/* Staff Profile */}
                                    <div className="flex items-center gap-4 mb-6">
                                        {tailor.imageUrl ? (
                                            <div className="relative">
                                                <img
                                                    src={tailor.imageUrl}
                                                    alt={tailor.name}
                                                    className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-400/50 shadow-lg"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-2xl"></div>
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                                {tailor.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="text-slate-800 font-bold text-lg">{tailor.name}</h3>
                                            <p className="text-slate-600 text-sm">Tailor Specialist</p>
                                        </div>
                                    </div>

                                    {/* Count Input */}
                                    <div className="space-y-4">
                                        <label className="block text-slate-700 font-semibold">
                                            Stitched Count
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                value={counts[tailor._id] || ""}
                                                onChange={(e) => handleCountChange(tailor._id, e.target.value)}
                                                className="w-full bg-white/50 backdrop-blur border-2 border-slate-300 rounded-xl px-4 py-3 text-slate-800 text-center text-xl font-bold focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-300"
                                                placeholder="0"
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                                                pcs
                                            </div>
                                        </div>

                                        {/* Update Button */}
                                        <button
                                            onClick={() => saveCount(tailor._id, true)}
                                            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-green-500/30 transition-all duration-300 transform hover:scale-105 group-hover:shadow-green-500/50"
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <RefreshCw className="w-4 h-4" />
                                                Update Count
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Bulk Save Button */}
                        <div className="flex justify-center mt-12">
                            <button
                                onClick={bulkSave}
                                disabled={loading}
                                className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 via-green-600 to-teal-500 hover:from-emerald-600 hover:via-green-700 hover:to-teal-600 text-white px-12 py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-green-500/40 transition-all duration-300 transform hover:scale-105 hover:shadow-green-500/60 disabled:opacity-50"
                            >
                                <div className="flex items-center gap-3">
                                    {loading ? (
                                        <RefreshCw className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <Save className="w-6 h-6" />
                                    )}
                                    <span>{loading ? "Saving..." : "Save All Records"}</span>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </button>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {tailors.length === 0 && !loading && (
                    <div className="max-w-7xl mx-auto text-center py-20 animate-fade-in">
                        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-8">
                            <Scissors className="w-16 h-16 text-indigo-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-700 mb-4">
                            Ready to Track Production
                        </h3>
                        <p className="text-slate-600 text-lg max-w-md mx-auto">
                            Select a date and shift to load your tailoring staff and begin tracking daily production counts.
                        </p>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.8s ease-out forwards;
                }
            `}</style>
        </div>
    );
}

export default StitchingManagement;