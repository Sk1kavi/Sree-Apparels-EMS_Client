// StaffManagement.jsx
import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "https://sree-apparels-ems.onrender.com/api/staff";

export default function StaffManagement() {
    const [staff, setStaff] = useState([]);
    const [role, setRole] = useState("");
    const [view, setView] = useState("list"); 
    const [currentStaff, setCurrentStaff] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        role: "Tailor",
        bankAccount: "",
        address: "",
        imageUrl: ""
    });
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        if (view === "list") fetchStaff();
    }, [role, view]);

    const fetchStaff = async () => {
        try {
            const url = role ? `${BASE_URL}?role=${role}` : BASE_URL;
            const res = await axios.get(url);
            setStaff(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this staff?")) return;
        try {
            await axios.delete(`${BASE_URL}/${id}`);
            setView("list");
            fetchStaff();
        } catch (err) {
            console.error(err);
        }
    };

    const uploadImage = async () => {
        if (!imageFile) return "";
        const formData = new FormData();
        formData.append("image", imageFile);
        try {
            const res = await axios.post(`${BASE_URL}/upload`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data.imageUrl;
        } catch (err) {
            console.error(err);
            return "";
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let imageUrl = formData.imageUrl;

        if (imageFile) {
            imageUrl = await uploadImage();
        }

        const payload = { ...formData, imageUrl };

        try {
            if (view === "add") {
                await axios.post(BASE_URL, payload);
            } else if (view === "edit" && currentStaff) {
                await axios.put(`${BASE_URL}/${currentStaff._id}`, payload);
            }
            setView("list");
            setFormData({ name: "", phone: "", role: "Tailor", bankAccount: "", address: "", imageUrl: "" });
            setImageFile(null);
        } catch (err) {
            console.error(err);
        }
    };

    const startEdit = (staff) => {
        setCurrentStaff(staff);
        setFormData(staff);
        setView("edit");
    };

    const viewDetails = async (id) => {
        try {
            const res = await axios.get(`${BASE_URL}/${id}`);
            setCurrentStaff(res.data);
            setView("details");
        } catch (err) {
            console.error(err);
        }
    };

    // Avatar component (Image or First Letter)
    const Avatar = ({ imageUrl, name, size = "w-24 h-24", textSize = "text-2xl" }) => {
        if (imageUrl) {
            return (
                <img
                    src={imageUrl}
                    alt={name}
                    className={`${size} rounded-full object-cover border-4 border-indigo-200`}
                />
            );
        }
        return (
            <div
                className={`${size} rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold ${textSize} border-4 border-indigo-200`}
            >
                {name?.charAt(0).toUpperCase()}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-8">
            <div className="max-w-7xl mx-auto">
                {view === "list" && (
                    <>
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
                            <button
                                onClick={() => setView("add")}
                                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold rounded-lg shadow hover:scale-105 transition"
                            >
                                + Add Staff
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {staff.map((s) => (
                                <div
                                    key={s._id}
                                    onClick={() => viewDetails(s._id)}
                                    className="bg-white border border-indigo-100 shadow-lg rounded-xl p-6 flex flex-col items-center hover:shadow-xl transition cursor-pointer"
                                >
                                    <Avatar imageUrl={s.imageUrl} name={s.name} />
                                    <h2 className="text-xl font-bold text-indigo-700 mb-1 mt-4">{s.name}</h2>
                                    <p className="text-sm text-indigo-500 font-medium mb-2">{s.role}</p>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {(view === "add" || view === "edit") && (
                    <form onSubmit={handleSubmit} className="bg-white border border-indigo-100 shadow-xl rounded-2xl p-8 max-w-lg mx-auto mt-12">
                        <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">
                            {view === "add" ? "Add Staff" : "Edit Staff"}
                        </h2>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="border border-indigo-300 p-3 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 transition"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="border border-indigo-300 p-3 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 transition"
                            />
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="border border-indigo-300 p-3 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 transition"
                            >
                                <option value="Tailor">Tailor</option>
                                <option value="Helper">Helper</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Bank Account"
                                value={formData.bankAccount}
                                onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                                className="border border-indigo-300 p-3 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 transition"
                            />
                            <input
                                type="text"
                                placeholder="Address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="border border-indigo-300 p-3 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 transition"
                            />
                            <input
                                type="file"
                                onChange={(e) => setImageFile(e.target.files[0])}
                                className="border border-indigo-300 p-3 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 transition"
                            />
                        </div>
                        <div className="flex justify-between mt-8">
                            <button type="submit" className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold rounded-lg shadow hover:scale-105 transition">
                                {view === "add" ? "Add Staff" : "Update Staff"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setView("list")}
                                className="px-6 py-2 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded-lg shadow transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                {view === "details" && currentStaff && (
                    <div className="bg-white border border-indigo-100 shadow-xl rounded-2xl p-8 max-w-lg mx-auto mt-12 text-center">
                        <div className="flex justify-center mb-6">
                            <Avatar imageUrl={currentStaff.imageUrl} name={currentStaff.name} size="w-28 h-28" textSize="text-3xl" />
                        </div>
                        <h2 className="text-2xl font-bold text-indigo-700 mb-2">{currentStaff.name}</h2>
                        <p className="text-indigo-500 font-medium mb-4">{currentStaff.role}</p>
                        <div className="space-y-2 text-gray-700 text-lg text-left">
                            <p>📞 <span className="font-semibold">{currentStaff.phone}</span></p>
                            <p>🏠 <span className="font-semibold">{currentStaff.address}</span></p>
                            <p>🏦 <span className="font-semibold">{currentStaff.bankAccount}</span></p>
                        </div>
                        <div className="flex justify-center gap-4 mt-8">
                            <button
                                onClick={() => startEdit(currentStaff)}
                                className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-lg shadow transition"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(currentStaff._id)}
                                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow transition"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setView("list")}
                                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg shadow transition"
                            >
                                Back
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
