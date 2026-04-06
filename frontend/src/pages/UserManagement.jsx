import { useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useContext(AuthContext);

  // Drawer / Transaction States
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTransactions, setUserTransactions] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Modal States
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | 'delete' | null
  const [activeTx, setActiveTx] = useState(null);
  const [formData, setFormData] = useState({ amount: '', category: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/auth/users');
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (error) {
      toast.error("Permission denied");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    const filtered = users.filter(u => 
      u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const fetchUserActivity = async (userId) => {
    try {
      const res = await axiosInstance.get(`/transactions/user/${userId}`);
      setUserTransactions(res.data);
    } catch (error) {
      toast.error("Could not load transactions");
    }
  };

  const handleUserClick = (user) => {
    if (currentUser.role === 'Viewer') return;
    setSelectedUser(user);
    setIsDrawerOpen(true);
    fetchUserActivity(user._id);
  };

  // --- CRUD OPERATIONS VIA MODAL ---

  const openAddModal = () => {
    setFormData({ amount: '', category: '', description: `Admin adjustment for ${selectedUser.firstName}` });
    setModalMode('add');
  };

  const openEditModal = (tx) => {
    setActiveTx(tx);
    setFormData({ amount: tx.amount, category: tx.category, description: tx.description || '' });
    setModalMode('edit');
  };

  const openDeleteModal = (tx) => {
    setActiveTx(tx);
    setModalMode('delete');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (modalMode === 'add') {
        await axiosInstance.post('/transactions', {
          userId: selectedUser._id,
          amount: Number(formData.amount),
          category: formData.category,
          type: Number(formData.amount) > 0 ? 'income' : 'expense',
          description: formData.description
        });
        toast.success("Transaction added");
      } else if (modalMode === 'edit') {
        await axiosInstance.put(`/transactions/${activeTx._id}`, {
          ...formData,
          amount: Number(formData.amount),
          type: Number(formData.amount) > 0 ? 'income' : 'expense'
        });
        toast.success("Updated successfully");
      }
      fetchUserActivity(selectedUser._id);
      setModalMode(null);
    } catch (error) {
      toast.error("Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    setIsSubmitting(true);
    try {
      await axiosInstance.delete(`/transactions/${activeTx._id}`);
      toast.success("Transaction deleted");
      fetchUserActivity(selectedUser._id);
      setModalMode(null);
    } catch (error) {
      toast.error("Delete failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusToggle = async (e, userId) => {
    e.stopPropagation();
    try {
      const res = await axiosInstance.patch(`/auth/users/${userId}/status`);
      toast.success(res.data.message);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, status: res.data.status } : u));
    } catch (error) {
      toast.error("Action failed");
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-slate-400 font-medium">Loading Directory...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto relative min-h-screen bg-slate-50/50">
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">User Directory</h1>
          <p className="text-slate-500 mt-1">Manage permissions and monitor financial activity</p>
        </div>
        <div className="relative group">
          <input 
            type="text"
            placeholder="Search users..."
            className="pl-12 pr-5 py-3.5 rounded-2xl bg-white border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none w-full md:w-96 shadow-sm transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg className="w-5 h-5 absolute left-4 top-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">User Details</th>
              <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Role</th>
              <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
              {currentUser.role === 'Admin' && <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Access Control</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.map((u) => (
              <tr key={u._id} onClick={() => handleUserClick(u)} className="hover:bg-blue-50/30 cursor-pointer transition-all group">
                <td className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-200 uppercase">{u.firstName[0]}</div>
                    <div>
                      <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-slate-400 font-medium">{u.email}</p>
                    </div>
                </td>
                <td className="p-6">
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">{u.role}</span>
                </td>
                <td className="p-6">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${u.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-2 ${u.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                    {u.status}
                  </div>
                </td>
                {currentUser.role === 'Admin' && (
                  <td className="p-6 text-right">
                    <button 
                      onClick={(e) => handleStatusToggle(e, u._id)} 
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${u.status === 'active' ? 'text-rose-500 border-rose-100 hover:bg-rose-50' : 'text-emerald-500 border-emerald-100 hover:bg-emerald-50'}`}
                    >
                      {u.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Slide-over Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={() => setIsDrawerOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl p-10 overflow-y-auto animate-in slide-in-from-right duration-500 ease-out border-l border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Activity Feed</h2>
                <p className="text-slate-400 text-sm font-medium">Detailed financial logs</p>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors text-2xl font-light">&times;</button>
            </div>

            {selectedUser && (
              <div className="mb-8 p-6 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[1.5rem] text-white shadow-xl shadow-blue-200">
                <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mb-1">Target Account</p>
                <p className="text-xl font-bold">{selectedUser.firstName} {selectedUser.lastName}</p>
                <p className="text-xs text-blue-200/80 font-mono mt-1 opacity-70">ID: {selectedUser._id}</p>
              </div>
            )}

            {currentUser.role === 'Admin' && (
              <button onClick={openAddModal} className="w-full py-4 mb-8 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-blue-600 transition-all shadow-lg hover:shadow-blue-200 flex items-center justify-center gap-2">
                <span className="text-lg">+</span> Create New Entry
              </button>
            )}

            <div className="space-y-4">
              {userTransactions.length > 0 ? userTransactions.map(tx => (
                <div key={tx._id} className="p-5 border border-slate-100 rounded-2xl flex flex-col group hover:border-blue-200 hover:bg-blue-50/20 transition-all">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800">{tx.category}</p>
                      <p className="text-[10px] text-slate-400 font-medium uppercase mt-1">{new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-black ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {tx.type === 'income' ? '+' : '-'}${Math.abs(tx.amount).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {currentUser.role === 'Admin' && (
                    <div className="flex gap-4 mt-4 pt-4 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-[10px] text-blue-600 font-black uppercase tracking-wider hover:underline" onClick={() => openEditModal(tx)}>Edit</button>
                      <button className="text-[10px] text-rose-500 font-black uppercase tracking-wider hover:underline" onClick={() => openDeleteModal(tx)}>Delete</button>
                    </div>
                  )}
                </div>
              )) : (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-medium">No activity records found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- REUSABLE MODAL (Add/Edit/Delete) --- */}
      {modalMode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => !isSubmitting && setModalMode(null)} />
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            
            {modalMode === 'delete' ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">!</div>
                <h3 className="text-2xl font-black text-slate-900">Confirm Delete</h3>
                <p className="text-slate-500 mt-2">Are you sure you want to remove this transaction? This action cannot be undone.</p>
                <div className="flex gap-3 mt-8">
                  <button disabled={isSubmitting} onClick={() => setModalMode(null)} className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">Cancel</button>
                  <button disabled={isSubmitting} onClick={confirmDelete} className="flex-1 py-3.5 bg-rose-500 text-white rounded-2xl font-bold hover:bg-rose-600 shadow-lg shadow-rose-200 transition-all">
                    {isSubmitting ? 'Deleting...' : 'Delete Forever'}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit}>
                <h3 className="text-2xl font-black text-slate-900 mb-6">
                  {modalMode === 'add' ? 'New Transaction' : 'Edit Transaction'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Category</label>
                    <input required className="w-full mt-1 px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" 
                      value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} placeholder="e.g. Salary, Rent, Bonus" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Amount</label>
                    <input required type="number" className="w-full mt-1 px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" 
                      value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="Positive (+), Negative (-)" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Internal Note</label>
                    <textarea rows="2" className="w-full mt-1 px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm" 
                      value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                  </div>
                </div>
                <div className="flex gap-3 mt-8">
                  <button type="button" disabled={isSubmitting} onClick={() => setModalMode(null)} className="flex-1 py-3.5 bg-slate-50 text-slate-400 rounded-2xl font-bold hover:bg-slate-100 transition-all">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-3.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
                    {isSubmitting ? 'Saving...' : (modalMode === 'add' ? 'Create' : 'Save Changes')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;