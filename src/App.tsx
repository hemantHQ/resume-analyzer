import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { analyzeResume, AnalysisResult } from './services/gemini';
import { Briefcase, CheckCircle2, XCircle, AlertCircle, Loader2, FileText, Sparkles, LogIn, LogOut, Shield, Crown } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from './contexts/AuthContext';
import { AdminPanel } from './components/AdminPanel';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from './firebase';

const FREE_TIER_LIMIT = 3;

export default function App() {
  const { user, profile, loading, signInWithGoogle, logout } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);

  const handleAnalyze = async () => {
    if (!user || !profile) {
      await signInWithGoogle();
      return;
    }

    if (profile.tier === 'free' && profile.usageCount >= FREE_TIER_LIMIT) {
      setError(`Free tier limit reached (${FREE_TIER_LIMIT} analyses). Please upgrade to Pro for unlimited access.`);
      return;
    }

    if (!file || !jobDescription.trim()) {
      setError('Please provide both a resume and a job description.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const base64String = (reader.result as string).split(',')[1];
          const analysis = await analyzeResume(base64String, file.type, jobDescription);
          setResult(analysis);
          
          // Increment usage count
          await updateDoc(doc(db, 'users', user.uid), {
            usageCount: increment(1)
          });
          
        } catch (err: any) {
          setError(err.message || 'Failed to analyze resume. Please try again.');
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.onerror = () => {
        setError('Failed to read the file.');
        setIsAnalyzing(false);
      };
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setIsAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Briefcase className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Resume Analyzer</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {profile && profile.role === 'admin' && (
              <button
                onClick={() => setShowAdmin(!showAdmin)}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showAdmin ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin Panel
              </button>
            )}
            
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    profile?.tier === 'pro' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {profile?.tier === 'pro' && <Crown className="w-3 h-3 mr-1" />}
                    {profile?.tier.toUpperCase()}
                  </span>
                  <span className="text-sm text-slate-600 hidden sm:inline-block">
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign Up / Login
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showAdmin && profile?.role === 'admin' ? (
          <AdminPanel />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Inputs */}
            <div className="lg:col-span-5 space-y-6">
              {!user && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 text-center">
                  <h3 className="text-lg font-semibold text-indigo-900 mb-2">Sign in to get started</h3>
                  <p className="text-indigo-700 text-sm mb-4">Create a free account to analyze your resume. Free users get {FREE_TIER_LIMIT} analyses.</p>
                  <button
                    onClick={signInWithGoogle}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Continue with Google
                  </button>
                </div>
              )}

              {profile && profile.tier === 'free' && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-semibold text-slate-900">Free Tier Usage: </span>
                    <span className="text-slate-600">{profile.usageCount} / {FREE_TIER_LIMIT} analyses</span>
                  </div>
                  {profile.usageCount >= FREE_TIER_LIMIT && (
                    <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-md">Limit Reached</span>
                  )}
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-slate-400" />
                  1. Upload Resume
                </h2>
                <FileUpload onFileSelect={setFile} selectedFile={file} />
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-slate-400" />
                  2. Job Description
                </h2>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="w-full h-48 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none resize-none text-sm"
                />
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !file || !jobDescription.trim() || (user && profile?.tier === 'free' && profile.usageCount >= FREE_TIER_LIMIT)}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {!user ? (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign in to Analyze
                  </>
                ) : isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Analyze Resume
                  </>
                )}
              </button>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start text-red-700">
                  <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>

            {/* Right Column: Results */}
            <div className="lg:col-span-7">
              {result ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Score Card */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">Overall Match Score</h3>
                    <div className="flex justify-center items-center">
                      <div className="relative">
                        <svg className="w-32 h-32 transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            className="text-slate-100"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            strokeDasharray={351.858}
                            strokeDashoffset={351.858 - (351.858 * result.score) / 100}
                            className={`${
                              result.score >= 80 ? 'text-emerald-500' :
                              result.score >= 60 ? 'text-amber-500' : 'text-red-500'
                            } transition-all duration-1000 ease-out`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-4xl font-bold text-slate-900">{result.score}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Matched Skills */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                      <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center">
                        <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-500" />
                        Matched Skills
                      </h3>
                      {result.matchedSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {result.matchedSkills.map((skill, i) => (
                            <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">No matching skills found.</p>
                      )}
                    </div>

                    {/* Missing Keywords */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                      <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center">
                        <XCircle className="w-5 h-5 mr-2 text-red-500" />
                        Missing Keywords
                      </h3>
                      {result.missingKeywords.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {result.missingKeywords.map((keyword, i) => (
                            <span key={i} className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-sm">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">Great job! No major keywords missing.</p>
                      )}
                    </div>
                  </div>

                  {/* Feedback */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-base font-semibold text-slate-900 mb-4">Constructive Feedback</h3>
                    <div className="prose prose-sm prose-slate max-w-none">
                      <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{result.feedback}</p>
                    </div>
                  </div>

                </motion.div>
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <Sparkles className="w-12 h-12 mb-4 text-slate-300" />
                  <p className="text-sm font-medium">Upload a resume and job description to see the analysis</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
