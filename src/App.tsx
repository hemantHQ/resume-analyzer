import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { analyzeResume, AnalysisResult, extractAndImproveResume, ImprovedResumeData } from './services/gemini';
import { Briefcase, CheckCircle2, XCircle, AlertCircle, Loader2, FileText, Sparkles, LayoutDashboard, FileCheck, PenTool, Globe, FileEdit, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResumeBuilder } from './components/ResumeBuilder';
import { ThemeToggle } from './components/ThemeToggle';
import { AnalyzingLoader } from './components/AnalyzingLoader';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'analyze' | 'builder'>('analyze');
  const [showInfo, setShowInfo] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [improvedResumeData, setImprovedResumeData] = useState<ImprovedResumeData | null>(null);

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please provide a resume.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const base64String = (reader.result as string).split(',')[1];
          const analysis = await analyzeResume(base64String, file.type);
          setResult(analysis);
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

  const handleImproveResume = async () => {
    if (!file) return;
    
    setIsImproving(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const base64String = (reader.result as string).split(',')[1];
          const improvedData = await extractAndImproveResume(base64String, file.type);
          setImprovedResumeData(improvedData);
          setActiveTab('builder');
        } catch (err: any) {
          setError(err.message || 'Failed to improve resume. Please try again.');
        } finally {
          setIsImproving(false);
        }
      };
      reader.onerror = () => {
        setError('Failed to read the file.');
        setIsImproving(false);
      };
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setIsImproving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-emerald-100 dark:selection:bg-emerald-900/50 selection:text-emerald-900 dark:selection:text-emerald-100 transition-colors duration-300 relative overflow-hidden">
      {/* Modern Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-400/20 dark:bg-emerald-600/10 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-400/20 dark:bg-teal-600/10 blur-[120px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
      </div>
      
      {/* Header */}
      <header className="glass-panel sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button onClick={() => window.location.reload()} className="flex items-center space-x-3 flex-1 hover:opacity-80 transition-opacity text-left group">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-xl text-white shadow-md group-hover:shadow-lg transition-all transform group-hover:scale-105">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400">Resume Analyzer</h1>
          </button>
          
          <div className="hidden md:flex items-center justify-center space-x-2 bg-zinc-100/50 dark:bg-zinc-800/50 p-1 rounded-xl border border-zinc-200/50 dark:border-zinc-700/50 backdrop-blur-sm relative">
            <button
              onClick={() => setActiveTab('analyze')}
              className={`relative z-10 px-5 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
                activeTab === 'analyze' 
                  ? 'text-emerald-700 dark:text-emerald-300' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              {activeTab === 'analyze' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-lg shadow-sm -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Sparkles className="w-4 h-4 inline-block mr-2" />
              Analyze
            </button>
            <button
              onClick={() => setActiveTab('builder')}
              className={`relative z-10 px-5 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
                activeTab === 'builder' 
                  ? 'text-emerald-700 dark:text-emerald-300' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              {activeTab === 'builder' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-lg shadow-sm -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <FileEdit className="w-4 h-4 inline-block mr-2" />
              Builder
            </button>
          </div>

          <div className="flex items-center justify-end space-x-4 flex-1">
            <ThemeToggle />
            <button
              onClick={() => setShowInfo(true)}
              className="p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Information"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-12">
        <AnimatePresence mode="wait">
          {activeTab === 'builder' ? (
            <motion.div
              key="builder"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ResumeBuilder initialData={improvedResumeData} />
            </motion.div>
          ) : (
            <motion.div
              key="analyze"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left Column: Inputs */}
              <div className="lg:col-span-5 space-y-6">
                <div className="glass-card rounded-3xl p-8 transition-all hover:shadow-2xl">
                  <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4">
                      <FileText className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Upload Resume</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">PDF, DOCX, or TXT formats supported</p>
                  </div>
                  
                  <FileUpload onFileSelect={setFile} selectedFile={file} />
                  
                  <div className="mt-8">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAnalyze}
                      disabled={isAnalyzing || !file}
                      className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                          Analyzing with AI...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-3 group-hover:animate-pulse" />
                          Analyze Resume
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-2xl flex items-start text-red-700 dark:text-red-400"
                    >
                      <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
                      <p className="text-sm font-medium">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right Column: Results */}
              <div className="lg:col-span-7">
                <AnimatePresence mode="wait">
                  {isAnalyzing ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full min-h-[500px] flex items-center justify-center"
                    >
                      <AnalyzingLoader />
                    </motion.div>
                  ) : result ? (
                    <motion.div 
                      key="results"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, staggerChildren: 0.1 }}
                      className="space-y-6"
                    >
                      {/* Score Card */}
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card rounded-3xl p-8 text-center relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-pink-500"></div>
                        <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-6">Overall Match Score</h3>
                        <div className="flex justify-center items-center">
                          <div className="relative">
                            <svg className="w-40 h-40 transform -rotate-90 drop-shadow-xl">
                              <circle
                                cx="80"
                                cy="80"
                                r="70"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="transparent"
                                className="text-zinc-100 dark:text-zinc-700/50"
                              />
                              <motion.circle
                                initial={{ strokeDashoffset: 439.8 }}
                                animate={{ strokeDashoffset: 439.8 - (439.8 * result.score) / 100 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                cx="80"
                                cy="80"
                                r="70"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="transparent"
                                strokeDasharray={439.8}
                                strokeLinecap="round"
                                className={`${
                                  result.score >= 80 ? 'text-emerald-500' :
                                  result.score >= 60 ? 'text-amber-500' : 'text-red-500'
                                }`}
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-5xl font-black text-zinc-900 dark:text-white tracking-tighter">{result.score}</span>
                            </div>
                          </div>
                        </div>
                        {result.matchPercentage !== undefined && (
                          <div className="mt-8 inline-flex items-center px-5 py-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-semibold border border-emerald-100 dark:border-emerald-500/20">
                            <Briefcase className="w-4 h-4 mr-2" />
                            {result.matchPercentage}% Industry Match
                          </div>
                        )}
                        
                        {result.score < 95 && (
                          <div className="mt-8 border-t border-zinc-100 dark:border-zinc-700/50 pt-8">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-5 max-w-md mx-auto">
                              Want a better score? Let our AI rewrite your resume to be highly impactful and ATS-friendly.
                            </p>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleImproveResume}
                              disabled={isImproving}
                              className="inline-flex items-center justify-center px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-2xl text-sm font-bold transition-all shadow-xl hover:shadow-2xl disabled:opacity-70"
                            >
                              {isImproving ? (
                                <>
                                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                  Improving Resume...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-5 h-5 mr-3" />
                                  Auto-Improve with AI
                                </>
                              )}
                            </motion.button>
                          </div>
                        )}
                      </motion.div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Matched/Detected Skills */}
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="glass-card rounded-3xl p-6"
                        >
                          <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-5 flex items-center">
                            <CheckCircle2 className="w-5 h-5 mr-3 text-emerald-500" />
                            Detected Skills
                          </h3>
                          {result.detectedSkills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {result.detectedSkills.map((skill, i) => (
                                <span key={i} className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20 rounded-xl text-sm font-medium">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">No skills detected.</p>
                          )}
                        </motion.div>

                        {/* Keywords / Missing Skills */}
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="glass-card rounded-3xl p-6"
                        >
                          <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-5 flex items-center">
                            {result.missingSkills ? (
                              <><XCircle className="w-5 h-5 mr-3 text-red-500" /> Missing Industry Skills</>
                            ) : (
                              <><Sparkles className="w-5 h-5 mr-3 text-emerald-500" /> Extracted Keywords</>
                            )}
                          </h3>
                          {(result.missingSkills || result.extractedKeywords).length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {(result.missingSkills || result.extractedKeywords).map((keyword, i) => (
                                <span key={i} className={`px-3 py-1.5 border rounded-xl text-sm font-medium ${
                                  result.missingSkills 
                                    ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200/50 dark:border-red-500/20' 
                                    : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/20'
                                }`}>
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                              {result.missingSkills ? "Great job! No major skills missing." : "No keywords extracted."}
                            </p>
                          )}
                        </motion.div>
                      </div>

                      {/* Basic Suggestions */}
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card rounded-3xl p-8"
                      >
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Suggestions for Improvement</h3>
                        <ul className="space-y-4">
                          {result.suggestions.map((suggestion, i) => (
                            <li key={i} className="flex items-start bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl">
                              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-bold mr-4">
                                {i + 1}
                              </span>
                              <span className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed pt-1">{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>

                      {/* Section Scores */}
                      {result.sectionScores && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="glass-card rounded-3xl p-8"
                        >
                          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 flex items-center">
                            <LayoutDashboard className="w-6 h-6 mr-3 text-emerald-500" />
                            Section-wise Scoring
                          </h3>
                          <div className="space-y-6">
                            {result.sectionScores.map((section, i) => (
                              <div key={i} className="border-b border-zinc-100 dark:border-zinc-700/50 last:border-0 pb-6 last:pb-0">
                                <div className="flex justify-between items-center mb-3">
                                  <span className="font-bold text-zinc-800 dark:text-zinc-200 text-lg">{section.section}</span>
                                  <span className={`px-3 py-1 rounded-lg font-bold text-sm ${
                                    section.score >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 
                                    section.score >= 60 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : 
                                    'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                                  }`}>
                                    {section.score}/100
                                  </span>
                                </div>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{section.feedback}</p>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* ATS Compatibility */}
                      {result.atsCompatibility && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="glass-card rounded-3xl p-8"
                        >
                          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 flex items-center">
                            <FileCheck className="w-6 h-6 mr-3 text-emerald-500" />
                            ATS Compatibility Check
                          </h3>
                          <div className="flex items-center mb-6 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl">
                            <div className="text-3xl font-black text-zinc-900 dark:text-white mr-4">{result.atsCompatibility.score}<span className="text-lg text-zinc-400">/100</span></div>
                            <p className="text-sm text-zinc-600 dark:text-zinc-300 font-medium">{result.atsCompatibility.feedback}</p>
                          </div>
                          {result.atsCompatibility.issues.length > 0 && (
                            <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-5 border border-red-100 dark:border-red-900/30">
                              <h4 className="text-sm font-bold text-red-800 dark:text-red-400 mb-3">Issues to Fix:</h4>
                              <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-2">
                                {result.atsCompatibility.issues.map((issue, i) => (
                                  <li key={i}>{issue}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </motion.div>
                      )}

                      {/* Advanced AI Suggestions */}
                      {result.advancedSuggestions && result.advancedSuggestions.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="glass-card rounded-3xl p-8"
                        >
                          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 flex items-center">
                            <PenTool className="w-6 h-6 mr-3 text-emerald-500" />
                            Advanced AI Rewrites
                          </h3>
                          <div className="space-y-6">
                            {result.advancedSuggestions.map((suggestion, i) => (
                              <div key={i} className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-700/50">
                                <span className="inline-block px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-lg mb-4 uppercase tracking-wider">
                                  {suggestion.section}
                                </span>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Original</p>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 line-through decoration-red-300 dark:decoration-red-500/50">{suggestion.original}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">Improved</p>
                                    <p className="text-sm text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed">{suggestion.improved}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Best Websites to Apply */}
                      {result.bestWebsitesToApply && result.bestWebsitesToApply.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="glass-card rounded-3xl p-8"
                        >
                          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 flex items-center">
                            <Globe className="w-6 h-6 mr-3 text-emerald-500" />
                            Best Places to Apply
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {result.bestWebsitesToApply.map((site, i) => (
                              <a 
                                key={i} 
                                href={site.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block p-5 border border-zinc-200 dark:border-zinc-700/50 rounded-2xl hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-lg transition-all duration-300 group bg-zinc-50/50 dark:bg-zinc-900/50 transform hover:-translate-y-1"
                              >
                                <h4 className="font-bold text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 mb-2">{site.name}</h4>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{site.reason}</p>
                              </a>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full min-h-[500px] flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-3xl glass-card transition-colors duration-300"
                    >
                      <Sparkles className="w-16 h-16 mb-6 text-zinc-300 dark:text-zinc-600" />
                      <p className="text-base font-medium">Upload a resume to see the analysis</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 z-50 pb-safe">
        <div className="flex items-center justify-around p-2 relative">
          <button
            onClick={() => setActiveTab('analyze')}
            className={`relative z-10 flex flex-col items-center justify-center w-full py-3 rounded-xl transition-colors duration-300 ${
              activeTab === 'analyze' ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            {activeTab === 'analyze' && (
              <motion.div
                layoutId="activeMobileTab"
                className="absolute inset-0 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <Sparkles className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold tracking-wide uppercase">Analyze</span>
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            className={`relative z-10 flex flex-col items-center justify-center w-full py-3 rounded-xl transition-colors duration-300 ${
              activeTab === 'builder' ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            {activeTab === 'builder' && (
              <motion.div
                layoutId="activeMobileTab"
                className="absolute inset-0 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <FileEdit className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold tracking-wide uppercase">Builder</span>
          </button>
        </div>
      </div>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-zinc-200 dark:border-zinc-800"
            >
              <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center">
                  <Info className="w-6 h-6 mr-3 text-emerald-500" />
                  About This Project
                </h2>
              </div>
              <div className="p-8 space-y-6 text-zinc-600 dark:text-zinc-300">
                <p className="leading-relaxed">
                  Welcome to <strong>Resume Analyzer</strong>! This application leverages advanced AI to review, score, and provide actionable feedback on your resume.
                </p>
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 text-center">
                  <p className="text-2xl font-black text-emerald-900 dark:text-emerald-200 mb-2">
                    Hemant
                  </p>
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 tracking-wide uppercase">
                    🎓 MCA Final Year Project
                  </p>
                </div>
                <p className="text-sm leading-relaxed">
                  This project demonstrates the integration of modern web technologies, including React, Tailwind CSS, and the Gemini AI API, to build a practical, real-world application that helps job seekers improve their chances of success.
                </p>
              </div>
              <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowInfo(false)}
                  className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-xl font-bold transition-colors shadow-md"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
