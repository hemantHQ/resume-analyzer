import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../contexts/AuthContext';
import { Shield, User, Crown, Loader2 } from 'lucide-react';

export function AdminPanel() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersData: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        usersData.push(doc.data() as UserProfile);
      });
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTier = async (userId: string, currentTier: string) => {
    const newTier = currentTier === 'free' ? 'pro' : 'free';
    try {
      await updateDoc(doc(db, 'users', userId), {
        tier: newTier
      });
      // Update local state
      setUsers(users.map(u => u.uid === userId ? { ...u, tier: newTier } : u));
    } catch (error) {
      console.error("Error updating user tier", error);
      alert("Failed to update user tier. Make sure you have admin privileges.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
            <Shield className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Admin Panel - User Management</h2>
        </div>
        <div className="text-sm text-slate-500">
          Total Users: {users.length}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500 uppercase tracking-wider">
              <th className="p-4">User</th>
              <th className="p-4">Role</th>
              <th className="p-4">Usage Count</th>
              <th className="p-4">Tier</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map((user) => (
              <tr key={user.uid} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{user.displayName || 'Anonymous'}</div>
                      <div className="text-sm text-slate-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-slate-600">
                  {user.usageCount} analyses
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.tier === 'pro' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {user.tier === 'pro' && <Crown className="w-3 h-3 mr-1" />}
                    {user.tier.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => toggleTier(user.uid, user.tier)}
                    disabled={user.role === 'admin'}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      user.role === 'admin' 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : user.tier === 'free'
                          ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {user.tier === 'free' ? 'Upgrade to Pro' : 'Downgrade to Free'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
