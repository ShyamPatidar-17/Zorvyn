import { useState, useEffect, useContext, useMemo } from 'react';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

const Transactions = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { hasPermission } = useContext(AuthContext);
  
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    search: '',
    timeSpan: '' // Added state for time span
  });

  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // --- ANALYTICS LOGIC ---
  const chartStats = useMemo(() => {
    const catMap = {};
    list.forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });
    const pieData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

    const trendMap = {};
    [...list].reverse().forEach(t => {
      const date = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!trendMap[date]) trendMap[date] = { date, income: 0, expense: 0 };
      if (t.type === 'income') trendMap[date].income += t.amount;
      else trendMap[date].expense += t.amount;
    });
    
    return { pieData, trendData: Object.values(trendMap) };
  }, [list]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      // Append standard filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && key !== 'timeSpan') params.append(key, value);
      });

      // Logic for TimeSpan Filter (Start and End Dates)
      if (filters.timeSpan) {
        const now = new Date();
        let startDate;

        if (filters.timeSpan === 'week') {
          startDate = new Date(now.setDate(now.getDate() - 7));
        } else if (filters.timeSpan === 'month') {
          startDate = new Date(now.setMonth(now.getMonth() - 1));
        } else if (filters.timeSpan === 'year') {
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        }

        if (startDate) {
          params.append('startDate', startDate.toISOString());
          params.append('endDate', new Date().toISOString());
        }
      }

      const res = await axiosInstance.get(`/transactions?${params.toString()}`);
      setList(res.data);
    } catch (error) {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => { fetchTransactions(); }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [filters]);

  // ... handleUpdate and handleDelete functions stay the same ...
  const handleUpdate = async (id) => {
    try {
      await axiosInstance.put(`/transactions/${id}`, editFormData);
      toast.success("Updated successfully");
      setEditingId(null);
      fetchTransactions();
    } catch (error) { toast.error("Update failed"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await axiosInstance.delete(`/transactions/${id}`);
      toast.success("Deleted");
      fetchTransactions();
    } catch (error) { toast.error("Delete failed"); }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      {/* Header and Analytics sections stay the same ... */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Financial Records</h1>
        <p className="text-slate-500 font-medium text-sm">Real-time monitoring and analytics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm col-span-1">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Distribution</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartStats.pieData} innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                  {chartStats.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '15px', border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm col-span-2">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Cash Flow Trend</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartStats.trendData}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <Tooltip contentStyle={{ borderRadius: '15px', border: 'none' }} />
                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fill="url(#colorInc)" />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} fill="url(#colorExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- UPDATED FILTER BAR --- */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <input 
          type="text" placeholder="Search User..." value={filters.search}
          className="px-4 py-3 rounded-xl bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        
        {/* Added TimeSpan Select */}
        <select 
          className="px-4 py-3 rounded-xl bg-slate-50 text-sm font-bold"
          value={filters.timeSpan} onChange={(e) => setFilters({ ...filters, timeSpan: e.target.value })}
        >
          <option value="">All Time</option>
          <option value="week">Past Week</option>
          <option value="month">Past Month</option>
          <option value="year">Past Year</option>
        </select>

        <select 
          className="px-4 py-3 rounded-xl bg-slate-50 text-sm font-bold"
          value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All Categories</option>
          <option value="Utilities">Utilities</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Rent">Rent</option>
          <option value="Freelance">Freelance</option>
          <option value="Grocery">Grocery</option>
          <option value="Salary">Salary</option>
        </select>
        
        <select 
          className="px-4 py-3 rounded-xl bg-slate-50 text-sm font-bold"
          value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <button 
          onClick={() => setFilters({type:'', category:'', search:'', timeSpan:''})} 
          className="text-blue-600 font-bold text-sm hover:bg-blue-50 rounded-xl py-2"
        >
          Reset
        </button>
      </div>

      {/* --- TABLE SECTION stays the same ... */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-5 text-xs font-bold text-slate-400 uppercase">User</th>
              <th className="p-5 text-xs font-bold text-slate-400 uppercase">Category</th>
              <th className="p-5 text-xs font-bold text-slate-400 uppercase">Amount</th>
              <th className="p-5 text-xs font-bold text-slate-400 uppercase">Date</th>
              {hasPermission(['Admin']) && <th className="p-5 text-xs font-bold text-slate-400 uppercase text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {list.map(t => (
              <tr key={t._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-5">
                  <p className="font-bold text-slate-900 text-sm">{t.userId?.firstName} {t.userId?.lastName}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{t.userId?.email}</p>
                </td>
                <td className="p-5">
                  {editingId === t._id ? (
                    <select 
                      className="border p-2 rounded-lg text-sm w-full font-bold" 
                      value={editFormData.category} 
                      onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                    >
                      <option value="Utilities">Utilities</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Rent">Rent</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Grocery">Grocery</option>
                      <option value="Salary">Salary</option>
                    </select>
                  ) : (
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase">
                      {t.category}
                    </span>
                  )}
                </td>
                <td className="p-5 font-black text-sm">
                   {editingId === t._id ? (
                    <input 
                      type="number" className="border p-2 rounded-lg text-sm w-24" 
                      value={editFormData.amount} 
                      onChange={(e) => setEditFormData({...editFormData, amount: e.target.value})}
                    />
                  ) : (
                    <span className={t.type === 'income' ? 'text-green-600' : 'text-slate-900'}>
                      ₹{t.amount.toLocaleString()}
                    </span>
                  )}
                </td>
                <td className="p-5 text-xs text-slate-500 font-medium">{new Date(t.date).toLocaleDateString()}</td>
                {hasPermission(['Admin']) && (
                  <td className="p-5 text-right">
                    {editingId === t._id ? (
                      <button onClick={() => handleUpdate(t._id)} className="text-green-600 font-bold mr-3">Save</button>
                    ) : (
                      <button onClick={() => { setEditingId(t._id); setEditFormData(t); }} className="text-blue-600 font-bold mr-3">Edit</button>
                    )}
                    <button onClick={() => handleDelete(t._id)} className="text-red-500 font-bold">Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions;