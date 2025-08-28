// StaffManagement.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import StaffDetails from "./StaffDetails";

const BASE_URL = "https://sree-apparels-ems.onrender.com/api/staff";

export default function StaffManagement() {
    const [staff, setStaff] = useState([]);
    const [role, setRole] = useState("");
    const [selectedStaff, setSelectedStaff] = useState(null); // when a staff is clicked

    useEffect(() => {
        fetchStaff();
    }, [role]);

    const fetchStaff = async () => {
        try {
            const url = role ? `${BASE_URL}?role=${role}` : BASE_URL;
            const res = await axios.get(url);
            setStaff(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    if (selectedStaff) {
        // Show StaffDetails when a staff is selected
        return <StaffDetails staffId={selectedStaff._id} goBack={() => setSelectedStaff(null)} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-extrabold text-indigo-800 mb-8 text-center tracking-tight">
                    Staff Management
                </h1>
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="border border-indigo-300 p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 transition"
                    >
                        <option value="">All</option>
                        <option value="Tailor">Tailor</option>
                        <option value="Helper">Helper</option>
                    </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {staff.map((s) => (
                        <div
                            key={s._id}
                            onClick={() => setSelectedStaff(s)}
                            className="bg-white border border-indigo-100 shadow-lg rounded-xl p-6 flex flex-col items-center hover:shadow-xl transition cursor-pointer"
                        >
                            {s.imageUrl ? (
                                <img src={s.imageUrl} alt={s.name} className="w-24 h-24 rounded-full object-cover border-4 border-indigo-200" />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-2xl border-4 border-indigo-200">
                                    {s.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <h2 className="text-xl font-bold text-indigo-700 mb-1 mt-4">{s.name}</h2>
                            <p className="text-sm text-indigo-500 font-medium mb-2">{s.role}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
