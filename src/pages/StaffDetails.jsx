// StaffDetails.jsx
import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "https://sree-apparels-ems.onrender.com/api/staff";

export default function StaffDetails({ staffId, goBack }) {
    const [staff, setStaff] = useState(null);

    useEffect(() => {
        fetchStaffDetails();
    }, [staffId]);

    const fetchStaffDetails = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/${staffId}`);
            setStaff(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    if (!staff) return <div className="text-center mt-12">Loading...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-8 flex flex-col items-center gap-12">
            {/* === Staff Info Section === */}
            <div className="bg-white border border-indigo-100 shadow-xl rounded-2xl p-8 max-w-lg w-full text-center">
                <div className="flex justify-center mb-6">
                    {staff.imageUrl ? (
                        <img
                            src={staff.imageUrl}
                            alt={staff.name}
                            className="w-28 h-28 rounded-full object-cover border-4 border-indigo-200"
                        />
                    ) : (
                        <div className="w-28 h-28 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-3xl border-4 border-indigo-200">
                            {staff.name?.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <h2 className="text-2xl font-bold text-indigo-700 mb-2">{staff.name}</h2>
                <p className="text-indigo-500 font-medium mb-4">{staff.role}</p>
                <div className="space-y-2 text-gray-700 text-lg text-left">
                    <p>📞 <span className="font-semibold">{staff.phone}</span></p>
                    <p>🏠 <span className="font-semibold">{staff.address}</span></p>
                    <p>🏦 <span className="font-semibold">{staff.bankAccount}</span></p>
                </div>
                <button
                    onClick={goBack}
                    className="mt-8 px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg shadow transition"
                >
                    Back
                </button>
            </div>

            {/* === Analysis / Chart Section === */}
            <div className="bg-white border border-indigo-100 shadow-xl rounded-2xl p-8 max-w-4xl w-full">
                <h3 className="text-xl font-bold text-indigo-700 mb-4 text-center">
                    Performance & Attendance Analysis
                </h3>
                <div className="h-64 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-400 font-semibold">
                    Chart will appear here
                </div>
            </div>
        </div>
    );
}
