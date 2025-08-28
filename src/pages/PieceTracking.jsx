import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_BASE = "http://localhost:5000/api/pieces";

export default function PieceTracking() {
  const [trunks, setTrunks] = useState([]);
  const [filters, setFilters] = useState({
    isDispatched: "All",
    paymentStatus: "All",
  });
  const [newTrunk, setNewTrunk] = useState({
    trunkNumber: "",
    quantity: "",
    expectedPayment: "",
  });

  // Fetch trunks with filters
  const fetchTrunks = async () => {
    try {
      const params = {};
      if (filters.isDispatched !== "All")
        params.isDispatched = filters.isDispatched === "Dispatched";
      if (filters.paymentStatus !== "All")
        params.paymentStatus = filters.paymentStatus.toLowerCase();

      const res = await axios.get(API_BASE, { params });
      setTrunks(res.data);
    } catch (err) {
      console.error("Error fetching trunks:", err);
    }
  };

  useEffect(() => {
    fetchTrunks();
    // eslint-disable-next-line
  }, []);

  // Add new trunk
  const handleAddTrunk = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        trunkNumber: newTrunk.trunkNumber,
        itemType: "Trunk Pieces",
        quantity: Number(newTrunk.quantity),
        expectedPayment: Number(newTrunk.expectedPayment),
      };
      await axios.post(`${API_BASE}/receive`, payload);
      setNewTrunk({ trunkNumber: "", quantity: "", expectedPayment: "" });
      fetchTrunks();
    } catch (err) {
      console.error("Error adding trunk:", err);
    }
  };

  // Dispatch trunk
  const handleDispatch = async (id) => {
    try {
      await axios.post(`${API_BASE}/dispatch/${id}`);
      fetchTrunks();
    } catch (err) {
      console.error("Error dispatching trunk:", err);
    }
  };

  // Update Payment
  const handlePaymentUpdate = async (id) => {
    const paymentAmount = prompt("Enter payment amount:");
    if (!paymentAmount) return;
    try {
      await axios.put(`${API_BASE}/payment/${id}`, {
        paymentAmount: Number(paymentAmount),
      });
      fetchTrunks();
    } catch (err) {
      console.error("Error updating payment:", err);
    }
  };

  // Generate PDF Bill
  const handleGenerateBill = async (id) => {
    try {
      const res = await axios.get(`${API_BASE}/${id}`);
      const trunk = res.data;
      const doc = new jsPDF();

      // Header
      doc.setFontSize(18);
      doc.text("SREE APPARELS", 105, 20, { align: "center" });
      doc.setFontSize(12);
      doc.text("Official Invoice", 105, 28, { align: "center" });
      doc.line(20, 32, 190, 32);

      // Vendor Info
      doc.setFontSize(11);
      doc.text(`Vendor: ${trunk.vendor}`, 20, 45);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 45);

      // Trunk Details Table
      doc.setFontSize(12);
      doc.text("Bundle Details:", 20, 60);
      autoTable(doc, {
        startY: 65,
        head: [
          [
            "Bundle No",
            "Item Type",
            "Quantity",
            "Expected Payment",
            "Total Paid",
            "Received Date",
            "Dispatched Date",
          ],
        ],
        body: [
          [
            trunk.trunkNumber,
            trunk.itemType,
            trunk.quantity,
            `₹${trunk.expectedPayment}`,
            `₹${trunk.totalPaid || 0}`,
            new Date(trunk.receivedDate).toLocaleDateString(),
            trunk.dispatchedDate
              ? new Date(trunk.dispatchedDate).toLocaleDateString()
              : "—",
          ],
        ],
        theme: "grid",
        styles: { halign: "center" },
      });

      // Partial Payments Table
      const startYPartial = doc.lastAutoTable.finalY + 10;
      doc.text("Partial Payments:", 20, startYPartial);

      const paymentBody = trunk.payments.map((p) => [
        new Date(p.date).toLocaleDateString(),
        `₹${p.amount}`,
      ]);

      if (paymentBody.length === 0) {
        doc.text("No payments received yet.", 20, startYPartial + 10);
      } else {
        autoTable(doc, {
          startY: startYPartial + 5,
          head: [["Payment Date", "Amount"]],
          body: paymentBody,
          theme: "grid",
          styles: { halign: "center" },
        });
      }

      // Footer
      const finalY =
        (paymentBody.length > 0 ? doc.lastAutoTable.finalY : startYPartial + 20) +
        10;
      doc.setFontSize(12);
      const pending = trunk.expectedPayment - (trunk.totalPaid || 0);
      if (pending <= 0) {
        doc.setTextColor(0, 128, 0);
        doc.text("✅ Payment Completed. Thank you!", 20, finalY);
      } else {
        doc.setTextColor(200, 0, 0);
        doc.text(`⚠ Pending Amount: ₹${pending}`, 20, finalY);
      }
      doc.setTextColor(0, 0, 0);
      doc.text("Authorized Signature: ____________________", 20, finalY + 30);

      doc.save(`Bill_${trunk.trunkNumber}.pdf`);
    } catch (err) {
      console.error("Error generating bill:", err);
    }
  };

  // Row coloring
  const getRowColor = (trunk) => {
    if (trunk.totalPaid >= trunk.expectedPayment && trunk.isDispatched)
      return "bg-green-50";
    if (trunk.totalPaid > 0 && trunk.totalPaid < trunk.expectedPayment)
      return "bg-yellow-50";
    return "bg-red-50";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 p-8 w-full">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-2xl p-8">
        <h1 className="text-3xl font-extrabold mb-6 text-blue-700 text-center drop-shadow">
          Piece Tracking
        </h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-6 mb-8 justify-center items-end">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Dispatched Status:
            </label>
            <select
              value={filters.isDispatched}
              onChange={(e) =>
                setFilters({ ...filters, isDispatched: e.target.value })
              }
              className="border-2 border-blue-300 rounded-lg p-2 text-blue-700 font-semibold shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option>All</option>
              <option>Dispatched</option>
              <option>Not Dispatched</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Payment Status:
            </label>
            <select
              value={filters.paymentStatus}
              onChange={(e) =>
                setFilters({ ...filters, paymentStatus: e.target.value })
              }
              className="border-2 border-pink-300 rounded-lg p-2 text-pink-700 font-semibold shadow focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              <option>All</option>
              <option>Completed</option>
              <option>Partial</option>
              <option>Pending</option>
            </select>
          </div>

          <button
            onClick={fetchTrunks}
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow hover:scale-105 transition-transform"
          >
            🔍 Search
          </button>
        </div>

        {/* Trunks Table */}
        <div className="overflow-x-auto rounded-lg shadow-lg mb-10">
          <table className="w-full border-collapse text-center">
            <thead>
              <tr className="bg-gradient-to-r from-blue-100 via-pink-100 to-blue-50">
                <th className="border p-3 font-bold text-blue-700">Bundle No</th>
                <th className="border p-3 font-bold text-blue-700">Quantity</th>
                <th className="border p-3 font-bold text-blue-700">Received</th>
                <th className="border p-3 font-bold text-blue-700">Dispatched</th>
                <th className="border p-3 font-bold text-blue-700">Total Amount</th>
                <th className="border p-3 font-bold text-blue-700">Received Yet</th>
                <th className="border p-3 font-bold text-blue-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trunks.map((trunk) => (
                <tr
                  key={trunk._id}
                  className={`${getRowColor(trunk)} hover:bg-blue-50 transition`}
                >
                  <td className="border p-3 font-semibold text-blue-900">
                    {trunk.trunkNumber}
                  </td>
                  <td className="border p-3">{trunk.quantity}</td>
                  <td className="border p-3">
                    {new Date(trunk.receivedDate).toLocaleDateString()}
                  </td>
                  <td className="border p-3 text-center text-xl">
                    {trunk.isDispatched ? "✅" : "❌"}
                  </td>
                  <td className="border p-3 text-pink-700 font-bold">
                    ₹{trunk.expectedPayment}
                  </td>
                  <td className="border p-3 text-green-700 font-bold">
                    ₹{trunk.totalPaid || 0}
                  </td>
                  <td className="border p-3 flex gap-2 justify-center flex-wrap">
                    <button
                      onClick={() => handleDispatch(trunk._id)}
                      disabled={trunk.isDispatched}
                      className={`px-4 py-1 rounded-lg font-bold shadow transition ${
                        trunk.isDispatched
                          ? "bg-gray-400 text-white cursor-not-allowed"
                          : "bg-gradient-to-r from-green-400 to-green-600 text-white hover:scale-105"
                      }`}
                    >
                      {trunk.isDispatched ? "Dispatched" : "Dispatch"}
                    </button>
                    <button
                      onClick={() => handlePaymentUpdate(trunk._id)}
                      className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-1 rounded-lg font-bold shadow hover:scale-105 transition"
                    >
                      💰 Payment
                    </button>
                    <button
                      onClick={() => handleGenerateBill(trunk._id)}
                      className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-4 py-1 rounded-lg font-bold shadow hover:scale-105 transition"
                    >
                      📄 Bill
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add New Trunk */}
        <h2 className="text-2xl font-bold mt-8 mb-4 text-pink-700 text-center">
          ➕ Add New Trunk
        </h2>
        <form
          onSubmit={handleAddTrunk}
          className="flex flex-wrap gap-4 bg-gradient-to-r from-blue-50 via-white to-pink-50 p-6 rounded-xl shadow-lg justify-center"
        >
          <input
            type="text"
            placeholder="Trunk Number"
            value={newTrunk.trunkNumber}
            onChange={(e) =>
              setNewTrunk({ ...newTrunk, trunkNumber: e.target.value })
            }
            className="border-2 border-blue-300 p-3 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="number"
            placeholder="Quantity"
            value={newTrunk.quantity}
            onChange={(e) =>
              setNewTrunk({ ...newTrunk, quantity: e.target.value })
            }
            className="border-2 border-pink-300 p-3 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-pink-400"
            required
          />
          <input
            type="number"
            placeholder="Expected Payment"
            value={newTrunk.expectedPayment}
            onChange={(e) =>
              setNewTrunk({ ...newTrunk, expectedPayment: e.target.value })
            }
            className="border-2 border-green-300 p-3 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-pink-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:scale-105 transition"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
}
