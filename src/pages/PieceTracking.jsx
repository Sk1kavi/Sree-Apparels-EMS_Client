import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Search, Package, Send, CheckCircle, AlertCircle, Clock } from "lucide-react";

const API_BASE = "https://sree-apparels-ems.onrender.com/api/pieces";

export default function PieceTracking() {
  const [trunks, setTrunks] = useState([]);
  const [filters, setFilters] = useState({ isDispatched: "All", paymentStatus: "All" });
  const [newTrunk, setNewTrunk] = useState({ trunkNumber: "", quantity: "", expectedPayment: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch trunks
  const fetchTrunks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE);
      setTrunks(res.data);
    } catch (err) {
      console.error("Error fetching trunks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrunks(); }, []);

  // Add trunk with validation
  const handleAddTrunk = async (e) => {
    e.preventDefault();
    if (!/^\d+$/.test(newTrunk.quantity) || Number(newTrunk.quantity) <= 0) {
      return alert("Quantity must be a positive number");
    }
    if (!/^\d+$/.test(newTrunk.expectedPayment) || Number(newTrunk.expectedPayment) <= 0) {
      return alert("Expected Payment must be a positive number");
    }
    try {
      await axios.post(`${API_BASE}/receive`, {
        trunkNumber: newTrunk.trunkNumber,
        itemType: "Trunk Pieces",
        quantity: Number(newTrunk.quantity),
        expectedPayment: Number(newTrunk.expectedPayment),
      });
      setNewTrunk({ trunkNumber: "", quantity: "", expectedPayment: "" });
      fetchTrunks();
    } catch (err) {
      console.error("Error adding trunk:", err);
    }
  };

  // Dispatch trunk
  const handleDispatch = async (id) => {
    try { await axios.post(`${API_BASE}/dispatch/${id}`); fetchTrunks(); } 
    catch (err) { console.error("Error dispatching trunk:", err); }
  };

  // Update Payment
  const handlePaymentUpdate = async (id, amount) => {
    try { await axios.put(`${API_BASE}/payment/${id}`, { paymentAmount: amount }); fetchTrunks(); } 
    catch (err) { console.error("Error updating payment:", err); }
  };

  // Generate PDF Bill
  const handleGenerateBill = async (id) => {
    try {
      const res = await axios.get(`${API_BASE}/${id}`);
      const trunk = res.data;
      const doc = new jsPDF();
      doc.setFontSize(18); doc.text("SREE APPARELS", 105, 20, { align: "center" });
      doc.setFontSize(12); doc.text("Official Invoice", 105, 28, { align: "center" });
      doc.setFontSize(10);
      doc.text("Email: sreeapparels.gbi@gmail.com", 20, 36);
      doc.text("Phone: 9344931717", 20, 41);
      const addrLines = ["11A, Jawaharlal Nehru Street,", "Amman Mess opposite,", "Erode main road, Gobi."];
      let y = 36; addrLines.forEach(l => { doc.text(l, 190, y, { align: "right" }); y += 5; });
      doc.line(20, 51, 190, 51);
      doc.setFontSize(11);
      doc.text(`Vendor: ${trunk.vendor}`, 20, 56);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 56);
      doc.setFontSize(12);
      doc.text("Bundle Details:", 20, 69);
      autoTable(doc, { startY: 74, head: [["Bundle No","Item Type","Quantity","Expected Payment","Total Paid","Received Date","Dispatched Date"]],
        body:[[trunk.trunkNumber,trunk.itemType,trunk.quantity,`₹${trunk.expectedPayment}`,`₹${trunk.totalPaid || 0}`,new Date(trunk.receivedDate).toLocaleDateString(),trunk.dispatchedDate? new Date(trunk.dispatchedDate).toLocaleDateString():"—"]], theme:"grid", styles:{halign:"center"}});
      const startYPartial = doc.lastAutoTable.finalY + 10;
      doc.text("Partial Payments:",20,startYPartial);
      const paymentBody = trunk.payments.map(p=>[new Date(p.date).toLocaleDateString(),`₹${p.amount}`]);
      if(paymentBody.length===0){ doc.text("No payments received yet.",20,startYPartial+10); }
      else { autoTable(doc,{startY:startYPartial+5,head:[["Payment Date","Amount"]],body:paymentBody,theme:"grid",styles:{halign:"center"}});}
      const finalY=(paymentBody.length>0?doc.lastAutoTable.finalY:startYPartial+20)+10;
      const pending = trunk.expectedPayment-(trunk.totalPaid||0);
      if(pending<=0){ doc.setTextColor(0,128,0); doc.text("✅ Payment Completed. Thank you!",20,finalY);}
      else{ doc.setTextColor(200,0,0); doc.text(`⚠ Pending Amount: ₹${pending}`,20,finalY);}
      doc.setTextColor(0,0,0); doc.text("Authorized Signature: ____________________",20,finalY+30);
      doc.save(`Bill_${trunk.trunkNumber}.pdf`);
    } catch (err){ console.error("Error generating bill:", err);}
  };

  // Filtered & searched
  const filteredTrunks = trunks.filter(t=>{
    const term = searchTerm.toLowerCase();
    const match = t.trunkNumber.toLowerCase().includes(term);
    let dispatchMatch = true;
    if(filters.isDispatched==="Dispatched") dispatchMatch=t.isDispatched;
    if(filters.isDispatched==="Not Dispatched") dispatchMatch=!t.isDispatched;
    let paymentMatch = true;
    if(filters.paymentStatus==="Completed") paymentMatch=t.totalPaid>=t.expectedPayment;
    if(filters.paymentStatus==="Partial") paymentMatch=t.totalPaid>0 && t.totalPaid<t.expectedPayment;
    if(filters.paymentStatus==="Pending") paymentMatch=t.totalPaid===0;
    return match && dispatchMatch && paymentMatch;
  });

  const getStatusBadge = trunk=>{
    if(trunk.totalPaid>=trunk.expectedPayment && trunk.isDispatched) return <div className="flex items-center justify-center space-x-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"><CheckCircle className="w-4 h-4"/><span>Completed</span></div>;
    if(trunk.totalPaid>0 && trunk.totalPaid<trunk.expectedPayment) return <div className="flex items-center justify-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"><Clock className="w-4 h-4"/><span>Partial</span></div>;
    return <div className="flex items-center justify-center space-x-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium"><AlertCircle className="w-4 h-4"/><span>Pending</span></div>;
  };

  const stats = { total:trunks.length, dispatched:trunks.filter(t=>t.isDispatched).length, completed:trunks.filter(t=>t.totalPaid>=t.expectedPayment).length, pending:trunks.filter(t=>t.totalPaid< t.expectedPayment).length };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header & Stats */}
        <div className="mb-8 bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <StatCard title="Total Trunks" value={stats.total} icon={<Package className="w-6 h-6 text-blue-200"/>} from="blue-500" to="blue-600"/>
            <StatCard title="Dispatched" value={stats.dispatched} icon={<Send className="w-6 h-6 text-green-200"/>} from="green-500" to="green-600"/>
            <StatCard title="Payment Completed" value={stats.completed} icon={<CheckCircle className="w-6 h-6 text-purple-200"/>} from="purple-500" to="purple-600"/>
            <StatCard title="Pending Payment" value={stats.pending} icon={<AlertCircle className="w-6 h-6 text-orange-200"/>} from="orange-500" to="orange-600"/>
          </div>
          {/* Filters & Search */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                <input type="text" placeholder="Search trunk number..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"/>
              </div>
              <select value={filters.isDispatched} onChange={e=>setFilters({...filters,isDispatched:e.target.value})} className="px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300">
                <option>All</option><option>Dispatched</option><option>Not Dispatched</option>
              </select>
              <select value={filters.paymentStatus} onChange={e=>setFilters({...filters,paymentStatus:e.target.value})} className="px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300">
                <option>All</option><option>Completed</option><option>Partial</option><option>Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-x-auto">
          {loading ? <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div> :
          <table className="w-full text-center border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200/50">
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">Bundle No</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">Quantity</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">Received Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">Expected</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">Received</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <AnimatePresence>
            <tbody>
              {filteredTrunks.map(trunk=>(
                <motion.tr key={trunk._id} initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.2}} className="border-b border-gray-200/30 hover:bg-white/50 transition-all duration-300">
                  <td className="px-6 py-4 font-semibold text-gray-900">{trunk.trunkNumber}</td>
                  <td className="px-6 py-4 flex items-center justify-center"><Package className="w-4 h-4 mr-1"/>{trunk.quantity}</td>
                  <td className="px-6 py-4 text-gray-600">{new Date(trunk.receivedDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-blue-600 font-semibold">₹{trunk.expectedPayment}</td>
                  <td className="px-6 py-4 text-green-600 font-semibold">₹{trunk.totalPaid || 0}</td>
                  <td className="px-6 py-4">{getStatusBadge(trunk)}</td>
                  <td className="px-6 py-4 flex flex-wrap gap-2 justify-center">
                    {!trunk.isDispatched && <button onClick={()=>handleDispatch(trunk._id)} className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Dispatch</button>}
                    {trunk.totalPaid<trunk.expectedPayment && <button onClick={()=>{
                      const remaining = trunk.expectedPayment - trunk.totalPaid;
                      const entered = prompt(`Enter amount (Remaining: ₹${remaining})`);
                      if(!entered) return; const amount = Number(entered); if(isNaN(amount)||amount<=0||amount>remaining) return alert("Invalid amount.");
                      handlePaymentUpdate(trunk._id, amount);
                    }} className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Payment</button>}
                    {trunk.totalPaid>0 && <button onClick={()=>handleGenerateBill(trunk._id)} className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">Bill</button>}
                  </td>
                </motion.tr>
              ))}
            </tbody>
            </AnimatePresence>
          </table>}
        </div>

        {/* Add Trunk Form */}
        <div className="mt-10 p-6 bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-xl rounded-2xl border border-white/30">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Trunk</h3>
          <form onSubmit={handleAddTrunk} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input type="text" required placeholder="Trunk Number" value={newTrunk.trunkNumber} onChange={e=>setNewTrunk({...newTrunk,trunkNumber:e.target.value})} className="px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"/>
            <input type="number" required placeholder="Quantity" min="1" value={newTrunk.quantity} onChange={e=>setNewTrunk({...newTrunk,quantity:e.target.value})} className="px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"/>
            <input type="number" required placeholder="Expected Payment" min="1" value={newTrunk.expectedPayment} onChange={e=>setNewTrunk({...newTrunk,expectedPayment:e.target.value})} className="px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"/>
            <button type="submit" className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700">Save Trunk</button>
          </form>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({title,value,icon,from,to}) => (
  <div className={`bg-gradient-to-br from-${from} to-${to} p-6 rounded-2xl text-white transform hover:scale-105 transition-all duration-300 shadow-lg`}>
    <div className="flex items-center justify-between">
      <div><p className="text-sm font-medium">{title}</p><p className="text-3xl font-bold">{value}</p></div>
      {icon}
    </div>
  </div>
);
