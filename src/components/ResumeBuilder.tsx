import React, { useState, useRef, useEffect } from 'react';
import { Download, Plus, Trash2, Bold, Italic, Underline, LayoutTemplate, XCircle } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { motion, AnimatePresence } from 'motion/react';

import { ImprovedResumeData } from '../services/gemini';

interface LinkItem {
  label: string;
  url: string;
}

interface Experience {
  company: string;
  role: string;
  duration: string;
  description: string;
}

interface Education {
  school: string;
  degree: string;
  year: string;
}

interface Project {
  name: string;
  description: string;
  link: string;
}

function RichInput({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current && editorRef.current) {
      editorRef.current.innerHTML = value;
      isInitialMount.current = false;
    }
  }, [value]);

  const handleCommand = (command: string) => {
    document.execCommand(command, false, undefined);
    editorRef.current?.focus();
    onChange(editorRef.current?.innerHTML || '');
  };

  return (
    <div className="border border-zinc-200/50 dark:border-zinc-700/50 rounded-xl overflow-hidden bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm transition-all focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent">
      <div className="flex items-center gap-1 p-2 border-b border-zinc-200/50 dark:border-zinc-700/50 bg-zinc-50/50 dark:bg-zinc-800/50">
        <button
          type="button"
          onClick={() => handleCommand('bold')}
          className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleCommand('italic')}
          className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-600 mx-1" />
        <button
          type="button"
          onClick={() => handleCommand('underline')}
          className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        className="p-3 min-h-[100px] text-sm text-zinc-900 dark:text-zinc-100 outline-none prose dark:prose-invert max-w-none prose-sm prose-p:my-1 prose-ul:my-1 prose-li:my-0 focus:bg-white/80 dark:focus:bg-zinc-900/80 transition-colors text-left"
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        onBlur={(e) => onChange(e.currentTarget.innerHTML)}
        style={{ whiteSpace: 'pre-wrap' }}
      />
    </div>
  );
}

export function ResumeBuilder({ initialData }: { initialData?: ImprovedResumeData | null }) {
  const resumeRef = useRef<HTMLDivElement>(null);

  const [template, setTemplate] = useState<'modern' | 'simple' | 'professional'>('professional');
  const [name, setName] = useState('John Doe');
  const [profession, setProfession] = useState('Software Engineer');
  const [email, setEmail] = useState('john@example.com');
  const [phone, setPhone] = useState('(555) 123-4567');
  const [links, setLinks] = useState<LinkItem[]>([{ label: 'LinkedIn', url: 'https://linkedin.com' }]);
  
  const [summary, setSummary] = useState('Experienced software engineer with a passion for building scalable web applications.');
  
  const [skills, setSkills] = useState<string[]>(['JavaScript', 'React', 'Node.js', 'TypeScript']);
  const [newSkill, setNewSkill] = useState('');
  
  const [isFresher, setIsFresher] = useState(false);
  const [experience, setExperience] = useState<Experience[]>([
    { company: 'Tech Corp', role: 'Senior Developer', duration: '2020 - Present', description: 'Led a team of 5 developers to build a new SaaS product.' }
  ]);
  
  const [education, setEducation] = useState<Education[]>([
    { school: 'University of Technology', degree: 'B.S. Computer Science', year: '2019' }
  ]);

  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setProfession(initialData.profession || '');
      setEmail(initialData.email || '');
      setPhone(initialData.phone || '');
      setSummary(initialData.summary || '');
      setSkills(initialData.skills || []);
      setExperience(initialData.experience || []);
      setEducation(initialData.education || []);
      setProjects(initialData.projects || []);
      if (initialData.experience && initialData.experience.length > 0) {
        setIsFresher(false);
      }
    }
  }, [initialData]);

  const handleDownloadPDF = () => {
    if (!resumeRef.current) return;
    
    const element = resumeRef.current;
    const opt = {
      margin: 0,
      filename: `${name.replace(/\s+/g, '_')}_Resume.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save();
  };

  const addLink = () => { if (links.length < 5) setLinks([...links, { label: '', url: '' }]); };
  const updateLink = (index: number, field: keyof LinkItem, value: string) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };
  const removeLink = (index: number) => setLinks(links.filter((_, i) => i !== index));

  const addSkill = () => {
    if (newSkill.trim() && skills.length < 10) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };
  const removeSkill = (index: number) => setSkills(skills.filter((_, i) => i !== index));

  const addExperience = () => { if (experience.length < 4) setExperience([...experience, { company: '', role: '', duration: '', description: '' }]); };
  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const newExp = [...experience];
    newExp[index][field] = value;
    setExperience(newExp);
  };
  const removeExperience = (index: number) => setExperience(experience.filter((_, i) => i !== index));

  const addEducation = () => { if (education.length < 4) setEducation([...education, { school: '', degree: '', year: '' }]); };
  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const newEdu = [...education];
    newEdu[index][field] = value;
    setEducation(newEdu);
  };
  const removeEducation = (index: number) => setEducation(education.filter((_, i) => i !== index));

  const addProject = () => { if (projects.length < 4) setProjects([...projects, { name: '', description: '', link: '' }]); };
  const updateProject = (index: number, field: keyof Project, value: string) => {
    const newProj = [...projects];
    newProj[index][field] = value;
    setProjects(newProj);
  };
  const removeProject = (index: number) => setProjects(projects.filter((_, i) => i !== index));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
      {/* Left Column: Editor */}
      <div className="space-y-6 glass-card px-4 sm:px-6 pb-4 sm:pb-6 pt-0 rounded-3xl h-[60vh] lg:h-[80vh] overflow-y-auto custom-scrollbar transition-colors duration-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center sticky top-0 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md pt-4 sm:pt-6 pb-4 z-10 border-b border-zinc-200/50 dark:border-zinc-700/50 gap-4 -mx-4 sm:-mx-6 px-4 sm:px-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Resume Builder</h2>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownloadPDF}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg hover:shadow-emerald-500/25"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </motion.button>
        </div>

        <div className="space-y-6">
          {/* Template Selection */}
          <div className="glass-panel p-5 rounded-2xl">
            <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 border-b border-zinc-200/50 dark:border-zinc-700/50 pb-2 flex items-center">
              <LayoutTemplate className="w-4 h-4 mr-2 text-emerald-500" /> Template
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4">
              {['modern', 'simple', 'professional'].map((t) => (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  key={t}
                  onClick={() => setTemplate(t as any)}
                  className={`p-3 rounded-xl border-2 text-sm font-medium capitalize transition-all ${template === t ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shadow-sm' : 'border-zinc-200/50 dark:border-zinc-700/50 text-zinc-600 dark:text-zinc-400 hover:border-emerald-300 dark:hover:border-emerald-700 bg-white/50 dark:bg-zinc-800/50'}`}
                >
                  {t}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Personal Info */}
          <div className="glass-panel p-5 rounded-2xl">
            <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 border-b border-zinc-200/50 dark:border-zinc-700/50 pb-2">Personal Info</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2.5 border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none backdrop-blur-sm transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Profession</label>
                <input type="text" value={profession} onChange={e => setProfession(e.target.value)} className="w-full p-2.5 border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none backdrop-blur-sm transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2.5 border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none backdrop-blur-sm transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Phone</label>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2.5 border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none backdrop-blur-sm transition-all" />
              </div>
            </div>
            
            <div className="mt-5 space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">Links (Max 5)</label>
                {links.length < 5 && (
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addLink} 
                    className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Link
                  </motion.button>
                )}
              </div>
              <AnimatePresence mode="popLayout">
                {links.map((link, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col sm:flex-row gap-2 items-start sm:items-center overflow-hidden relative pr-8 sm:pr-0"
                  >
                    <input type="text" placeholder="Label (e.g. LinkedIn)" value={link.label} onChange={e => updateLink(i, 'label', e.target.value)} className="w-full sm:w-1/3 p-2.5 border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none backdrop-blur-sm transition-all" />
                    <input type="text" placeholder="URL" value={link.url} onChange={e => updateLink(i, 'url', e.target.value)} className="w-full sm:flex-1 p-2.5 border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none backdrop-blur-sm transition-all" />
                    <button onClick={() => removeLink(i)} className="absolute top-1 right-1 sm:static p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Summary */}
          <div className="glass-panel p-5 rounded-2xl">
            <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 border-b border-zinc-200/50 dark:border-zinc-700/50 pb-2 mb-4">Professional Summary</h3>
            <RichInput value={summary} onChange={setSummary} />
          </div>

          {/* Skills */}
          <div className="glass-panel p-5 rounded-2xl">
            <div className="flex justify-between items-center border-b border-zinc-200/50 dark:border-zinc-700/50 pb-2 mb-4">
              <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">Skills (Max 10)</h3>
            </div>
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                placeholder="Add a skill..." 
                value={newSkill} 
                onChange={e => setNewSkill(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSkill()}
                className="flex-1 p-2.5 border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none backdrop-blur-sm transition-all" 
              />
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addSkill} 
                disabled={skills.length >= 10} 
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors shadow-sm"
              >
                Add
              </motion.button>
            </div>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence mode="popLayout">
                {skills.map((skill, i) => (
                  <motion.span 
                    key={i} 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-sm"
                  >
                    {skill}
                    <button onClick={() => removeSkill(i)} className="ml-2 text-zinc-400 hover:text-red-500 transition-colors"><XCircle className="w-3.5 h-3.5" /></button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Experience */}
          <div className="glass-panel p-5 rounded-2xl">
            <div className="flex justify-between items-center border-b border-zinc-200/50 dark:border-zinc-700/50 pb-2 mb-4">
              <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-4">
                Experience
                <label className="flex items-center text-sm font-normal text-zinc-600 dark:text-zinc-400 cursor-pointer bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                  <input type="checkbox" checked={isFresher} onChange={e => setIsFresher(e.target.checked)} className="mr-2 rounded text-emerald-600 focus:ring-emerald-500" />
                  I am a Fresher
                </label>
              </h3>
              {!isFresher && experience.length < 4 && (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addExperience} 
                  className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md"
                >
                  <Plus className="w-3 h-3 mr-1" /> Add Experience
                </motion.button>
              )}
            </div>
            
            {!isFresher && (
              <AnimatePresence mode="popLayout">
                {experience.map((exp, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3 p-5 bg-white/40 dark:bg-zinc-900/40 rounded-xl border border-zinc-200/50 dark:border-zinc-700/50 relative backdrop-blur-sm overflow-hidden"
                  >
                    <button onClick={() => removeExperience(i)} className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-8">
                      <input type="text" placeholder="Company" value={exp.company} onChange={e => updateExperience(i, 'company', e.target.value)} className="w-full p-2.5 border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                      <input type="text" placeholder="Role" value={exp.role} onChange={e => updateExperience(i, 'role', e.target.value)} className="w-full p-2.5 border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                      <input type="text" placeholder="Duration (e.g. 2020 - Present)" value={exp.duration} onChange={e => updateExperience(i, 'duration', e.target.value)} className="sm:col-span-2 w-full p-2.5 border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                    </div>
                    <RichInput value={exp.description} onChange={(v) => updateExperience(i, 'description', v)} />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Education */}
          <div className="glass-panel p-5 rounded-2xl">
            <div className="flex justify-between items-center border-b border-zinc-200/50 dark:border-zinc-700/50 pb-2 mb-4">
              <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">Education</h3>
              {education.length < 4 && (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addEducation} 
                  className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md"
                >
                  <Plus className="w-3 h-3 mr-1" /> Add Education
                </motion.button>
              )}
            </div>
            <AnimatePresence mode="popLayout">
              {education.map((edu, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start sm:items-center relative pr-8 sm:pr-0 bg-white/40 dark:bg-zinc-900/40 p-3 rounded-xl border border-zinc-200/50 dark:border-zinc-700/50 backdrop-blur-sm overflow-hidden"
                >
                  <input type="text" placeholder="School/University" value={edu.school} onChange={e => updateEducation(i, 'school', e.target.value)} className="sm:col-span-5 p-2.5 border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                  <input type="text" placeholder="Degree" value={edu.degree} onChange={e => updateEducation(i, 'degree', e.target.value)} className="sm:col-span-4 p-2.5 border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                  <input type="text" placeholder="Year" value={edu.year} onChange={e => updateEducation(i, 'year', e.target.value)} className="sm:col-span-2 p-2.5 border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                  <button onClick={() => removeEducation(i)} className="absolute top-3 right-2 sm:static sm:col-span-1 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg flex justify-center transition-colors"><Trash2 className="w-4 h-4" /></button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Projects */}
          <div className="glass-panel p-5 rounded-2xl">
            <div className="flex justify-between items-center border-b border-zinc-200/50 dark:border-zinc-700/50 pb-2 mb-4">
              <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">Projects (Optional)</h3>
              {projects.length < 4 && (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addProject} 
                  className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md"
                >
                  <Plus className="w-3 h-3 mr-1" /> Add Project
                </motion.button>
              )}
            </div>
            <AnimatePresence mode="popLayout">
              {projects.map((proj, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3 p-5 bg-white/40 dark:bg-zinc-900/40 rounded-xl border border-zinc-200/50 dark:border-zinc-700/50 relative backdrop-blur-sm overflow-hidden"
                >
                  <button onClick={() => removeProject(i)} className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-8">
                    <input type="text" placeholder="Project Name" value={proj.name} onChange={e => updateProject(i, 'name', e.target.value)} className="w-full p-2.5 border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                    <input type="text" placeholder="Link (Optional)" value={proj.link} onChange={e => updateProject(i, 'link', e.target.value)} className="w-full p-2.5 border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                  </div>
                  <RichInput value={proj.description} onChange={(v) => updateProject(i, 'description', v)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Right Column: Preview (A4 Size) */}
      <div className="glass-card p-2 sm:p-4 rounded-3xl overflow-auto custom-scrollbar flex justify-start sm:justify-center h-[60vh] lg:h-[80vh] items-start">
        <div className="origin-top-left sm:origin-top transform max-[400px]:scale-[0.35] scale-[0.45] sm:scale-[0.65] md:scale-[0.75] lg:scale-[0.6] xl:scale-[0.75] transition-all duration-300" style={{ marginBottom: '-50%' }}>
          <div 
            ref={resumeRef} 
            className="bg-white shadow-xl flex-shrink-0 text-left"
            style={{ width: '210mm', minHeight: '297mm', padding: '20mm', boxSizing: 'border-box' }}
          >
          {template === 'simple' && (
            <div className="text-zinc-900 font-sans">
              <div className="text-center mb-6 border-b-2 border-zinc-800 pb-4">
                <h1 className="text-3xl font-bold uppercase tracking-wider mb-1">{name}</h1>
                <p className="text-lg text-zinc-600 mb-2">{profession}</p>
                <div className="text-sm text-zinc-500 flex flex-wrap justify-center gap-3">
                  <span>{email}</span> • <span>{phone}</span>
                  {links.map((l, i) => (
                    <span key={i}>• <a href={l.url} className="text-blue-600 hover:underline">{l.label}</a></span>
                  ))}
                </div>
              </div>
              
              {summary && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold uppercase tracking-wider border-b border-zinc-300 mb-2 pb-1">Summary</h2>
                  <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: summary }} />
                </div>
              )}

              {skills.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold uppercase tracking-wider border-b border-zinc-300 mb-2 pb-1">Skills</h2>
                  <ul className="grid grid-cols-4 gap-x-4 gap-y-1 text-sm list-disc pl-4">
                    {skills.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-lg font-bold uppercase tracking-wider border-b border-zinc-300 mb-2 pb-1">Experience</h2>
                {isFresher ? (
                  <div className="text-sm"><p className="font-semibold">Fresher</p><p className="text-zinc-600">Seeking entry-level opportunities to apply academic knowledge and grow professionally.</p></div>
                ) : (
                  experience.map((exp, i) => (
                    <div key={i} className="mb-4 text-sm">
                      <div className="flex justify-between font-bold">
                        <span>{exp.role}</span>
                        <span>{exp.duration}</span>
                      </div>
                      <div className="text-zinc-600 font-medium mb-1">{exp.company}</div>
                      <div className="leading-relaxed" dangerouslySetInnerHTML={{ __html: exp.description }} />
                    </div>
                  ))
                )}
              </div>

              {education.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold uppercase tracking-wider border-b border-zinc-300 mb-2 pb-1">Education</h2>
                  {education.map((edu, i) => (
                    <div key={i} className="mb-2 text-sm flex justify-between">
                      <div>
                        <span className="font-bold">{edu.degree}</span>
                        <div className="text-zinc-600">{edu.school}</div>
                      </div>
                      <span className="font-bold">{edu.year}</span>
                    </div>
                  ))}
                </div>
              )}

              {projects.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold uppercase tracking-wider border-b border-zinc-300 mb-2 pb-1">Projects</h2>
                  {projects.map((proj, i) => (
                    <div key={i} className="mb-3 text-sm">
                      <div className="font-bold">
                        {proj.name} {proj.link && <a href={proj.link} className="text-blue-600 font-normal ml-2 hover:underline">Link</a>}
                      </div>
                      <div className="leading-relaxed mt-1" dangerouslySetInnerHTML={{ __html: proj.description }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {template === 'professional' && (
            <div className="text-zinc-900 font-serif">
              <div className="mb-6 border-b-4 border-double border-zinc-800 pb-4">
                <h1 className="text-4xl font-bold mb-1">{name}</h1>
                <p className="text-xl text-zinc-700 italic mb-2">{profession}</p>
                <div className="text-sm text-zinc-600 flex flex-wrap gap-4">
                  <span>{email}</span> | <span>{phone}</span>
                  {links.map((l, i) => (
                    <span key={i}>| <a href={l.url} className="text-blue-800 hover:underline">{l.label}</a></span>
                  ))}
                </div>
              </div>
              
              {summary && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold border-b border-zinc-400 mb-3 pb-1 uppercase tracking-widest text-zinc-800">Professional Summary</h2>
                  <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: summary }} />
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-xl font-bold border-b border-zinc-400 mb-3 pb-1 uppercase tracking-widest text-zinc-800">Professional Experience</h2>
                {isFresher ? (
                  <div className="text-sm"><p className="font-bold">Entry Level Candidate</p><p className="text-zinc-700 mt-1">Eager to leverage academic foundation in a professional environment.</p></div>
                ) : (
                  experience.map((exp, i) => (
                    <div key={i} className="mb-5 text-sm">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="font-bold text-base">{exp.role}</span>
                        <span className="font-bold text-zinc-600">{exp.duration}</span>
                      </div>
                      <div className="text-zinc-700 italic mb-2">{exp.company}</div>
                      <div className="leading-relaxed" dangerouslySetInnerHTML={{ __html: exp.description }} />
                    </div>
                  ))
                )}
              </div>

              {skills.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold border-b border-zinc-400 mb-3 pb-1 uppercase tracking-widest text-zinc-800">Core Competencies</h2>
                  <ul className="grid grid-cols-4 gap-x-4 gap-y-2 text-sm list-disc pl-5">
                    {skills.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}

              {education.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold border-b border-zinc-400 mb-3 pb-1 uppercase tracking-widest text-zinc-800">Education</h2>
                  {education.map((edu, i) => (
                    <div key={i} className="mb-3 text-sm flex justify-between items-baseline">
                      <div>
                        <span className="font-bold text-base">{edu.school}</span>
                        <div className="text-zinc-700">{edu.degree}</div>
                      </div>
                      <span className="font-bold text-zinc-600">{edu.year}</span>
                    </div>
                  ))}
                </div>
              )}

              {projects.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold border-b border-zinc-400 mb-3 pb-1 uppercase tracking-widest text-zinc-800">Key Projects</h2>
                  {projects.map((proj, i) => (
                    <div key={i} className="mb-4 text-sm">
                      <div className="font-bold text-base">
                        {proj.name} {proj.link && <a href={proj.link} className="text-blue-800 text-sm font-normal ml-2 hover:underline">[{proj.link}]</a>}
                      </div>
                      <div className="leading-relaxed mt-1" dangerouslySetInnerHTML={{ __html: proj.description }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {template === 'modern' && (
            <div className="text-zinc-800 font-sans flex h-full min-h-full">
              {/* Left Sidebar */}
              <div className="w-1/3 bg-zinc-100 p-6 -ml-[20mm] -my-[20mm] mr-6">
                <h1 className="text-3xl font-black text-zinc-900 mb-2 leading-tight">{name}</h1>
                <p className="text-lg text-emerald-600 font-medium mb-8">{profession}</p>
                
                <div className="mb-8 space-y-3 text-sm">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Contact</h3>
                  <p className="break-all">{email}</p>
                  <p>{phone}</p>
                  {links.map((l, i) => (
                    <p key={i}><a href={l.url} className="text-emerald-600 hover:underline break-all">{l.label}</a></p>
                  ))}
                </div>

                {skills.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Skills</h3>
                    <div className="flex flex-col gap-2 text-sm">
                      {skills.map((s, i) => (
                        <span key={i} className="bg-white px-3 py-1.5 rounded-md shadow-sm border border-zinc-200 font-medium">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {education.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Education</h3>
                    {education.map((edu, i) => (
                      <div key={i} className="mb-4 text-sm">
                        <div className="font-bold text-zinc-900">{edu.degree}</div>
                        <div className="text-zinc-600 mt-1">{edu.school}</div>
                        <div className="text-zinc-400 text-xs mt-1">{edu.year}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Content */}
              <div className="w-2/3 py-2">
                {summary && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-zinc-900 mb-3 flex items-center">
                      <span className="w-8 h-1 bg-emerald-600 mr-3 inline-block"></span> Profile
                    </h2>
                    <div className="text-sm leading-relaxed text-zinc-600" dangerouslySetInnerHTML={{ __html: summary }} />
                  </div>
                )}

                <div className="mb-8">
                  <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center">
                    <span className="w-8 h-1 bg-emerald-600 mr-3 inline-block"></span> Experience
                  </h2>
                  {isFresher ? (
                    <div className="text-sm"><p className="font-bold text-zinc-900">Fresher</p><p className="text-zinc-600 mt-2">Ready to start my professional journey and contribute to a dynamic team.</p></div>
                  ) : (
                    experience.map((exp, i) => (
                      <div key={i} className="mb-6 text-sm relative pl-4 border-l-2 border-zinc-200">
                        <div className="absolute w-3 h-3 bg-emerald-600 rounded-full -left-[7px] top-1.5 border-4 border-white"></div>
                        <div className="font-bold text-zinc-900 text-base">{exp.role}</div>
                        <div className="text-emerald-600 font-medium mb-1">{exp.company} <span className="text-zinc-400 font-normal ml-2 text-xs">{exp.duration}</span></div>
                        <div className="leading-relaxed text-zinc-600 mt-2" dangerouslySetInnerHTML={{ __html: exp.description }} />
                      </div>
                    ))
                  )}
                </div>

                {projects.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center">
                      <span className="w-8 h-1 bg-emerald-600 mr-3 inline-block"></span> Projects
                    </h2>
                    {projects.map((proj, i) => (
                      <div key={i} className="mb-5 text-sm">
                        <div className="font-bold text-zinc-900 text-base">
                          {proj.name} {proj.link && <a href={proj.link} className="text-emerald-600 text-sm font-normal ml-2 hover:underline">View Project</a>}
                        </div>
                        <div className="leading-relaxed text-zinc-600 mt-2" dangerouslySetInnerHTML={{ __html: proj.description }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
