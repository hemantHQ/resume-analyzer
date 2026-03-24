import React, { useState } from 'react';
import { CheckCircle2, XCircle, Crown, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Pricing() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) {
      alert("Please sign in first to upgrade.");
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.uid }),
      });
      
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to initiate checkout. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
          Simple, transparent pricing
        </h2>
        <p className="mt-4 text-xl text-slate-600 dark:text-slate-400">
          Choose the plan that best fits your needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 flex flex-col">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Free</h3>
            <div className="mt-4 flex items-baseline text-5xl font-extrabold text-slate-900 dark:text-white">
              ₹0
              <span className="ml-1 text-xl font-medium text-slate-500 dark:text-slate-400">/mo</span>
            </div>
            <p className="mt-4 text-slate-500 dark:text-slate-400">
              Perfect for getting started with basic resume analysis.
            </p>
          </div>
          
          <ul className="mt-6 space-y-4 flex-1">
            <li className="flex items-start">
              <CheckCircle2 className="flex-shrink-0 w-5 h-5 text-emerald-500" />
              <span className="ml-3 text-slate-700 dark:text-slate-300">Basic Resume Analysis</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="flex-shrink-0 w-5 h-5 text-emerald-500" />
              <span className="ml-3 text-slate-700 dark:text-slate-300">3 Analyses per month</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="flex-shrink-0 w-5 h-5 text-emerald-500" />
              <span className="ml-3 text-slate-700 dark:text-slate-300">Keyword Extraction</span>
            </li>
            <li className="flex items-start opacity-50">
              <XCircle className="flex-shrink-0 w-5 h-5 text-slate-400" />
              <span className="ml-3 text-slate-500 dark:text-slate-400">Advanced AI Suggestions</span>
            </li>
            <li className="flex items-start opacity-50">
              <XCircle className="flex-shrink-0 w-5 h-5 text-slate-400" />
              <span className="ml-3 text-slate-500 dark:text-slate-400">ATS Compatibility Score</span>
            </li>
            <li className="flex items-start opacity-50">
              <XCircle className="flex-shrink-0 w-5 h-5 text-slate-400" />
              <span className="ml-3 text-slate-500 dark:text-slate-400">Resume Builder Access</span>
            </li>
            <li className="flex items-start opacity-50">
              <XCircle className="flex-shrink-0 w-5 h-5 text-slate-400" />
              <span className="ml-3 text-slate-500 dark:text-slate-400">Dashboard Analytics</span>
            </li>
          </ul>
          
          <div className="mt-8">
            <button
              disabled
              className="w-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300 py-3 px-4 rounded-xl font-medium cursor-not-allowed"
            >
              {profile?.tier === 'free' ? 'Current Plan' : 'Free Plan'}
            </button>
          </div>
        </div>

        {/* Pro Plan */}
        <div className="bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-900/20 dark:to-slate-800 rounded-2xl shadow-xl border-2 border-indigo-500 p-8 flex flex-col relative transform md:-translate-y-2">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm">
              <Crown className="w-4 h-4 mr-1" />
              Most Popular
            </span>
          </div>
          
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-indigo-900 dark:text-indigo-300">Pro</h3>
            <div className="mt-4 flex items-baseline text-5xl font-extrabold text-indigo-900 dark:text-white">
              ₹199
              <span className="ml-1 text-xl font-medium text-indigo-500 dark:text-indigo-400">/mo</span>
            </div>
            <p className="mt-4 text-indigo-700 dark:text-indigo-400/80">
              Unlock the full power of AI for your career growth.
            </p>
          </div>
          
          <ul className="mt-6 space-y-4 flex-1">
            <li className="flex items-start">
              <CheckCircle2 className="flex-shrink-0 w-5 h-5 text-indigo-500" />
              <span className="ml-3 text-slate-700 dark:text-slate-300 font-medium">Advanced Gemini 3.1 Pro Analysis</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="flex-shrink-0 w-5 h-5 text-indigo-500" />
              <span className="ml-3 text-slate-700 dark:text-slate-300 font-medium">Unlimited Analyses</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="flex-shrink-0 w-5 h-5 text-indigo-500" />
              <span className="ml-3 text-slate-700 dark:text-slate-300">Advanced AI Suggestions & Rewrites</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="flex-shrink-0 w-5 h-5 text-indigo-500" />
              <span className="ml-3 text-slate-700 dark:text-slate-300">ATS Compatibility Score & Fixes</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="flex-shrink-0 w-5 h-5 text-indigo-500" />
              <span className="ml-3 text-slate-700 dark:text-slate-300">Job Board Recommendations</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="flex-shrink-0 w-5 h-5 text-indigo-500" />
              <span className="ml-3 text-slate-700 dark:text-slate-300">Full Resume Builder Access</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="flex-shrink-0 w-5 h-5 text-indigo-500" />
              <span className="ml-3 text-slate-700 dark:text-slate-300">Dashboard Analytics</span>
            </li>
          </ul>
          
          <div className="mt-8">
            {profile?.tier === 'pro' ? (
              <button
                disabled
                className="w-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 py-3 px-4 rounded-xl font-medium cursor-not-allowed"
              >
                You are on Pro
              </button>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-medium shadow-md hover:shadow-lg transition-all flex justify-center items-center"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Upgrade to Pro'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
