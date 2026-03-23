import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { BarChart3, TrendingUp, Calendar, Lock } from 'lucide-react';

interface HistoryItem {
  id: string;
  date: string;
  score: number;
  jobDescription?: string;
  isPro: boolean;
}

export function Dashboard() {
  const { user, profile } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      if (!user) return;
      try {
        const q = query(collection(db, 'users', user.uid, 'history'), orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        const items: HistoryItem[] = [];
        querySnapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as HistoryItem);
        });
        setHistory(items);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (profile?.tier === 'pro') {
      fetchHistory();
    } else {
      setLoading(false);
    }
  }, [user, profile]);

  const handleUpgrade = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        tier: 'pro'
      });
      alert('Successfully upgraded to Pro! Enjoy the new features.');
    } catch (error) {
      console.error('Error upgrading:', error);
      alert('Failed to upgrade.');
    }
  };

  if (profile?.tier === 'free') {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 transition-colors duration-200">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">Pro Feature Locked</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
            Upgrade to Pro to unlock detailed analytics, track your resume improvement over time, and view your complete analysis history.
          </p>
          <button onClick={handleUpgrade} className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-sm transition-all">
            Upgrade to Pro (Test)
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-20 text-slate-500 dark:text-slate-400">Loading dashboard...</div>;
  }

  const averageScore = history.length > 0 
    ? Math.round(history.reduce((acc, curr) => acc + curr.score, 0) / history.length)
    : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Analytics Dashboard</h2>
        <p className="text-slate-600 dark:text-slate-400">Track your resume performance and improvement over time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-200">
          <div className="flex items-center text-slate-500 dark:text-slate-400 mb-2">
            <BarChart3 className="w-5 h-5 mr-2" />
            <h3 className="font-medium">Total Analyses</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{history.length}</p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-200">
          <div className="flex items-center text-slate-500 dark:text-slate-400 mb-2">
            <TrendingUp className="w-5 h-5 mr-2" />
            <h3 className="font-medium">Average Score</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{averageScore}/100</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-200">
          <div className="flex items-center text-slate-500 dark:text-slate-400 mb-2">
            <Calendar className="w-5 h-5 mr-2" />
            <h3 className="font-medium">Latest Score</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{history.length > 0 ? history[0].score : 0}/100</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-200">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Analysis History</h3>
        </div>
        {history.length > 0 ? (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {history.map((item) => (
              <div key={item.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                    {new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString()}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-md">
                    {item.jobDescription || 'General Analysis'}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium ${
                    item.score >= 80 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400' :
                    item.score >= 60 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400' :
                    'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                  }`}>
                    {item.score} / 100
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            No analysis history found. Analyze a resume to get started!
          </div>
        )}
      </div>
    </div>
  );
}
