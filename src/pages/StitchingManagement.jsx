import { useState } from "react";
import axios from "axios";

const API_BASE = "https://sree-apparels-ems.onrender.com/api/stitching";

function StitchingManagement() {
    const [date, setDate] = useState("");
    const [shift, setShift] = useState("");
    const [tailors, setTailors] = useState([]);
    const [counts, setCounts] = useState({});

    // Load tailors present for date+shift
    const loadTailors = async () => {
        if (!date || !shift) {
            alert("Please select both date and shift");
            return;
        }
        try {
            const res = await axios.get(`${API_BASE}/tailors`, {
                params: { date, shift },
            });
            setTailors(res.data);
            console.log("Loaded tailors:", res.data);
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
                isUpdate, // let backend know if it's an update
            });
            alert(isUpdate ? "Stitched count updated!" : "Stitched count saved!");
        } catch (err) {
            console.error(err);
            alert("Error saving count");
        }
    };

    // Bulk save
    const bulkSave = async () => {
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
        }
    };

    return (
        <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-8">
                <h2 className="text-3xl font-extrabold text-indigo-700 text-center mb-4 drop-shadow">
                    Stitching Management
                </h2>

                {/* Filters */}
                <div className="flex flex-wrap items-end gap-6 justify-center bg-indigo-50 rounded-xl p-6 shadow-inner">
                    <div>
                        <label className="block text-base font-semibold mb-2 text-indigo-700">
                            Select Date:
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="border-2 border-indigo-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition w-40"
                        />
                    </div>

                    <div>
                        <label className="block text-base font-semibold mb-2 text-indigo-700">
                            Select Shift:
                        </label>
                        <select
                            value={shift}
                            onChange={(e) => setShift(e.target.value)}
                            className="border-2 border-indigo-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition w-40"
                        >
                            <option value="">Select Shift</option>
                            <option value="Morning">Morning</option>
                            <option value="Afternoon">Afternoon</option>
                            <option value="Evening">Evening</option>
                        </select>
                    </div>

                    <button
                        onClick={loadTailors}
                        className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white px-6 py-2 rounded-xl shadow-lg font-semibold transition transform hover:scale-105"
                    >
                        Load Staff
                    </button>
                </div>

                {/* Tailor Table */}
                {tailors.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full border border-indigo-200 rounded-xl overflow-hidden shadow-lg">
                            <thead className="bg-indigo-100">
                                <tr>
                                    <th className="p-3 border-b border-indigo-200 text-indigo-700 font-bold text-lg text-left">Tailor</th>
                                    <th className="p-3 border-b border-indigo-200 text-indigo-700 font-bold text-lg text-center">Stitched Count</th>
                                    <th className="p-3 border-b border-indigo-200 text-indigo-700 font-bold text-lg text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tailors.map((t) => (
                                    <tr key={t._id} className="odd:bg-white even:bg-indigo-50 hover:bg-indigo-100 transition">
                                        <td className="p-3 border-b border-indigo-100 font-medium text-gray-800 flex items-center gap-3">
                                            {t.imageUrl ? (
                                                <img
                                                    src={t.imageUrl}
                                                    alt={t.name}
                                                    className="w-10 h-10 rounded-full object-cover border border-indigo-300"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                                                    {t.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            {t.name}
                                        </td>
                                        <td className="p-3 border-b border-indigo-100 text-center">
                                            <input
                                                type="number"
                                                min="0"
                                                value={counts[t._id] || ""}
                                                onChange={(e) => handleCountChange(t._id, e.target.value)}
                                                className="border-2 border-indigo-300 rounded-lg p-1 w-24 text-center focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                                            />
                                        </td>
                                        <td className="p-3 border-b border-indigo-100 text-center space-x-2">
                                            <button
                                                onClick={() => saveCount(t._id, true)}
                                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg shadow text-sm font-semibold"
                                            >
                                                Update
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Bulk Save Button */}
                {tailors.length > 0 && (
                    <div className="text-center mt-6">
                        <button
                            onClick={bulkSave}
                            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl shadow-lg font-bold transition transform hover:scale-105"
                        >
                            Save
                        </button>
                    </div>
                )}

                {tailors.length === 0 && (
                    <p className="text-gray-500 text-center text-lg mt-8">
                        No tailors loaded yet.
                    </p>
                )}
            </div>
        </div>
    );
}

export default StitchingManagement;
