// StaffManagement.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import StaffDetails from "./StaffDetails";

const BASE_URL = "https://sree-apparels-ems.onrender.com/api/staff";

export default function StaffManagement() {
    const [staff, setStaff] = useState([]);
    const [role, setRole] = useState("");
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [view, setView] = useState("list"); // list | add
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

    const uploadImage = async () => {
        if (!imageFile) return "";
        const fd = new FormData();
        fd.append("image", imageFile);
        try {
            const res = await axios.post(`${BASE_URL}/upload`, fd, {
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
        if (imageFile) imageUrl = await uploadImage();
        const payload = { ...formData, imageUrl };

        try {
            await axios.post(BASE_URL, payload);
            setFormData({ name: "", phone: "", role: "Tailor", bankAccount: "", address: "", imageUrl: "" });
            setImageFile(null);
            setView("list");
        } catch (err) {
            console.error(err);
        }
    };

    if (selectedStaff) {
        return <StaffDetails staffId={selectedStaff._id} goBack={() => setSelectedStaff(null)} />;
    }

    if (view === "add") {
        return (
            <form onSubmit={handleSubmit} className="bg-white border border-indigo-100 shadow-xl rounded-2xl p-8 max-w-lg mx-auto mt-12">
                <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">Add Staff</h2>
                <div className="space-y-4">
                    <input type="text" placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="border p-3 w-full rounded-lg" required />
                    <input type="text" placeholder="Phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="border p-3 w-full rounded-lg" />
                    <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="border p-3 w-full rounded-lg">
                        <option value="Tailor">Tailor</option>
                        <option value="Helper">Helper</option>
                    </select>
                    <input type="text" placeholder="Bank Account" value={formData.bankAccount} onChange={e => setFormData({ ...formData, bankAccount: e.target.value })} className="border p-3 w-full rounded-lg" />
                    <input type="text" placeholder="Address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="border p-3 w-full rounded-lg" />
                    <input type="file" onChange={e => setImageFile(e.target.files[0])} className="border p-3 w-full rounded-lg" />
                </div>
                <div className="flex justify-between mt-8">
                    <button type="submit" className="px-6 py-2 bg-indigo-500 text-white rounded-lg shadow">Add Staff</button>
                    <button type="button" onClick={() => setView("list")} className="px-6 py-2 bg-gray-400 text-white rounded-lg">Cancel</button>
                </div>
            </form>
        );
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
                        className="border border-indigo-300 p-2 rounded-lg shadow-sm"
                    >
                        <option value="">All</option>
                        <option value="Tailor">Tailor</option>
                        <option value="Helper">Helper</option>
                    </select>
                    <button
                        onClick={() => setView("add")}
                        className="px-6 py-2 bg-indigo-500 text-white rounded-lg shadow"
                    >
                        + Add Staff
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {staff.map((s) => (
                        <div
                            key={s._id}
                            onClick={() => setSelectedStaff(s)}
                            className="bg-white border border-indigo-100 shadow-lg rounded-xl p-6 flex flex-col items-center hover:shadow-xl cursor-pointer"
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
