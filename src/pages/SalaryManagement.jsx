import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://sree-apparels-ems.onrender.com/api/salary";
const now = new Date();
const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

export default function SalaryManagement() {
  const [month, setMonth] = useState(defaultMonth);
  const [ratePerPiece, setRatePerPiece] = useState();
  const [ratePerShift, setRatePerShift] = useState();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/summary`, {
        params: { month, ratePerPiece, ratePerShift }
      });
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSummary(); }, []);

  const onApply = () => fetchSummary();

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 space-y-8">
      <h1 className="text-3xl font-extrabold text-indigo-700 drop-shadow mb-2">Salary Management</h1>

      {/* Controls */}
      <div className="flex flex-wrap gap-6 items-end bg-white p-6 rounded-2xl shadow-lg border border-indigo-100">
        <div className="flex flex-col">
          <label className="text-sm text-indigo-600 font-semibold mb-1">Month</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border-2 border-indigo-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-indigo-600 font-semibold mb-1">Rate per Piece (Tailor)</label>
          <input
            type="number"
            value={ratePerPiece}
            onChange={(e) => setRatePerPiece(Number(e.target.value))}
            className="border-2 border-indigo-200 rounded-lg p-2 w-40 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            placeholder="₹"
            min="0"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-indigo-600 font-semibold mb-1">Rate per Shift (Helper)</label>
          <input
            type="number"
            value={ratePerShift}
            onChange={(e) => setRatePerShift(Number(e.target.value))}
            className="border-2 border-indigo-200 rounded-lg p-2 w-40 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            placeholder="₹"
            min="0"
          />
        </div>
        <button
          onClick={onApply}
          className={`px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold shadow hover:scale-105 transition disabled:opacity-60`}
          disabled={loading}
        >
          {loading ? "Loading..." : "Apply"}
        </button>
        <button
          onClick={async () => {
            if (!data) return alert("Apply first to calculate salary.");
            try {
              await axios.post(`${API}/finalize`, {
                month,
                tailors: data.tailors,
                helpers: data.helpers,
                totals: data.totals,
                rates: data.rates,
              });
              alert("Salaries finalized and saved!");
            } catch (err) {
              console.error(err);
              alert(err.response?.data?.error || "Error finalizing salary");
            }
          }}
          className="px-6 py-2 rounded-xl bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold shadow hover:scale-105 transition disabled:opacity-60"
          disabled={!data}
        >
          Finalize
        </button>
      </div>

      {data && (
        <>
          {/* Tailors */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-indigo-700 flex items-center gap-2">
                <span className="text-3xl">👔</span> Tailors
              </h2>
              <div className="text-sm text-gray-500 bg-indigo-50 px-3 py-1 rounded-full shadow">
                Period: <span className="font-semibold">{data.period.start}</span> → <span className="font-semibold">{data.period.end}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.tailors.map(t => (
                <div key={t._id} className="bg-white rounded-2xl shadow-lg p-5 flex items-center gap-5 border border-indigo-100 hover:shadow-xl transition">
                  {t.imageUrl ? (
                    <img
                      src={t.imageUrl}
                      alt={t.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-indigo-300 shadow"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-extrabold text-xl shadow">
                      {t.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-bold text-lg text-indigo-800">{t.name}</div>
                    <div className="text-gray-600 text-sm">Pieces stitched: <b>{t.totalPieces}</b></div>
                    <div className="text-green-700 font-semibold text-lg mt-1">Salary: ₹{t.salary}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Helpers */}
          <section className="mt-8">
            <h2 className="text-2xl font-bold text-purple-700 mb-4 flex items-center gap-2">
              <span className="text-3xl">🛠</span> Helpers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.helpers.map(h => (
                <div key={h._id} className="bg-white rounded-2xl shadow-lg p-5 flex items-center gap-5 border border-purple-100 hover:shadow-xl transition">
                  {h.imageUrl ? (
                    <img
                      src={h.imageUrl}
                      alt={h.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-purple-300 shadow"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-extrabold text-xl shadow">
                      {h.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-bold text-lg text-purple-800">{h.name}</div>
                    <div className="text-gray-600 text-sm">Shifts present: <b>{h.presentShifts}</b></div>
                    <div className="text-green-700 font-semibold text-lg mt-1">Salary: ₹{h.salary}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Totals */}
          <section className="bg-white rounded-2xl shadow-lg p-6 mt-8 border border-indigo-100">
            <div className="font-bold text-lg text-indigo-700 mb-2">Summary</div>
            <div className="text-md text-gray-700 flex flex-wrap gap-4">
              <span className="bg-indigo-50 px-3 py-1 rounded-full">Total pieces: <b>{data.totals.pieces}</b></span>
              <span className="bg-purple-50 px-3 py-1 rounded-full">Total shifts: <b>{data.totals.shifts}</b></span>
              <span className="bg-green-50 px-3 py-1 rounded-full">Total payout: <b>₹{data.totals.payout}</b></span>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
