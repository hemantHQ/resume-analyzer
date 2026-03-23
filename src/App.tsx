import React, { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { analyzeResume, AnalysisResult } from './services/gemini';
import { Briefcase, CheckCircle2, XCircle, AlertCircle, Loader2, FileText, Sparkles, LogIn, LogOut, Shield, Crown, Lock, Globe, FileCheck, PenTool, LayoutDashboard, BarChart3, FileEdit, FileSearch, Info, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from './contexts/AuthContext';
import { AdminPanel } from './components/AdminPanel';
import { Dashboard } from './components/Dashboard';
import { ResumeBuilder } from './components/ResumeBuilder';
import { Pricing } from './components/Pricing';
import { doc, updateDoc, increment, collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';
import { ThemeToggle } from './components/ThemeToggle';
import { AnalyzingLoader } from './components/AnalyzingLoader';

const FREE_TIER_LIMIT = 3;

export default function App() {
  const { user, profile, loading, signInWithGoogle, logout } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'analyze' | 'dashboard' | 'builder' | 'pricing'>('analyze');
  const [showInfo, setShowInfo] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);

  useEffect(() => {
    // Check for successful upgrade
    const params = new URLSearchParams(window.location.search);
    if (params.get('upgrade_success') === 'true') {
      setUpgradeSuccess(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // We could ideally verify the session here, but for now we just show a success message
      // The actual tier update should be handled by a Stripe webhook or server-side verification
      setTimeout(() => setUpgradeSuccess(false), 5000);
    }
  }, []);

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
          const analysis = await analyzeResume(base64String, file.type, isPro);
          setResult(analysis);
          
          // Increment usage count and save history
          await updateDoc(doc(db, 'users', user.uid), {
            usageCount: increment(1)
          });

          await addDoc(collection(db, 'users', user.uid, 'history'), {
            date: new Date().toISOString(),
            score: analysis.score,
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <AnalyzingLoader text="Loading application..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/50 selection:text-indigo-900 dark:selection:text-indigo-100 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl text-white shadow-sm">
              <FileSearch className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Resume Analyzer</h1>
          </div>
          
          {user && (
            <div className="hidden md:flex items-center space-x-1 ml-8">
              <button
                onClick={() => setActiveTab('analyze')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'analyze' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-4 h-4 inline-block mr-2" />
                Analyze
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'dashboard' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline-block mr-2" />
                Dashboard
                {profile?.tier === 'free' && <Lock className="w-3 h-3 inline-block ml-2 text-slate-400 dark:text-slate-500" />}
              </button>
              <button
                onClick={() => setActiveTab('builder')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'builder' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <FileEdit className="w-4 h-4 inline-block mr-2" />
                Builder
                {profile?.tier === 'free' && <Lock className="w-3 h-3 inline-block ml-2 text-slate-400 dark:text-slate-500" />}
              </button>
              <button
                onClick={() => setActiveTab('pricing')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'pricing' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <CreditCard className="w-4 h-4 inline-block mr-2" />
                Pricing
              </button>
            </div>
          )}

          <div className="flex items-center space-x-4 ml-auto">
            <ThemeToggle />
            <button
              onClick={() => setShowInfo(true)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              aria-label="Information"
            >
              <Info className="w-5 h-5" />
            </button>
            
            {profile && profile.role === 'admin' && (
              <button
                onClick={() => setShowAdmin(!showAdmin)}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showAdmin ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
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
                    profile?.tier === 'pro' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}>
                    {profile?.tier === 'pro' && <Crown className="w-3 h-3 mr-1" />}
                    {profile?.tier.toUpperCase()}
                  </span>
                  <span className="text-sm text-slate-600 dark:text-slate-400 hidden sm:inline-block">
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
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
        {upgradeSuccess && (
          <div className="mb-6 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center text-emerald-800 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5 mr-3" />
            <div>
              <p className="font-medium">Payment Successful!</p>
              <p className="text-sm opacity-90">Your account is being upgraded. It may take a few moments for the changes to reflect.</p>
            </div>
          </div>
        )}

        {showAdmin && profile?.role === 'admin' ? (
          <AdminPanel />
        ) : activeTab === 'pricing' ? (
          <Pricing />
        ) : activeTab === 'dashboard' ? (
          <Dashboard />
        ) : activeTab === 'builder' ? (
          <ResumeBuilder />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Inputs */}
            <div className="lg:col-span-5 space-y-6">
              {!user && (
                <div className="bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-200 dark:border-indigo-500/20 rounded-2xl p-6 text-center backdrop-blur-sm">
                  <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-300 mb-2">Sign in to get started</h3>
                  <p className="text-indigo-700 dark:text-indigo-400/80 text-sm mb-4">Create a free account to analyze your resume. Free users get {FREE_TIER_LIMIT} analyses.</p>
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
                <div className="bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex items-center justify-between backdrop-blur-sm">
                  <div className="text-sm">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">Free Tier Usage: </span>
                    <span className="text-slate-600 dark:text-slate-400">{profile.usageCount} / {FREE_TIER_LIMIT} analyses</span>
                  </div>
                  {profile.usageCount >= FREE_TIER_LIMIT && (
                    <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-md">Limit Reached</span>
                  )}
                </div>
              )}

              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-200">
                <h2 className="text-lg font-semibold mb-4 flex items-center text-slate-900 dark:text-slate-100">
                  <FileText className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400" />
                  Upload Resume
                </h2>
                <FileUpload onFileSelect={setFile} selectedFile={file} />
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !file || (user && profile?.tier === 'free' && profile.usageCount >= FREE_TIER_LIMIT)}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {!user ? (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Analyze my resume
                  </>
                ) : isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Analyze my Resume
                  </>
                )}
              </button>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl flex items-start text-red-700 dark:text-red-400">
                  <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>

            {/* Right Column: Results */}
            <div className="lg:col-span-7">
              {isAnalyzing ? (
                <div className="h-full min-h-[400px] flex items-center justify-center bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                  <AnalyzingLoader />
                </div>
              ) : result ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Score Card */}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center transition-colors duration-200">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Overall Match Score</h3>
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
                            className="text-slate-100 dark:text-slate-700"
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
                          <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">{result.score}</span>
                        </div>
                      </div>
                    </div>
                    {profile?.tier === 'pro' && result.matchPercentage !== undefined && (
                      <div className="mt-6 inline-flex items-center px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 rounded-full text-sm font-medium">
                        <Briefcase className="w-4 h-4 mr-2" />
                        {result.matchPercentage}% Industry Match
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Matched/Detected Skills */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-200">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
                        <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-500" />
                        Detected Skills
                      </h3>
                      {result.detectedSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {result.detectedSkills.map((skill, i) => (
                            <span key={i} className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400">No skills detected.</p>
                      )}
                    </div>

                    {/* Keywords / Missing Skills */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-200">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
                        {result.missingSkills ? (
                          <><XCircle className="w-5 h-5 mr-2 text-red-500" /> Missing Industry Skills</>
                        ) : (
                          <><Sparkles className="w-5 h-5 mr-2 text-indigo-500" /> Extracted Keywords</>
                        )}
                      </h3>
                      {(result.missingSkills || result.extractedKeywords).length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {(result.missingSkills || result.extractedKeywords).map((keyword, i) => (
                            <span key={i} className={`px-3 py-1 border rounded-full text-sm ${
                              result.missingSkills 
                                ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20' 
                                : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20'
                            }`}>
                              {keyword}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {result.missingSkills ? "Great job! No major skills missing." : "No keywords extracted."}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Basic Suggestions */}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-200">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">Suggestions for Improvement</h3>
                    <ul className="space-y-3">
                      {result.suggestions.map((suggestion, i) => (
                        <li key={i} className="flex items-start">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* PRO FEATURES */}
                  {profile?.tier === 'pro' && (
                    <>
                      {/* Section Scores */}
                      {result.sectionScores && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-200">
                          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
                            <LayoutDashboard className="w-5 h-5 mr-2 text-indigo-500" />
                            Section-wise Scoring
                          </h3>
                          <div className="space-y-4">
                            {result.sectionScores.map((section, i) => (
                              <div key={i} className="border-b border-slate-100 dark:border-slate-700 last:border-0 pb-4 last:pb-0">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium text-slate-800 dark:text-slate-200">{section.section}</span>
                                  <span className={`font-bold ${section.score >= 80 ? 'text-emerald-600 dark:text-emerald-400' : section.score >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {section.score}/100
                                  </span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{section.feedback}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* ATS Compatibility */}
                      {result.atsCompatibility && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-200">
                          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
                            <FileCheck className="w-5 h-5 mr-2 text-indigo-500" />
                            ATS Compatibility Check
                          </h3>
                          <div className="flex items-center mb-4">
                            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mr-3">{result.atsCompatibility.score}/100</div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{result.atsCompatibility.feedback}</p>
                          </div>
                          {result.atsCompatibility.issues.length > 0 && (
                            <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 border border-red-100 dark:border-red-900/30">
                              <h4 className="text-sm font-semibold text-red-800 dark:text-red-400 mb-2">Issues to Fix:</h4>
                              <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-1">
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
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-200">
                          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
                            <PenTool className="w-5 h-5 mr-2 text-indigo-500" />
                            Advanced AI Rewrites
                          </h3>
                          <div className="space-y-6">
                            {result.advancedSuggestions.map((suggestion, i) => (
                              <div key={i} className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                                <span className="inline-block px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 text-xs font-semibold rounded mb-3">
                                  {suggestion.section}
                                </span>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Original</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 line-through decoration-red-300 dark:decoration-red-500/50">{suggestion.original}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase mb-1">Improved</p>
                                    <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">{suggestion.improved}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Best Websites to Apply */}
                      {result.bestWebsitesToApply && result.bestWebsitesToApply.length > 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-200">
                          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
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
                                className="block p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md transition-all group bg-slate-50/50 dark:bg-slate-900/50"
                              >
                                <h4 className="font-semibold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 mb-1">{site.name}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{site.reason}</p>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                </motion.div>
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 transition-colors duration-200">
                  <Sparkles className="w-12 h-12 mb-4 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm font-medium">Upload a resume to see the analysis</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 mt-auto">
        <p>Created by Hemant</p>
      </footer>

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center">
                <Info className="w-5 h-5 mr-2 text-indigo-500" />
                About This Project
              </h2>
              <button
                onClick={() => setShowInfo(false)}
                className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-slate-600 dark:text-slate-300">
              <p>
                Welcome to <strong>Resume Analyzer</strong>! This application leverages advanced AI to review, score, and provide actionable feedback on your resume.
              </p>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200">
                  🎓 MCA Final Year Project
                </p>
                <p className="text-sm mt-1 text-indigo-700 dark:text-indigo-300">
                  Created by <strong>Hemant</strong>
                </p>
              </div>
              <p className="text-sm">
                This project demonstrates the integration of modern web technologies, including React, Firebase, and the Gemini AI API, to build a practical, real-world application that helps job seekers improve their chances of success.
              </p>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
              <button
                onClick={() => setShowInfo(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
