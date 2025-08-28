import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "https://sree-apparels-ems.onrender.com/api/pieces";

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
                itemType: "Trunk Pieces", // fixed default
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

    // Color coding
    const getRowColor = (trunk) => {
        if (trunk.paymentAmount >= trunk.expectedPayment && trunk.isDispatched)
            return "bg-gradient-to-r from-green-100 via-green-200 to-green-50";
        if (trunk.paymentAmount > 0 && trunk.paymentAmount < trunk.expectedPayment)
            return "bg-gradient-to-r from-yellow-100 via-yellow-200 to-yellow-50";
        return "bg-gradient-to-r from-red-100 via-red-200 to-red-50";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 p-8 w-full">
            <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-2xl p-8">
                <h1 className="text-3xl font-extrabold mb-6 text-blue-700 text-center drop-shadow">
                    Piece Tracking
                </h1>

                {/* Filters */}
                <div className="flex gap-6 mb-8 justify-center">
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

                    <button
                        onClick={fetchTrunks}
                        className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow hover:scale-105 transition-transform"
                    >
                        🔍 Search
                    </button>
                </div>

                {/* Trunk Table */}
                <div className="overflow-x-auto rounded-lg shadow-lg mb-10">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gradient-to-r from-blue-100 via-pink-100 to-blue-50">
                                <th className="border p-3 text-lg font-bold text-blue-700">Bundle No</th>
                                <th className="border p-3 text-lg font-bold text-blue-700">Item Type</th>
                                <th className="border p-3 text-lg font-bold text-blue-700">Quantity</th>
                                <th className="border p-3 text-lg font-bold text-blue-700">Received</th>
                                <th className="border p-3 text-lg font-bold text-blue-700">Dispatched</th>
                                <th className="border p-3 text-lg font-bold text-blue-700">Total Amount</th>
                                <th className="border p-3 text-lg font-bold text-blue-700">Received Yet</th>
                                <th className="border p-3 text-lg font-bold text-blue-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trunks.map((trunk) => (
                                <tr key={trunk._id} className={getRowColor(trunk) + " hover:bg-blue-50 transition"}>
                                    <td className="border p-3 font-semibold text-blue-900">{trunk.trunkNumber}</td>
                                    <td className="border p-3">{trunk.itemType}</td>
                                    <td className="border p-3">{trunk.quantity}</td>
                                    <td className="border p-3">
                                        {new Date(trunk.receivedDate).toLocaleDateString()}
                                    </td>
                                    <td className="border p-3 text-center text-xl">
                                        {trunk.isDispatched ? "✅" : "❌"}
                                    </td>
                                    <td className="border p-3 text-pink-700 font-bold">₹{trunk.expectedPayment}</td>
                                    <td className="border p-3 text-green-700 font-bold">₹{trunk.paymentAmount || 0}</td>
                                    <td className="border p-3 flex gap-2">
                                        <button
                                            onClick={() => handleDispatch(trunk._id)}
                                            disabled={trunk.isDispatched}
                                            className={`w-[150px] px-4 py-1 rounded-lg font-bold shadow transition ${
                                                trunk.isDispatched
                                                    ? "bg-gray-400 text-white cursor-not-allowed"
                                                    : "bg-gradient-to-r from-green-400 to-green-600 text-white hover:scale-105"
                                            }`}
                                        >
                                            {trunk.isDispatched ? "Dispatched" : " Dispatch "}
                                        </button>
                                        <button
                                            onClick={() => handlePaymentUpdate(trunk._id)}
                                            className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-1 rounded-lg font-bold shadow hover:scale-105 transition"
                                        >
                                            💰 Payment
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
                    className="flex gap-4 flex-wrap bg-gradient-to-r from-blue-50 via-white to-pink-50 p-6 rounded-xl shadow-lg justify-center"
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
