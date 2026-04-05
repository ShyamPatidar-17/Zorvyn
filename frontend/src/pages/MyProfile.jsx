import { useState, useEffect, useContext, useMemo } from 'react';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyData = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/transactions');
        setTransactions(res.data);
      } catch (error) {
        toast.error("Could not load your profile data");
      } finally {
        setLoading(false);
      }
    };
    fetchMyData();
  }, []);

 
  const categoryStats = useMemo(() => {
    const categories = {};
    let totalExpense = 0;

    transactions.forEach(t => {
      if (t.type === 'expense') {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
        totalExpense += t.amount;
      }
    });

    return Object.entries(categories)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Account Header Card */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-4xl font-black shadow-lg shadow-blue-200">
          {user?.firstName[0]}{user?.lastName[0]}
        </div>
        <div className="text-center md:text-left flex-1">
          <h1 className="text-3xl font-black text-slate-900 leading-tight">
            {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-slate-400 font-medium">{user?.email}</p>
          <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
              Role: {user?.role}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-1 space-y-8">
          {/* 2. Contact Info */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Joined Platform</p>
                <p className="text-sm font-semibold text-slate-700">
                  {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* 3. Category Breakdown (Spend by Category) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Spending by Category</h3>
            <div className="space-y-6">
              {categoryStats.length > 0 ? categoryStats.map((cat) => (
                <div key={cat.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-600">{cat.name}</span>
                    <span className="text-xs font-black text-slate-900">{formatCurrency(cat.amount)}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-700" 
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              )) : (
                <p className="text-xs text-slate-400 text-center py-4">No expense data to analyze.</p>
              )}
            </div>
          </div>
        </div>

        {/* 4. Full Activity List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Transaction History</h3>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
                {transactions.length} Records
              </span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {transactions.length > 0 ? transactions.map((t) => (
                <div key={t._id} className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                      t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {t.type === 'income' ? '↓' : '↑'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{t.category}</p>
                      <p className="text-[10px] text-slate-400 font-medium italic">
                        {new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-sm ${t.type === 'income' ? 'text-green-600' : 'text-slate-900'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{t.type}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <p className="text-slate-400 text-sm">You haven't made any transactions yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;