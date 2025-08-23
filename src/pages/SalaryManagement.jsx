import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://sree-apparels-ems.onrender.com/api/salary/summary";
// Default to current YYYY-MM
const now = new Date();
const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

export default function SalaryManagement() {
  const [month, setMonth] = useState(defaultMonth);
  const [ratePerPiece, setRatePerPiece] = useState();   // set actual values as needed
  const [ratePerShift, setRatePerShift] = useState();   // set actual values as needed
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API, {
        params: { month, ratePerPiece, ratePerShift }
      });
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSummary(); }, []); // initial

  const onApply = () => fetchSummary();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Salary Management</h1>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-end bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Month</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border rounded p-2"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Rate per Piece (Tailor)</label>
          <input
            type="number"
            value={ratePerPiece}
            onChange={(e) => setRatePerPiece(Number(e.target.value))}
            className="border rounded p-2 w-40"
            placeholder="₹"
            min="0"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Rate per Shift (Helper)</label>
          <input
            type="number"
            value={ratePerShift}
            onChange={(e) => setRatePerShift(Number(e.target.value))}
            className="border rounded p-2 w-40"
            placeholder="₹"
            min="0"
          />
        </div>
        <button
          onClick={onApply}
          className="px-4 py-2 rounded bg-blue-600 text-white font-semibold"
          disabled={loading}
        >
          {loading ? "Loading..." : "Apply"}
        </button>
      </div>

      {data && (
        <>
          {/* Tailors */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold">👔 Tailors</h2>
              <div className="text-sm text-gray-600">
                Period: {data.period.start} → {data.period.end}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.tailors.map(t => (
                <div key={t._id} className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
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
                  <div className="flex-1">
                    <div className="font-bold">{t.name}</div>
                    <div className="text-gray-600 text-sm">Pieces stitched: <b>{t.totalPieces}</b></div>
                    <div className="text-green-700 font-semibold">Salary: ₹{t.salary}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Helpers */}
          <section>
            <h2 className="text-xl font-semibold mb-3">🛠 Helpers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.helpers.map(h => (
                <div key={h._id} className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
                   {h.imageUrl ? (
                          <img
                              src={h.imageUrl}
                              alt={h.name}
                              className="w-10 h-10 rounded-full object-cover border border-indigo-300"
                          />
                      ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                              {h.name.charAt(0).toUpperCase()}
                          </div>
                      )}
                  <div className="flex-1">
                    <div className="font-bold">{h.name}</div>
                    <div className="text-gray-600 text-sm">Shifts present: <b>{h.presentShifts}</b></div>
                    <div className="text-green-700 font-semibold">Salary: ₹{h.salary}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Totals */}
          <section className="bg-white rounded-xl shadow p-4">
            <div className="font-semibold">Summary</div>
            <div className="text-sm text-gray-700">
              Total pieces: <b>{data.totals.pieces}</b> &nbsp;|&nbsp; Total shifts: <b>{data.totals.shifts}</b> &nbsp;|&nbsp; Total payout: <b>₹{data.totals.payout}</b>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
