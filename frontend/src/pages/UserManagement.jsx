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
  
  // Edit States
  const [editingTxId, setEditingTxId] = useState(null);
  const [editFormData, setEditFormData] = useState({ amount: '', category: '' });

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
    setEditingTxId(null); 
    fetchUserActivity(user._id);
  };

  //  DELETE
  const handleDeleteTx = async (txId) => {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await axiosInstance.delete(`/transactions/${txId}`);
      toast.success("Transaction deleted");
      fetchUserActivity(selectedUser._id);
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  // ADMIN ACTION: START EDIT
  const startEdit = (tx) => {
    setEditingTxId(tx._id);
    setEditFormData({ amount: tx.amount, category: tx.category });
  };

  //  SAVE EDIT
  const handleUpdateTx = async (txId) => {
    try {
      await axiosInstance.put(`/transactions/${txId}`, {
        ...editFormData,
        type: editFormData.amount > 0 ? 'income' : 'expense'
      });
      toast.success("Updated successfully");
      setEditingTxId(null);
      fetchUserActivity(selectedUser._id);
    } catch (error) {
      toast.error("Update failed");
    }
  };

  //  ADD
  const handleAddTx = async () => {
    const amount = prompt("Enter amount (positive for income, negative for expense):");
    const category = prompt("Enter category:");
    if (!amount || !category) return;

    try {
      await axiosInstance.post('/transactions', {
        userId: selectedUser._id,
        amount: Number(amount),
        category,
        type: Number(amount) > 0 ? 'income' : 'expense',
        description: `Admin adjustment for ${selectedUser.firstName}`
      });
      toast.success("Transaction added");
      fetchUserActivity(selectedUser._id);
    } catch (error) {
      toast.error("Failed to add transaction");
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

  if (loading) return <div className="p-20 text-center animate-pulse text-slate-400">Loading Directory...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto relative">
      {/* Search Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Directory</h1>
          <p className="text-slate-500 text-sm">Click a user to view financial activity</p>
        </div>
        <input 
          type="text"
          placeholder="Search by name or email..."
          className="px-5 py-3 rounded-2xl bg-white border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-80 shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">User Details</th>
              <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Role</th>
              <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
              {currentUser.role === 'Admin' && <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.map((u) => (
              <tr key={u._id} onClick={() => handleUserClick(u)} className="hover:bg-blue-50/50 cursor-pointer transition-colors group">
                <td className="p-5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-blue-600">{u.firstName[0]}</div>
                    <div>
                      <p className="font-bold text-slate-900">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </div>
                </td>
                <td className="p-5"><span className="text-xs font-medium text-slate-600">{u.role}</span></td>
                <td className="p-5">
                  <span className={`w-2 h-2 rounded-full inline-block mr-2 ${u.status === 'active' ? 'bg-green-500' : 'bg-red-400'}`}></span>
                  <span className="text-xs font-bold uppercase">{u.status}</span>
                </td>
                {currentUser.role === 'Admin' && (
                  <td className="p-5 text-right">
                    <button onClick={(e) => handleStatusToggle(e, u._id)} className="text-[10px] font-bold uppercase text-red-500 hover:underline">
                      {u.status === 'active' ? 'Suspend' : 'Restore'}
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
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl p-8 overflow-y-auto transition-transform animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black">User Activity</h2>
              <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-slate-900 text-2xl">&times;</button>
            </div>

            {selectedUser && (
              <div className="mb-6 p-4 bg-blue-50 rounded-2xl">
                <p className="font-bold text-blue-900">{selectedUser.firstName}'s History</p>
                <p className="text-[10px] text-blue-400">UID: {selectedUser._id}</p>
              </div>
            )}

            {currentUser.role === 'Admin' && (
              <button onClick={handleAddTx} className="w-full py-3 mb-6 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all">
                + Create Transaction for User
              </button>
            )}

            <div className="space-y-4">
              {userTransactions.length > 0 ? userTransactions.map(tx => (
                <div key={tx._id} className="p-4 border border-slate-100 rounded-2xl flex flex-col group">
                  <div className="flex justify-between items-center">
                    {editingTxId === tx._id ? (
                      <div className="flex flex-col gap-2 w-full pr-4">
                        <input 
                          type="text" 
                          className="border p-1 text-sm rounded" 
                          value={editFormData.category} 
                          onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                        />
                        <input 
                          type="number" 
                          className="border p-1 text-sm rounded" 
                          value={editFormData.amount} 
                          onChange={(e) => setEditFormData({...editFormData, amount: e.target.value})}
                        />
                      </div>
                    ) : (
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{tx.category}</p>
                        <p className="text-[10px] text-slate-400">{new Date(tx.date).toLocaleDateString()}</p>
                      </div>
                    )}
                    
                    <div className="text-right">
                      {editingTxId === tx._id ? (
                        <div className="flex flex-col gap-2">
                           <button className="text-[10px] bg-green-500 text-white px-2 py-1 rounded" onClick={() => handleUpdateTx(tx._id)}>Save</button>
                           <button className="text-[10px] bg-gray-200 px-2 py-1 rounded" onClick={() => setEditingTxId(null)}>Cancel</button>
                        </div>
                      ) : (
                        <p className={`font-black ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                          {tx.type === 'income' ? '+' : '-'}${Math.abs(tx.amount)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Admin Row Actions */}
                  {currentUser.role === 'Admin' && editingTxId !== tx._id && (
                    <div className="flex gap-4 mt-3 opacity-0 group-hover:opacity-100 transition-all border-t pt-2">
                      <button className="text-[10px] text-blue-500 font-bold hover:underline" onClick={() => startEdit(tx)}>Edit</button>
                      <button className="text-[10px] text-red-400 font-bold hover:underline" onClick={() => handleDeleteTx(tx._id)}>Delete</button>
                    </div>
                  )}
                </div>
              )) : (
                <div className="text-center py-20">
                  <p className="text-slate-400 text-sm">No activity found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;