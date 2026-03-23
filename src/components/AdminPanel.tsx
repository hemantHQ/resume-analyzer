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

  const changeTier = async (userId: string, newTier: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        tier: newTier
      });
      // Update local state
      setUsers(users.map(u => u.uid === userId ? { ...u, tier: newTier as 'free' | 'pro' } : u));
    } catch (error) {
      console.error("Error updating user tier", error);
      alert("Failed to update user tier. Make sure you have admin privileges.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-200">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 rounded-lg">
            <Shield className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Admin Panel - User Management</h2>
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Total Users: {users.length}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="p-4">User</th>
              <th className="p-4">Role</th>
              <th className="p-4">Usage Count</th>
              <th className="p-4">Tier</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {users.map((user) => (
              <tr key={user.uid} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-semibold">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">{user.displayName || 'Anonymous'}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-400">
                  {user.usageCount} analyses
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.tier === 'pro' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400'
                  }`}>
                    {user.tier === 'pro' && <Crown className="w-3 h-3 mr-1" />}
                    {user.tier.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <select
                    value={user.tier}
                    onChange={(e) => changeTier(user.uid, e.target.value)}
                    disabled={user.role === 'admin'}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium outline-none transition-colors border ${
                      user.role === 'admin' 
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border-transparent cursor-not-allowed'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 focus:border-indigo-500 dark:focus:border-indigo-500 cursor-pointer'
                    }`}
                  >
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
