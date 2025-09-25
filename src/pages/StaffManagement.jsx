// StaffManagement.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import {
  User, Plus, Filter, Search, MapPin, Phone, Briefcase, ImageIcon, Upload, X, ArrowLeft, Users
} from "lucide-react";
import StaffDetails from "./StaffDetails";

const BASE_URL = "https://sree-apparels-ems.onrender.com/api/staff";

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [role, setRole] = useState("");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffSearchTerm, setStaffSearchTerm] = useState("");
  const [view, setView] = useState("list"); // list | add
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    role: "Tailor",
    state: "",
    district: "",
    city: "",
    pincode: "",
    imageUrl: ""
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch staff
  useEffect(() => {
    if (view === "list") fetchStaff();
  }, [role, view]);

 useEffect(() => {
  let filtered = staff;

  // Apply role filter
  if (role) {
    filtered = filtered.filter(s => s.role === role);
  }

  // Apply search filter (by name, case-insensitive)
  if (staffSearchTerm) {
    filtered = filtered.filter(s =>
      s.name.toLowerCase().includes(staffSearchTerm.toLowerCase())
    );
  }

  setFilteredStaff(filtered);
}, [staff, role, staffSearchTerm]);


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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    } else setImagePreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    let imageUrl = formData.imageUrl;
    if (imageFile) imageUrl = await uploadImage();

    const payload = {
      name: formData.name,
      phone: formData.phone,
      role: formData.role,
      address: {
        state: formData.state,
        district: formData.district,
        city: formData.city,
        pincode: formData.pincode,
      },
      imageUrl,
    };

    try {
      await axios.post(BASE_URL, payload);
      setFormData({
        name: "",
        phone: "",
        role: "Tailor",
        state: "",
        district: "",
        city: "",
        pincode: "",
        imageUrl: "",
      });
      setImageFile(null);
      setImagePreview("");
      setView("list");
    } catch (err) {
      console.error("Add Staff error:", err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Selected staff view
  if (selectedStaff) {
    return <StaffDetails staffId={selectedStaff._id} goBack={() => setSelectedStaff(null)} />;
  }

  // Add staff form view
  if (view === "add") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 relative overflow-hidden">
        {/* Watermark */}
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none opacity-5 select-none">
          <div className="text-8xl font-bold text-slate-600 transform rotate-45">SREE APPARELS</div>
        </div>

        <div className="max-w-2xl mx-auto relative z-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-in slide-in-from-right-4 duration-500">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-8 text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-xl"><Plus className="w-6 h-6" /></div>
                <h2 className="text-3xl font-bold">Add New Staff</h2>
              </div>
              <p className="opacity-90">Create a new staff member profile</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Profile image */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-200 shadow-lg bg-gradient-to-br from-indigo-100 to-purple-100">
                    {imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" /> :
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-indigo-400" />
                      </div>
                    }
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Upload className="w-6 h-6 text-white" />
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
                <p className="text-sm text-slate-500 mt-2">Click to upload profile image</p>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700"><User className="w-4 h-4"/> Full Name *</label>
                  <input type="text" placeholder="Enter full name" value={formData.name} onChange={(e)=>setFormData({...formData, name:e.target.value})} required
                         className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"/>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Phone className="w-4 h-4"/> Phone Number *</label>
                  <input type="tel" placeholder="10-digit phone" value={formData.phone} onChange={(e)=>setFormData({...formData, phone:e.target.value})} pattern="[0-9]{10}" required
                         className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"/>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Briefcase className="w-4 h-4"/> Role</label>
                  <select value={formData.role} onChange={(e)=>setFormData({...formData, role:e.target.value})}
                          className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm">
                    <option value="Tailor">Tailor</option>
                    <option value="Helper">Helper</option>
                  </select>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700"><MapPin className="w-4 h-4"/> Address *</label>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="State" value={formData.state} onChange={(e)=>setFormData({...formData,state:e.target.value})} required className="p-4 border rounded-xl"/>
                    <input type="text" placeholder="District" value={formData.district} onChange={(e)=>setFormData({...formData,district:e.target.value})} required className="p-4 border rounded-xl"/>
                    <input type="text" placeholder="City" value={formData.city} onChange={(e)=>setFormData({...formData,city:e.target.value})} required className="p-4 border rounded-xl"/>
                    <input type="text" placeholder="Pincode" value={formData.pincode} onChange={(e)=>setFormData({...formData,pincode:e.target.value})} required className="p-4 border rounded-xl"/>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-6 border-t border-slate-200">
                <button type="submit" disabled={isLoading} className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                  {isLoading ? "Adding Staff..." : <>
                    <Plus className="w-5 h-5"/> Add Staff
                  </>}
                </button>
                <button type="button" onClick={()=>setView("list")} className="flex-1 bg-slate-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:bg-slate-600">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 relative overflow-hidden">
      {/* Watermark */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none opacity-5 select-none">
        <div className="text-8xl font-bold text-slate-600 transform rotate-45">SREE APPARELS</div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Controls */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5"/>
                <input
                  type="text"
                  placeholder="Search staff..."
                  value={staffSearchTerm}
                  onChange={e => setStaffSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                />
              </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5"/>
              <select value={role} onChange={(e)=>setRole(e.target.value)} className="pl-11 pr-8 py-3 border border-slate-300 rounded-xl bg-white/50 backdrop-blur-sm appearance-none cursor-pointer min-w-[140px]">
                <option value="">All Roles</option>
                <option value="Tailor">Tailors</option>
                <option value="Helper">Helpers</option>
              </select>
            </div>
          </div>
          <button onClick={()=>setView("add")} className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl flex items-center gap-2">
            <Plus className="w-5 h-5"/> Add Staff
          </button>
        </div>

        {/* Staff Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStaff.map((s, index) => (
            <div key={s._id} onClick={()=>setSelectedStaff(s)} className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-2xl transform hover:-translate-y-2 cursor-pointer animate-in fade-in-0" style={{animationDelay:`${index*100}ms`}}>
              <div className="relative mb-4">
                <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg">
                  {s.imageUrl ? <img src={s.imageUrl} alt={s.name} className="w-full h-full object-cover"/> :
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                      {s.name?.charAt(0).toUpperCase()}
                    </div>}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white shadow-sm ${s.role==='Tailor'?'bg-indigo-500':'bg-purple-500'}`}>
                  <Briefcase className="w-3 h-3 text-white m-auto mt-0.5"/>
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-bold text-lg text-slate-800 group-hover:text-indigo-600 transition-colors">{s.name}</h3>
                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${s.role==='Tailor'?'bg-indigo-100 text-indigo-700':'bg-purple-100 text-purple-700'}`}>
                  <Briefcase className="w-3 h-3"/> {s.role}
                </div>
                <div className="flex items-center justify-center gap-1 text-slate-500 text-sm"><Phone className="w-3 h-3"/> {s.phone}</div>
                <div className="flex items-center justify-center gap-1 text-slate-500 text-sm"><MapPin className="w-3 h-3"/> {s.address.city}, {s.address.state}</div>
              </div>
            </div>
          ))}
        </div>

        {filteredStaff.length===0 && (
          <div className="text-center py-16 animate-in fade-in-0 duration-500">
            <div className="w-24 h-24 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <Users className="w-12 h-12 text-slate-400"/>
            </div>
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No Staff Found</h3>
            <p className="text-slate-500 mb-6">{role ? 'Try adjusting your filter.' : 'Start by adding your first staff member.'}</p>
            <button onClick={()=>setView("add")} className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl inline-flex items-center gap-2">
              <Plus className="w-5 h-5"/> Add First Staff
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
