import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Download, Plus, Trash2 } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

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

export function ResumeBuilder({ onNavigateToPricing }: { onNavigateToPricing?: () => void }) {
  const { profile } = useAuth();
  const resumeRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john@example.com');
  const [phone, setPhone] = useState('(555) 123-4567');
  const [summary, setSummary] = useState('Experienced software engineer with a passion for building scalable web applications.');
  const [skills, setSkills] = useState('JavaScript, React, Node.js, TypeScript, SQL');
  
  const [experience, setExperience] = useState<Experience[]>([
    { company: 'Tech Corp', role: 'Senior Developer', duration: '2020 - Present', description: 'Led a team of 5 developers to build a new SaaS product.' }
  ]);
  
  const [education, setEducation] = useState<Education[]>([
    { school: 'University of Technology', degree: 'B.S. Computer Science', year: '2019' }
  ]);

  const handleDownloadPDF = () => {
    if (profile?.tier === 'free') {
      alert('Downloading PDF is a Pro feature. Please upgrade to Pro.');
      if (onNavigateToPricing) {
        onNavigateToPricing();
      }
      return;
    }

    if (!resumeRef.current) return;
    
    const element = resumeRef.current;
    const opt = {
      margin: 0.5,
      filename: `${name.replace(/\s+/g, '_')}_Resume.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
      {/* Left Column: Editor */}
      <div className="space-y-6 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 h-[80vh] overflow-y-auto transition-colors duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Resume Builder</h2>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2">Personal Info</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-colors" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Phone</label>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-colors" />
            </div>
          </div>

          <h3 className="font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 mt-6">Professional Summary</h3>
          <textarea value={summary} onChange={e => setSummary(e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg text-sm h-24 focus:ring-2 focus:ring-indigo-500 outline-none transition-colors" />

          <h3 className="font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 mt-6">Skills (comma separated)</h3>
          <input type="text" value={skills} onChange={e => setSkills(e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-colors" />

          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2 mt-6">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Experience</h3>
            <button 
              onClick={() => setExperience([...experience, { company: '', role: '', duration: '', description: '' }])}
              className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center hover:text-indigo-800 dark:hover:text-indigo-300"
            >
              <Plus className="w-3 h-3 mr-1" /> Add
            </button>
          </div>
          {experience.map((exp, i) => (
            <div key={i} className="space-y-2 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg relative border border-slate-100 dark:border-slate-700/50">
              <button onClick={() => setExperience(experience.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 text-red-500 hover:text-red-700 dark:hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
              <input placeholder="Company" value={exp.company} onChange={e => { const newExp = [...experience]; newExp[i].company = e.target.value; setExperience(newExp); }} className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-colors" />
              <input placeholder="Role" value={exp.role} onChange={e => { const newExp = [...experience]; newExp[i].role = e.target.value; setExperience(newExp); }} className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-colors" />
              <input placeholder="Duration (e.g. 2020 - Present)" value={exp.duration} onChange={e => { const newExp = [...experience]; newExp[i].duration = e.target.value; setExperience(newExp); }} className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-colors" />
              <textarea placeholder="Description" value={exp.description} onChange={e => { const newExp = [...experience]; newExp[i].description = e.target.value; setExperience(newExp); }} className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg text-sm h-20 focus:ring-2 focus:ring-indigo-500 outline-none transition-colors" />
            </div>
          ))}

          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2 mt-6">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Education</h3>
            <button 
              onClick={() => setEducation([...education, { school: '', degree: '', year: '' }])}
              className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center hover:text-indigo-800 dark:hover:text-indigo-300"
            >
              <Plus className="w-3 h-3 mr-1" /> Add
            </button>
          </div>
          {education.map((edu, i) => (
            <div key={i} className="space-y-2 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg relative border border-slate-100 dark:border-slate-700/50">
              <button onClick={() => setEducation(education.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 text-red-500 hover:text-red-700 dark:hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
              <input placeholder="School" value={edu.school} onChange={e => { const newEdu = [...education]; newEdu[i].school = e.target.value; setEducation(newEdu); }} className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-colors" />
              <input placeholder="Degree" value={edu.degree} onChange={e => { const newEdu = [...education]; newEdu[i].degree = e.target.value; setEducation(newEdu); }} className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-colors" />
              <input placeholder="Year" value={edu.year} onChange={e => { const newEdu = [...education]; newEdu[i].year = e.target.value; setEducation(newEdu); }} className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-colors" />
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Preview */}
      <div className="bg-slate-200 dark:bg-slate-900 p-8 rounded-2xl flex justify-center overflow-y-auto h-[80vh] transition-colors duration-200">
        <div 
          ref={resumeRef} 
          className="bg-white w-[8.5in] min-h-[11in] p-10 shadow-lg text-slate-900 font-sans"
          style={{ boxSizing: 'border-box' }}
        >
          <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
            <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">{name || 'Your Name'}</h1>
            <div className="text-sm text-slate-600 flex justify-center space-x-4">
              <span>{email || 'email@example.com'}</span>
              <span>•</span>
              <span>{phone || '(555) 555-5555'}</span>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-bold uppercase tracking-wider border-b border-slate-300 mb-2 text-slate-800">Professional Summary</h2>
            <p className="text-sm leading-relaxed text-slate-700">{summary}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-bold uppercase tracking-wider border-b border-slate-300 mb-2 text-slate-800">Skills</h2>
            <p className="text-sm leading-relaxed text-slate-700">{skills}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-bold uppercase tracking-wider border-b border-slate-300 mb-4 text-slate-800">Experience</h2>
            <div className="space-y-4">
              {experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-slate-800">{exp.role}</h3>
                    <span className="text-sm font-medium text-slate-600">{exp.duration}</span>
                  </div>
                  <div className="text-sm font-semibold text-indigo-700 mb-2">{exp.company}</div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-bold uppercase tracking-wider border-b border-slate-300 mb-4 text-slate-800">Education</h2>
            <div className="space-y-4">
              {education.map((edu, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-slate-800">{edu.school}</h3>
                    <span className="text-sm font-medium text-slate-600">{edu.year}</span>
                  </div>
                  <div className="text-sm text-slate-700">{edu.degree}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
