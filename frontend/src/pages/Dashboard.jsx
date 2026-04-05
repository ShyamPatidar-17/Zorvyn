import { useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';
import { formatCurrency } from '../utils/currency';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, hasPermission } = useContext(AuthContext);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/dashboard/summary');
        setData(res.data);
      } catch (error) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (!data) return <p className="text-center mt-10">No data available.</p>;

  return (
    <div className="p-8 max-w-7xl mx-auto bg-[#f8fafc] min-h-screen">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Financial Summary</h1>
          <p className="text-gray-500">
            {data.scope === 'All Customers' ? 'Global View' : 'Personal View'} • 
            <span className="ml-1 font-semibold text-blue-600">{user?.firstName}</span>
          </p>
        </div>
      </header>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div className="p-8 bg-white rounded-3xl shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Net Balance</p>
          <h2 className="text-3xl font-black text-gray-900">{formatCurrency(data.netBalance)}</h2>
        </div>
        
        <div className="p-8 bg-white rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
          <p className="text-xs font-bold text-green-500 uppercase tracking-wider mb-1">Total Income</p>
          <h2 className="text-3xl font-black text-gray-900">{formatCurrency(data.income)}</h2>
        </div>

        <div className="p-8 bg-white rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
          <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Total Expenses</p>
          <h2 className="text-3xl font-black text-gray-900">{formatCurrency(data.expenses)}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity Table */}
        <div className="p-8 bg-white rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {data.recentActivity?.map((item) => (
              <div key={item._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl transition-hover hover:bg-gray-100">
                <div className="flex flex-col">
                  <span className="font-bold text-gray-800">{item.category}</span>
                  
                  {/* NEW: Show User Details if the data is Global (Admin/Analyst) */}
                  {item.userDetails && (
                    <span className="text-[10px] text-blue-600 font-bold uppercase tracking-tight">
                      {item.userDetails.fullName} • {item.userDetails.email}
                    </span>
                  )}
                  
                  <span className="text-xs text-gray-400">{new Date(item.date).toLocaleDateString()}</span>
                </div>
                <div className="text-right">
                  <p className={`font-black ${item.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
                    {item.type === 'expense' ? '-' : '+'}{formatCurrency(item.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="p-8 bg-white rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-6">Spending Insights</h3>
          {hasPermission(['Analyst', 'Admin']) ? (
            <div className="space-y-5">
              {data.categoryTotals?.map((cat) => (
                <div key={cat._id} className="relative">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-bold text-gray-600">{cat._id}</span>
                    <span className="text-sm font-bold">{formatCurrency(cat.amount)}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min((cat.amount / (data.income || 1)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-10 text-center">
              <div className="text-3xl mb-2">🔒</div>
              <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Restricted View</p>
              <p className="text-gray-400 text-xs mt-1">Insights are only available for Analyst and Admin roles.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;