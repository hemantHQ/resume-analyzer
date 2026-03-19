import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { analyzeResume, AnalysisResult } from './services/gemini';
import { Briefcase, CheckCircle2, XCircle, AlertCircle, Loader2, FileText, Sparkles, LogIn, LogOut, Shield, Crown, Lock, Globe, FileCheck, PenTool, LayoutDashboard, BarChart3, FileEdit } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from './contexts/AuthContext';
import { AdminPanel } from './components/AdminPanel';
import { Dashboard } from './components/Dashboard';
import { ResumeBuilder } from './components/ResumeBuilder';
import { doc, updateDoc, increment, collection, addDoc } from 'firebase/firestore';
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
  const [activeTab, setActiveTab] = useState<'analyze' | 'dashboard' | 'builder'>('analyze');

  const handleAnalyze = async () => {
    if (!user || !profile) {
      await signInWithGoogle();
      return;
    }

    if (profile.tier === 'free' && profile.usageCount >= FREE_TIER_LIMIT) {
      setError(`Free tier limit reached (${FREE_TIER_LIMIT} analyses). Please upgrade to Pro for unlimited access.`);
      return;
    }

    if (!file) {
      setError('Please provide a resume.');
      return;
    }

    const isPro = profile?.tier === 'pro';

    if (isPro && !jobDescription.trim()) {
      setError('Please provide a job description for Pro analysis.');
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
          const analysis = await analyzeResume(base64String, file.type, jobDescription, isPro);
          setResult(analysis);
          
          // Increment usage count and save history
          await updateDoc(doc(db, 'users', user.uid), {
            usageCount: increment(1)
          });

          await addDoc(collection(db, 'users', user.uid, 'history'), {
            date: new Date().toISOString(),
            score: analysis.score,
            jobDescription: jobDescription.substring(0, 100) + '...',
            isPro: isPro
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
          
          {user && (
            <div className="hidden md:flex items-center space-x-1 ml-8">
              <button
                onClick={() => setActiveTab('analyze')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'analyze' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-4 h-4 inline-block mr-2" />
                Analyze
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline-block mr-2" />
                Dashboard
                {profile?.tier === 'free' && <Lock className="w-3 h-3 inline-block ml-2 text-slate-400" />}
              </button>
              <button
                onClick={() => setActiveTab('builder')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'builder' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileEdit className="w-4 h-4 inline-block mr-2" />
                Builder
                {profile?.tier === 'free' && <Lock className="w-3 h-3 inline-block ml-2 text-slate-400" />}
              </button>
            </div>
          )}

          <div className="flex items-center space-x-4 ml-auto">
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
        ) : activeTab === 'dashboard' ? (
          <Dashboard />
        ) : activeTab === 'builder' ? (
          <ResumeBuilder />
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

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-slate-400" />
                  2. Job Description
                  {(!profile || profile.tier === 'free') && (
                    <span className="ml-auto inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800">
                      <Lock className="w-3 h-3 mr-1" /> Pro Feature
                    </span>
                  )}
                </h2>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  disabled={!profile || profile.tier === 'free'}
                  placeholder={(!profile || profile.tier === 'free') ? "Upgrade to Pro to enable Job Description matching..." : "Paste the job description here..."}
                  className="w-full h-48 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none resize-none text-sm disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !file || (profile?.tier === 'pro' && !jobDescription.trim()) || (user && profile?.tier === 'free' && profile.usageCount >= FREE_TIER_LIMIT)}
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
                    {profile?.tier === 'pro' && result.matchPercentage !== undefined && (
                      <div className="mt-6 inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                        <Briefcase className="w-4 h-4 mr-2" />
                        {result.matchPercentage}% Job Description Match
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Matched/Detected Skills */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                      <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center">
                        <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-500" />
                        Detected Skills
                      </h3>
                      {result.detectedSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {result.detectedSkills.map((skill, i) => (
                            <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">No skills detected.</p>
                      )}
                    </div>

                    {/* Keywords / Missing Skills */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                      <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center">
                        {result.missingSkills ? (
                          <><XCircle className="w-5 h-5 mr-2 text-red-500" /> Missing Job Skills</>
                        ) : (
                          <><Sparkles className="w-5 h-5 mr-2 text-indigo-500" /> Extracted Keywords</>
                        )}
                      </h3>
                      {(result.missingSkills || result.extractedKeywords).length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {(result.missingSkills || result.extractedKeywords).map((keyword, i) => (
                            <span key={i} className={`px-3 py-1 border rounded-full text-sm ${
                              result.missingSkills 
                                ? 'bg-red-50 text-red-700 border-red-200' 
                                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            }`}>
                              {keyword}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">
                          {result.missingSkills ? "Great job! No major skills missing." : "No keywords extracted."}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Basic Suggestions */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-base font-semibold text-slate-900 mb-4">Suggestions for Improvement</h3>
                    <ul className="space-y-3">
                      {result.suggestions.map((suggestion, i) => (
                        <li key={i} className="flex items-start">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="text-slate-600 text-sm leading-relaxed">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* PRO FEATURES */}
                  {profile?.tier === 'pro' && (
                    <>
                      {/* Section Scores */}
                      {result.sectionScores && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                          <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center">
                            <LayoutDashboard className="w-5 h-5 mr-2 text-indigo-500" />
                            Section-wise Scoring
                          </h3>
                          <div className="space-y-4">
                            {result.sectionScores.map((section, i) => (
                              <div key={i} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium text-slate-800">{section.section}</span>
                                  <span className={`font-bold ${section.score >= 80 ? 'text-emerald-600' : section.score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                                    {section.score}/100
                                  </span>
                                </div>
                                <p className="text-sm text-slate-600">{section.feedback}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* ATS Compatibility */}
                      {result.atsCompatibility && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                          <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center">
                            <FileCheck className="w-5 h-5 mr-2 text-indigo-500" />
                            ATS Compatibility Check
                          </h3>
                          <div className="flex items-center mb-4">
                            <div className="text-2xl font-bold text-slate-900 mr-3">{result.atsCompatibility.score}/100</div>
                            <p className="text-sm text-slate-600">{result.atsCompatibility.feedback}</p>
                          </div>
                          {result.atsCompatibility.issues.length > 0 && (
                            <div className="bg-red-50 rounded-xl p-4">
                              <h4 className="text-sm font-semibold text-red-800 mb-2">Issues to Fix:</h4>
                              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                                {result.atsCompatibility.issues.map((issue, i) => (
                                  <li key={i}>{issue}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Advanced AI Suggestions */}
                      {result.advancedSuggestions && result.advancedSuggestions.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                          <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center">
                            <PenTool className="w-5 h-5 mr-2 text-indigo-500" />
                            Advanced AI Rewrites
                          </h3>
                          <div className="space-y-6">
                            {result.advancedSuggestions.map((suggestion, i) => (
                              <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded mb-3">
                                  {suggestion.section}
                                </span>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Original</p>
                                    <p className="text-sm text-slate-600 line-through decoration-red-300">{suggestion.original}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-emerald-600 uppercase mb-1">Improved</p>
                                    <p className="text-sm text-slate-800 font-medium">{suggestion.improved}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Best Websites to Apply */}
                      {result.bestWebsitesToApply && result.bestWebsitesToApply.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                          <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center">
                            <Globe className="w-5 h-5 mr-2 text-indigo-500" />
                            Best Places to Apply
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {result.bestWebsitesToApply.map((site, i) => (
                              <a 
                                key={i} 
                                href={site.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block p-4 border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all group"
                              >
                                <h4 className="font-semibold text-indigo-600 group-hover:text-indigo-700 mb-1">{site.name}</h4>
                                <p className="text-xs text-slate-500">{site.reason}</p>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

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
