import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Download, 
  CheckCircle2, 
  Briefcase, 
  GraduationCap, 
  User, 
  Wand2, 
  Trophy,
  Github,
  Linkedin,
  Globe,
  FileText,
  Zap,
  ShieldCheck,
  Eye,
  Settings,
  RefreshCcw,
  X,
  Menu,
  Check,
  Maximize2,
  Layout,
  Heart,
  Info,
  ExternalLink,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Award
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import html2pdf from 'html2pdf.js';
import { GoogleGenAI, Type } from "@google/genai";

// --- Types & Interfaces ---

interface Education {
  id: string;
  school: string;
  degree: string;
  major: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa: string;
  activities: string;
}

interface Experience {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  bullets: string[];
}

interface Skill {
  id: string;
  category: string;
  items: string;
}

interface Project {
  id: string;
  name: string;
  technologies: string;
  link: string;
  bullets: string[];
}

interface ResumeData {
  personalInfo: {
    fullName: string;
    headline: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    portfolio: string;
    summary: string;
  };
  education: Education[];
  experience: Experience[];
  skills: Skill[];
  projects: Project[];
  templateId: 'standard' | 'classic' | 'tech' | 'executive';
}

// --- Constants & Defaults ---

const INITIAL_DATA: ResumeData = {
  personalInfo: {
    fullName: '',
    headline: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
    summary: '',
  },
  education: [],
  experience: [],
  skills: [],
  projects: [],
  templateId: 'standard',
};

const SAMPLE_DATA: ResumeData = {
  personalInfo: {
    fullName: 'RAHUL S',
    headline: 'Civil Engineering Student | Technical Presenter | Fitness-Oriented Learner',
    title: 'Civil Engineer',
    email: 'rahulcvfiitjee@gmail.com',
    phone: '+91 7305169964',
    location: 'Chennai, India',
    linkedin: 'linkedin.com/in/rahulshyamcivil',
    github: 'github.com/rahulcvwebsitehosting',
    portfolio: '',
    summary: 'Second-year Civil Engineering undergraduate at ESEC with a passion for sustainable infrastructure and technical communication. Delivered seminars in 15+ colleges, focusing on emerging engineering technologies. Dedicated to physical discipline and structured academic excellence.',
  },
  education: [
    {
      id: 'sample-edu-1',
      school: 'Erode Sengunthar Engineering College (ESEC)',
      degree: 'Bachelor of Engineering in Civil Engineering',
      major: '',
      location: 'Erode, India',
      startDate: '2022',
      endDate: 'Expected June 2028',
      gpa: '',
      activities: 'Technical Presenter, Seminar Organizer'
    }
  ],
  experience: [
    {
      id: 'sample-exp-1',
      company: 'Technical Symposiums',
      title: 'Technical Presenter',
      location: 'Various Colleges (15+)',
      startDate: '2023',
      endDate: 'Present',
      isCurrent: true,
      bullets: [
        'Presented technical seminars on infrastructure development and future engineering trends across 15+ educational institutions.',
        'Facilitated academic clarity through structured note preparation and prototype demonstrations.',
        'Improved public speaking confidence and communication efficiency through regular inter-collegiate participation.'
      ]
    },
    {
      id: 'sample-exp-2',
      company: 'Physical Training',
      title: 'Fitness Practitioner',
      location: 'Local Gym',
      startDate: 'Nov 2023',
      endDate: 'Present',
      isCurrent: true,
      bullets: [
        'Maintaining a 6-day weekly training schedule focusing on strength and physical discipline.',
        'Adhering to a structured vegetarian diet to support performance and recovery.',
        'Developing mental consistency and self-development habits through rigorous gym conditioning.'
      ]
    }
  ],
  skills: [
    { id: 'sample-s1', category: 'Technical', items: 'Civil Engineering Fundamentals, Seminar Presentations, Python (Structured Programs).' },
    { id: 'sample-s2', category: 'Personal', items: 'Public Speaking, Consistency, Discipline, English Communication, Technical Note Preparation.' }
  ],
  projects: [
    {
      id: 'sample-p1',
      name: 'CERTIFICATIONS & TRAINING',
      technologies: '',
      link: '',
      bullets: [
        'Ground Improvement (NPTEL): Ongoing coursework focusing on soil stabilization and foundational geotechnical concepts.',
        'Emerging Technologies Seminar: Delivered a comprehensive session on future tech in civil infrastructure.'
      ]
    }
  ],
  templateId: 'standard',
};

const STEPS = [
  { id: 'personal', label: 'Identity', icon: User, tip: "Header: University standard requires 24-30pt bold name. Use city/state location only." },
  { id: 'education', label: 'Education', icon: GraduationCap, tip: "Harvard Rule: Reverse chronological. Always include degree and expected graduation month/year." },
  { id: 'experience', label: 'Experience', icon: Briefcase, tip: "Google XYZ Formula: Accomplished [X] as measured by [Y], by doing [Z]. Always use action verbs." },
  { id: 'skills', label: 'Technical', icon: FileText, tip: "Stanford Tip: Group skills by category (e.g., Software, Languages) for better ATS parsing." },
  { id: 'projects', label: 'Projects', icon: Layout, tip: "MIT Guideline: Highlight technical implementation details and specific project links." },
  { id: 'review', label: 'Audit', icon: CheckCircle2, tip: "Final Check: 1-page strict limit for <10 years experience. Consistent margins (0.5in - 1in)." },
];

const TEMPLATES = [
  { id: 'standard', name: 'Standard', desc: 'Ivy League compliant layout.', icon: Layout },
  { id: 'classic', name: 'Classic', desc: 'Traditional academic serif design.', icon: FileText },
  { id: 'tech', name: 'Tech', desc: 'Developer and engineering focus.', icon: Settings },
  { id: 'executive', name: 'Executive', desc: 'Leadership and impact focus.', icon: Trophy },
];

// --- Brand Components ---

const BrandLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M16 2H8C5.79086 2 4 3.79086 4 6V18C4 20.2091 5.79086 22 8 22H16C18.2091 22 20 20.2091 20 18V6C20 3.79086 18.2091 2 16 2Z" fill="currentColor" fillOpacity="0.1"/>
    <path d="M16 2H8C5.79086 2 4 3.79086 4 6V18C4 20.2091 5.79086 22 8 22H16C18.2091 22 20 20.2091 20 18V6C20 3.79086 18.2091 2 16 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 14H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 6H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="18" cy="18" r="4" fill="#6366F1"/>
    <path d="M16.5 18L17.5 19L19.5 17" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// --- AI Service ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function getAiImprovedBullet(bullet: string, context: string): Promise<string[]> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a career expert at Harvard Career Services. Improve this resume bullet using the Google XYZ formula and Stanford impact guidelines:
      "${bullet}"
      Current User Headline: ${context}
      Return 3 high-impact versions as a JSON array of strings under a "suggestions" key.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { suggestions: { type: Type.ARRAY, items: { type: Type.STRING } } }
        }
      }
    });
    const data = JSON.parse(response.text || '{"suggestions":[]}');
    return data.suggestions || [];
  } catch (error) {
    return ["Optimized workflow by 20% through automation.", "Led team of 5 in deploying cloud infrastructure.", "Reduced latency by 40% via database optimization."];
  }
}

// --- UI Components ---
const Input = ({ label, value, onChange, placeholder, type = "text", icon: Icon }: any) => (
  <div className="mb-4 group">
    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 group-focus-within:text-indigo-600">
      {Icon && <Icon size={12} className="inline mr-1"/>} {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-800 transition-all"
    />
  </div>
);

const TextArea = ({ label, value, onChange, placeholder, rows = 3 }: any) => (
  <div className="mb-4 group">
    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 group-focus-within:text-indigo-600">
      {label}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-800 resize-none transition-all"
    />
  </div>
);

// --- Resume Templates ---

const StandardProfessionalTemplate = ({ data }: { data: ResumeData }) => (
  <div className="p-[0.5in] h-full bg-white text-black leading-[1.2] flex flex-col overflow-hidden" style={{ fontFamily: '"Inter", "Arial", sans-serif', fontSize: '10pt' }}>
    <header className="text-center mb-4">
      <h1 className="text-[26pt] font-bold mb-1 tracking-tight">{data.personalInfo.fullName || 'YOUR NAME'}</h1>
      <div className="text-[9pt] flex justify-center gap-2 flex-wrap text-slate-600">
        <span>{data.personalInfo.location}</span> | <span>{data.personalInfo.phone}</span> | <span>{data.personalInfo.email}</span> | <span>{data.personalInfo.linkedin?.replace(/^https?:\/\//, '')}</span>
      </div>
    </header>
    <div className="space-y-4">
      {data.personalInfo.summary && (
        <section className="break-inside-avoid">
          <h2 className="text-[11pt] font-bold uppercase border-b border-black mb-1.5">Professional Summary</h2>
          <p className="text-justify leading-snug">{data.personalInfo.summary}</p>
        </section>
      )}
      {data.skills.length > 0 && (
        <section className="break-inside-avoid">
          <h2 className="text-[11pt] font-bold uppercase border-b border-black mb-1.5">Technical Skills</h2>
          <ul className="space-y-0.5">
            {data.skills.map(s => (
              <li key={s.id} className="flex gap-1.5">
                <span className="font-bold shrink-0">• {s.category}:</span>
                <span>{s.items}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      {data.education.length > 0 && (
        <section className="break-inside-avoid">
          <h2 className="text-[11pt] font-bold uppercase border-b border-black mb-1.5">Education</h2>
          <div className="space-y-2">
            {data.education.map(edu => (
              <div key={edu.id} className="break-inside-avoid">
                <div className="flex justify-between font-bold">
                  <span>{edu.school}</span>
                  <span>{edu.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="italic">{edu.degree}</span>
                  <span>{edu.endDate}</span>
                </div>
                {edu.activities && <p className="text-[9pt] text-slate-600 mt-0.5">{edu.activities}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
      {data.experience.length > 0 && (
        <section className="break-inside-avoid">
          <h2 className="text-[11pt] font-bold uppercase border-b border-black mb-1.5">Experience</h2>
          <div className="space-y-3">
            {data.experience.map(exp => (
              <div key={exp.id} className="break-inside-avoid">
                <div className="flex justify-between font-bold">
                  <span>{exp.company}</span>
                  <span>{exp.startDate}</span>
                </div>
                <div className="flex justify-between italic text-[9.5pt]">
                  <span>{exp.title}</span>
                  <span>{exp.location}</span>
                </div>
                <ul className="pl-4 mt-0.5 space-y-0.5">
                  {exp.bullets.map((b, i) => b && (
                    <li key={i} className="relative pl-3 break-inside-avoid">
                      <span className="absolute left-0">•</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
    <div className="mt-auto text-center text-[8pt] text-slate-400 pt-4">1</div>
  </div>
);

const ClassicTemplate = ({ data }: { data: ResumeData }) => (
  <div className="p-[0.5in_0.75in] h-full flex flex-col bg-white text-black leading-[1.5] overflow-hidden" style={{ fontFamily: '"Lora", serif', fontSize: '10.5pt' }}>
    <header className="text-center mb-6">
      <h1 className="text-[28pt] font-serif italic mb-1 uppercase tracking-wider">{data.personalInfo.fullName || 'YOUR NAME'}</h1>
      <div className="text-[9pt] flex justify-center gap-4 text-slate-500 italic flex-wrap">
        <span>{data.personalInfo.email}</span>
        <span>{data.personalInfo.phone}</span>
        <span>{data.personalInfo.location}</span>
      </div>
    </header>
    <main className="space-y-6">
      {data.experience.length > 0 && (
        <section>
          <h2 className="text-[12pt] font-bold uppercase border-b-2 border-slate-900 mb-3 tracking-widest">Experience</h2>
          {data.experience.map(exp => (
            <div key={exp.id} className="mb-4 break-inside-avoid">
              <div className="flex justify-between font-bold text-[11pt]">
                <span>{exp.company}</span>
                <span>{exp.startDate} – {exp.endDate || 'Present'}</span>
              </div>
              <p className="italic text-slate-600 mb-2">{exp.title}</p>
              <ul className="list-disc ml-5 space-y-1">
                {exp.bullets.map((b, i) => b && <li key={i} className="break-inside-avoid">{b}</li>)}
              </ul>
            </div>
          ))}
        </section>
      )}
    </main>
  </div>
);

const TechTemplate = ({ data }: { data: ResumeData }) => (
  <div className="p-10 h-full flex flex-col font-mono text-xs bg-white text-slate-900 overflow-hidden" style={{ fontFamily: '"Source Code Pro", monospace' }}>
    <header className="mb-8 border-b-4 border-slate-900 pb-4">
      <h1 className="text-4xl font-black tracking-tighter uppercase">{data.personalInfo.fullName || 'NAME_UNDEFINED'}</h1>
      <p className="text-blue-600 font-bold mt-1 uppercase tracking-tight">&gt; {data.personalInfo.headline || 'CORE_HEADLINE'}</p>
    </header>
    <div className="grid grid-cols-3 gap-8 overflow-hidden">
      <div className="col-span-2 space-y-8">
        <section>
          <h2 className="font-bold text-blue-600 mb-4 uppercase text-lg border-b border-blue-100">./EXPERIENCE</h2>
          {data.experience.map(exp => (
            <div key={exp.id} className="mb-6 break-inside-avoid">
              <div className="flex justify-between font-black text-sm">
                <span>{exp.company.toUpperCase()}</span>
                <span className="text-blue-500">[{exp.startDate}]</span>
              </div>
              <p className="text-slate-400 font-bold mb-2">// {exp.title.toUpperCase()}</p>
              <ul className="mt-2 space-y-2 text-[10px]">
                {exp.bullets.map((b, i) => b && (
                  <li key={i} className="flex gap-2 break-inside-avoid">
                    <span className="text-blue-600 shrink-0">$</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      </div>
      <div className="space-y-8">
        <section>
           <h2 className="font-bold text-blue-600 mb-4 uppercase text-lg border-b border-blue-100">./SKILLS</h2>
           {data.skills.map(s => (
             <div key={s.id} className="mb-4">
                <span className="opacity-40 block text-[8px] mb-1">[{s.category.toUpperCase()}]</span>
                <span className="font-medium text-[10px]">{s.items}</span>
             </div>
           ))}
        </section>
      </div>
    </div>
  </div>
);

const ExecutiveTemplate = ({ data }: { data: ResumeData }) => (
  <div className="p-12 h-full flex flex-col bg-white text-[#1F2937] overflow-hidden" style={{ fontFamily: '"Playfair Display", serif' }}>
    <header className="mb-12 text-center border-b-2 border-slate-100 pb-10">
      <h1 className="text-5xl font-black uppercase tracking-tight mb-4">{data.personalInfo.fullName || 'EXECUTIVE'}</h1>
      <div className="h-1.5 w-32 bg-[#2563EB] mx-auto mb-6" />
      <p className="text-2xl italic font-serif text-slate-500 max-w-2xl mx-auto">{data.personalInfo.headline}</p>
    </header>
    <div className="space-y-10">
      <section>
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-[#2563EB] mb-6 border-b-2 border-slate-50 pb-2">Experience</h2>
        {data.experience.map(exp => (
          <div key={exp.id} className="mb-8 break-inside-avoid">
            <div className="flex justify-between items-baseline mb-2">
              <h3 className="font-black text-xl uppercase tracking-tight">{exp.company}</h3>
              <span className="text-xs font-bold text-slate-300">{exp.startDate}</span>
            </div>
            <p className="text-md font-serif italic mb-4 text-[#2563EB]">{exp.title}</p>
            <ul className="list-none m-0 p-0 space-y-3">
              {exp.bullets.map((b, i) => b && <li key={i} className="text-sm leading-relaxed text-slate-600 relative pl-6"><span className="absolute left-0 top-2 w-1.5 h-1.5 bg-slate-200 rounded-full" />{b}</li>)}
            </ul>
          </div>
        ))}
      </section>
    </div>
  </div>
);

const ResumeRenderer = ({ data }: { data: ResumeData }) => {
    switch (data.templateId) {
        case 'standard': return <StandardProfessionalTemplate data={data} />;
        case 'classic': return <ClassicTemplate data={data} />;
        case 'tech': return <TechTemplate data={data} />;
        case 'executive': return <ExecutiveTemplate data={data} />;
        default: return <StandardProfessionalTemplate data={data} />;
    }
}

// --- Author Profile Page ---

const ProfilePage = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="min-h-screen bg-slate-50 pb-20 overflow-x-hidden">
      <nav className="h-16 md:h-20 bg-white/80 backdrop-blur-md sticky top-0 z-[100] px-4 md:px-10 flex justify-between items-center border-b border-slate-100">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="bg-[#1E293B] p-1.5 md:p-2.5 rounded-lg md:rounded-xl">
            <User className="text-white h-4 w-4 md:h-5 md:w-5" />
          </div>
          <span className="font-black text-lg md:text-xl tracking-tighter uppercase whitespace-nowrap">Author <span className="text-indigo-600">Profile</span></span>
        </div>
        <button onClick={onBack} className="text-slate-600 font-bold text-[9px] md:text-[10px] uppercase tracking-widest px-4 py-2 md:px-6 md:py-3 border border-slate-200 rounded-lg md:rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2">
          <ChevronLeft size={14} className="hidden xs:block"/> Back
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-4 md:px-10 pt-8 md:pt-16">
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 md:p-12 rounded-2xl md:rounded-[3rem] shadow-2xl shadow-indigo-100/50 mb-8 md:mb-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 text-slate-50 group-hover:text-indigo-50 transition-colors hidden md:block">
            <Layout size={200} strokeWidth={0.5} />
          </div>
          <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-[#1E293B] mb-4 md:mb-6">Rahul S</h1>
            <p className="text-xl md:text-2xl font-bold text-indigo-600 mb-6 md:mb-8 max-w-xl">Civil Engineering Student | Technical Presenter | Fitness-Oriented Learner</p>
            
            <div className="flex flex-wrap gap-4 md:gap-6 mb-8 md:mb-10">
              <a href="mailto:rahulcvfiitjee@gmail.com" className="flex items-center gap-2 text-slate-500 font-bold text-[10px] md:text-xs hover:text-indigo-600 transition-all">
                <Mail size={16} /> rahulcvfiitjee@gmail.com
              </a>
              <a href="tel:+917305169964" className="flex items-center gap-2 text-slate-500 font-bold text-[10px] md:text-xs hover:text-indigo-600 transition-all">
                <Phone size={16} /> +91 73051 69964
              </a>
              <span className="flex items-center gap-2 text-slate-500 font-bold text-[10px] md:text-xs">
                <MapPin size={16} /> India
              </span>
            </div>

            <div className="p-5 md:p-8 bg-slate-50 rounded-2xl md:rounded-3xl border border-slate-100">
              <h3 className="font-black text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-slate-400 mb-3 md:mb-4">About Me</h3>
              <p className="text-slate-600 font-medium leading-relaxed text-base md:text-lg italic">
                "I am a second-year Civil Engineering student at Erode Sengunthar Engineering College (ESEC). I have delivered technical presentations in more than 15 colleges and actively focus on improving my communication skills, academic clarity, and physical discipline."
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
          {/* Academic Section */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-8 md:space-y-12">
            <div className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] shadow-xl border border-slate-100">
              <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="bg-indigo-100 p-2 md:p-3 rounded-xl md:rounded-2xl text-indigo-600"><GraduationCap size={20}/></div>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">Academic Details</h2>
              </div>
              <ul className="space-y-4 md:space-y-6">
                <li className="flex flex-col gap-1">
                  <span className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest">Degree</span>
                  <span className="font-bold text-slate-700 text-base md:text-lg">B.E. Civil Engineering (Year 2)</span>
                </li>
                <li className="flex flex-col gap-1">
                  <span className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest">Institution</span>
                  <span className="font-bold text-slate-700 text-base md:text-lg">Erode Sengunthar Engineering College (ESEC)</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Skills & Fitness Section */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-8 md:space-y-12">
            <div className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] shadow-xl border border-slate-100">
              <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="bg-red-50 p-2 md:p-3 rounded-xl md:rounded-2xl text-red-500"><Heart size={20}/></div>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">Fitness Journey</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="bg-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl text-center">
                  <span className="block text-[8px] md:text-[10px] font-black text-slate-400 uppercase mb-1">Height</span>
                  <span className="font-black text-lg md:text-xl text-slate-700">155 cm</span>
                </div>
                <div className="bg-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl text-center">
                  <span className="block text-[8px] md:text-[10px] font-black text-slate-400 uppercase mb-1">Weight</span>
                  <span className="font-black text-lg md:text-xl text-slate-700">55 kg</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer Info */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-12 md:mt-20 pt-8 md:pt-10 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-10">
          <div className="flex gap-4 md:gap-8">
            <a href="https://linkedin.com/in/rahulshyamcivil/" target="_blank" className="bg-white p-3 md:p-4 rounded-xl md:rounded-2xl shadow-lg hover:shadow-indigo-100 transition-all border border-slate-100 text-[#0A66C2]">
              <Linkedin size={20}/>
            </a>
            <a href="https://github.com/rahulcvwebsitehosting" target="_blank" className="bg-white p-3 md:p-4 rounded-xl md:rounded-2xl shadow-lg hover:shadow-indigo-100 transition-all border border-slate-100 text-[#181717]">
              <Github size={20}/>
            </a>
          </div>
          
          <div className="text-center md:text-right">
             <p className="text-[10px] md:text-xs text-slate-400 font-medium">Content drafted with AI assistance. | ESEC Syllabus base.</p>
             <p className="text-[10px] md:text-xs text-slate-500 font-black mt-2 md:mt-4 uppercase">© Rahul S — All rights reserved.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// --- Main App ---

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [data, setData] = useState<ResumeData>(INITIAL_DATA);
  const [activeStep, setActiveStep] = useState(0);
  const [aiLoadingId, setAiLoadingId] = useState<string | null>(null);
  const [aiSuggestionsModal, setAiSuggestionsModal] = useState<{ original: string, items: string[], parentId: string, index: number, type: 'exp' | 'proj' } | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Handlers
  const handlePersonalInfo = (key: string, val: string) => setData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, [key]: val } }));
  
  const updateExperience = (id: string, updates: Partial<Experience>) => setData(prev => ({ ...prev, experience: prev.experience.map(e => e.id === id ? { ...e, ...updates } : e) }));
  
  const updateEducation = (id: string, updates: Partial<Education>) => setData(prev => ({ ...prev, education: prev.education.map(e => e.id === id ? { ...e, ...updates } : e) }));

  const updateSkills = (id: string, updates: Partial<Skill>) => setData(prev => ({ ...prev, skills: prev.skills.map(s => s.id === id ? { ...s, ...updates } : s) }));

  const updateProjects = (id: string, updates: Partial<Project>) => setData(prev => ({ ...prev, projects: prev.projects.map(p => p.id === id ? { ...p, ...updates } : p) }));

  const handleAiRewrite = async (text: string, id: string, type: 'exp' | 'proj', index: number) => {
    if (!text || text.length < 5) return;
    setAiLoadingId(`${id}-${index}`);
    const suggestions = await getAiImprovedBullet(text, `${data.personalInfo.headline}`);
    setAiSuggestionsModal({ original: text, items: suggestions, parentId: id, index, type });
    setAiLoadingId(null);
  };

  const applyAiSuggestion = (suggestion: string) => {
    if (!aiSuggestionsModal) return;
    const { parentId, index, type } = aiSuggestionsModal;
    if (type === 'exp') {
      const exp = data.experience.find(e => e.id === parentId);
      if (exp) {
        const newBullets = [...exp.bullets];
        newBullets[index] = suggestion;
        updateExperience(parentId, { bullets: newBullets });
      }
    } else {
      const proj = data.projects.find(p => p.id === parentId);
      if (proj) {
        const newBullets = [...proj.bullets];
        newBullets[index] = suggestion;
        updateProjects(parentId, { bullets: newBullets });
      }
    }
    setAiSuggestionsModal(null);
  };

  const handleFillSample = () => {
    setData(JSON.parse(JSON.stringify(SAMPLE_DATA)));
  };

  const triggerDownload = () => {
    const element = document.getElementById('printable-area');
    if (!element) return;
    
    const options = {
      margin: 0,
      filename: `${data.personalInfo.fullName.replace(/\s+/g, '_') || 'Resume'}_CVCraft_AI.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 3, useCORS: true, letterRendering: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().from(element).set(options).save();
  };

  if (showProfile) return <ProfilePage onBack={() => setShowProfile(false)} />;
  if (showLanding) return <LandingPage onStart={() => setShowLanding(false)} onProfile={() => setShowProfile(true)} />;

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden font-sans">
      <nav className="no-print h-16 md:h-20 bg-white sticky top-0 z-[60] px-4 md:px-10 flex justify-between items-center border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-3 cursor-pointer" onClick={() => setShowLanding(true)}>
          <div className="bg-[#1E293B] p-1.5 md:p-2.5 rounded-lg md:rounded-xl shadow-lg">
            <BrandLogo className="text-white h-4 w-4 md:h-5 md:w-5" />
          </div>
          <span className="font-black text-base md:text-xl tracking-tighter uppercase whitespace-nowrap">CVCraft<span className="text-indigo-600">AI</span></span>
        </div>
        <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar">
          <button onClick={() => setShowProfile(true)} className="flex items-center gap-1.5 text-slate-500 font-bold text-[9px] md:text-[10px] uppercase tracking-widest px-2 md:px-4 py-2 hover:bg-slate-50 rounded-lg transition-all whitespace-nowrap">
            <User size={14} /> <span className="hidden xs:inline">Profile</span>
          </button>
          <button onClick={handleFillSample} className="flex items-center gap-1.5 text-indigo-600 font-bold text-[9px] md:text-[10px] uppercase tracking-widest px-2 md:px-6 md:py-3 border border-indigo-100 rounded-lg md:rounded-xl hover:bg-indigo-50 transition-all whitespace-nowrap">
            <RefreshCcw size={14} /> <span className="hidden xs:inline">Sample</span>
          </button>
          <button onClick={triggerDownload} className="flex items-center gap-2 md:gap-3 bg-[#1E293B] text-white px-4 md:px-8 py-2 md:py-3 rounded-lg md:rounded-xl font-bold text-[9px] md:text-xs uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap">
            <Download size={16} /> <span className="hidden xs:inline">Download</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 flex overflow-hidden relative">
        {/* Desktop Sidebar / Mobile Bottom Nav */}
        <div className="no-print w-20 md:w-24 lg:w-72 bg-slate-50 border-r border-slate-100 flex flex-col py-4 md:py-8 overflow-y-auto hidden md:flex flex-shrink-0">
          {STEPS.map((step, idx) => (
            <button key={step.id} onClick={() => setActiveStep(idx)} className={`flex items-center gap-4 px-6 md:px-8 py-4 md:py-5 transition-all relative group ${activeStep === idx ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-900'}`}>
              {activeStep === idx && <div className="absolute left-0 top-3 bottom-3 w-1.5 bg-indigo-600 rounded-r-full" />}
              <div className={`p-2 md:p-2.5 rounded-lg md:rounded-xl transition-all ${activeStep === idx ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white border border-slate-200'}`}>
                <step.icon size={18} />
              </div>
              <div className="hidden lg:block text-left">
                <span className="font-bold text-xs tracking-tight uppercase">{step.label}</span>
              </div>
            </button>
          ))}
          <div className="mt-auto p-4 md:p-8 mx-2 md:mx-4 bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm mb-6 hidden lg:block">
             <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block mb-4">Template</span>
             <div className="space-y-2">
               {TEMPLATES.map(t => (
                 <button key={t.id} onClick={() => setData(prev => ({ ...prev, templateId: t.id as any }))} className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${data.templateId === t.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:bg-slate-50'}`}>
                   <t.icon size={14} className={data.templateId === t.id ? 'text-indigo-600' : 'text-slate-400'} />
                   <div className={`text-[10px] font-bold uppercase ${data.templateId === t.id ? 'text-indigo-700' : 'text-slate-600'}`}>{t.name}</div>
                 </button>
               ))}
             </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="no-print flex-1 bg-white overflow-y-auto px-4 md:px-12 lg:px-24 py-8 md:py-12 pb-32 md:pb-12">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key={activeStep} className="mb-12">
                <div className="bg-indigo-50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-indigo-100 flex gap-3 md:gap-4 items-start mb-8 md:mb-12">
                  <div className="bg-white p-2 md:p-3 rounded-lg md:rounded-xl shadow-sm text-indigo-600"><Wand2 size={20} className="md:w-6 md:h-6"/></div>
                  <div>
                    <h4 className="font-bold text-indigo-900 text-[10px] md:text-sm mb-0.5 md:mb-1 uppercase tracking-tight">University Insight</h4>
                    <p className="text-indigo-700/80 text-[10px] md:text-xs leading-relaxed">{STEPS[activeStep].tip}</p>
                  </div>
                </div>

                {activeStep === 0 && (
                  <div className="space-y-6 md:space-y-8">
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 uppercase">Personal <span className="text-indigo-600">Details.</span></h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-x-8">
                      <Input label="Full Legal Name" value={data.personalInfo.fullName} onChange={(v:any) => handlePersonalInfo('fullName', v)} placeholder="Rahul S." />
                      <Input label="Strategic Headline" value={data.personalInfo.headline} onChange={(v:any) => handlePersonalInfo('headline', v)} placeholder="Senior Product Designer" />
                      <Input label="Email" value={data.personalInfo.email} onChange={(v:any) => handlePersonalInfo('email', v)} placeholder="name@domain.com" />
                      <Input label="Phone" value={data.personalInfo.phone} onChange={(v:any) => handlePersonalInfo('phone', v)} placeholder="+1 (555) 000-0000" />
                      <Input label="Location" value={data.personalInfo.location} onChange={(v:any) => handlePersonalInfo('location', v)} placeholder="City, State" />
                      <Input label="LinkedIn Link" value={data.personalInfo.linkedin} onChange={(v:any) => handlePersonalInfo('linkedin', v)} placeholder="linkedin.com/in/user" />
                    </div>
                    <TextArea label="Impact Summary" value={data.personalInfo.summary} onChange={(v:any) => handlePersonalInfo('summary', v)} placeholder="3-4 sentences highlighting your key contributions..." />
                  </div>
                )}

                {activeStep === 1 && (
                  <div className="space-y-6 md:space-y-8">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl md:text-3xl font-black uppercase">Education <span className="text-indigo-600">History.</span></h2>
                      <button onClick={() => setData(prev => ({ ...prev, education: [...prev.education, { id: Math.random().toString(), school: '', degree: '', major: '', location: '', startDate: '', endDate: '', gpa: '', activities: '' }] }))} className="bg-indigo-600 text-white px-3 py-2 md:px-5 md:py-2.5 rounded-lg md:rounded-xl font-bold text-[9px] md:text-[10px] uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                        <Plus size={14} /> Add Education
                      </button>
                    </div>
                    {data.education.map(edu => (
                      <div key={edu.id} className="p-5 md:p-8 bg-slate-50 border border-slate-100 rounded-2xl md:rounded-3xl relative group">
                        <button onClick={() => setData(prev => ({ ...prev, education: prev.education.filter(e => e.id !== edu.id) }))} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={16}/></button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-x-6">
                          <Input label="Institution" value={edu.school} onChange={(v:any) => updateEducation(edu.id, { school: v })} placeholder="University Name" />
                          <Input label="Degree" value={edu.degree} onChange={(v:any) => updateEducation(edu.id, { degree: v })} placeholder="B.S. Computer Science" />
                          <Input label="Location" value={edu.location} onChange={(v:any) => updateEducation(edu.id, { location: v })} placeholder="City, State" />
                          <Input label="Timeline" value={edu.endDate} onChange={(v:any) => updateEducation(edu.id, { endDate: v })} placeholder="Expected May 2026" />
                        </div>
                        <TextArea label="Relevant Coursework / Activities" value={edu.activities} onChange={(v:any) => updateEducation(edu.id, { activities: v })} placeholder="Dean's List, Relevant coursework: Data Structures, Algorithms..." />
                      </div>
                    ))}
                    {data.education.length === 0 && (
                       <div className="py-12 md:py-20 text-center bg-slate-50 rounded-2xl md:rounded-3xl border border-dashed border-slate-200 text-slate-400 font-medium text-xs md:text-sm px-4">
                          Start by adding your latest educational background.
                       </div>
                    )}
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="space-y-6 md:space-y-8">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl md:text-3xl font-black uppercase">Work <span className="text-indigo-600">Experience.</span></h2>
                      <button onClick={() => setData(prev => ({ ...prev, experience: [...prev.experience, { id: Math.random().toString(), company: '', title: '', location: '', startDate: '', endDate: '', isCurrent: false, bullets: [''] }] }))} className="bg-indigo-600 text-white px-3 py-2 md:px-5 md:py-2.5 rounded-lg md:rounded-xl font-bold text-[9px] md:text-[10px] uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                        <Plus size={14} /> Add Experience
                      </button>
                    </div>
                    {data.experience.map(exp => (
                      <div key={exp.id} className="p-5 md:p-8 bg-slate-50 border border-slate-100 rounded-2xl md:rounded-3xl relative group">
                        <button onClick={() => setData(prev => ({ ...prev, experience: prev.experience.filter(e => e.id !== exp.id) }))} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={16}/></button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-x-6">
                          <Input label="Company Name" value={exp.company} onChange={(v:any) => updateExperience(exp.id, { company: v })} placeholder="Organization" />
                          <Input label="Role / Title" value={exp.title} onChange={(v:any) => updateExperience(exp.id, { title: v })} placeholder="Position" />
                          <Input label="Location" value={exp.location} onChange={(v:any) => updateExperience(exp.id, { location: v })} placeholder="City, State" />
                          <Input label="Duration" value={exp.startDate} onChange={(v:any) => updateExperience(exp.id, { startDate: v })} placeholder="Jan 2020 - Present" />
                        </div>
                        <div className="mt-4 space-y-3">
                          <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest block">Impact Bullets</label>
                          {exp.bullets.map((b, i) => (
                            <div key={i} className="flex gap-2 md:gap-3">
                              <textarea value={b} onChange={(e) => {
                                const nb = [...exp.bullets]; nb[i] = e.target.value; updateExperience(exp.id, { bullets: nb });
                              }} className="flex-1 p-2 md:p-3 bg-white border border-slate-200 rounded-lg md:rounded-xl text-[11px] md:text-xs" rows={2} placeholder="Accomplished [X] by doing [Y]..." />
                              <button onClick={() => handleAiRewrite(b, exp.id, 'exp', i)} className="p-2 md:p-3 bg-white border border-slate-200 text-indigo-600 rounded-lg md:rounded-xl hover:border-indigo-300 transition-all shadow-sm">
                                 {aiLoadingId === `${exp.id}-${i}` ? <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /> : <Sparkles size={16} className="md:w-[18px] md:h-[18px]"/>}
                              </button>
                            </div>
                          ))}
                          <button onClick={() => updateExperience(exp.id, { bullets: [...exp.bullets, ''] })} className="text-[9px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-widest flex items-center gap-1 mt-1">
                             <Plus size={10}/> Add Point
                          </button>
                        </div>
                      </div>
                    ))}
                    {data.experience.length === 0 && (
                       <div className="py-12 md:py-20 text-center bg-slate-50 rounded-2xl md:rounded-3xl border border-dashed border-slate-200 text-slate-400 font-medium text-xs md:text-sm px-4">
                          List your professional roles and key achievements.
                       </div>
                    )}
                  </div>
                )}

                {activeStep === 3 && (
                  <div className="space-y-6 md:space-y-8">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl md:text-3xl font-black uppercase">Technical <span className="text-indigo-600">Skills.</span></h2>
                      <button onClick={() => setData(prev => ({ ...prev, skills: [...prev.skills, { id: Math.random().toString(), category: '', items: '' }] }))} className="bg-indigo-600 text-white px-3 py-2 md:px-5 md:py-2.5 rounded-lg md:rounded-xl font-bold text-[9px] md:text-[10px] uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                        <Plus size={14} /> Add Skill Category
                      </button>
                    </div>
                    {data.skills.map(skill => (
                      <div key={skill.id} className="p-5 md:p-8 bg-slate-50 border border-slate-100 rounded-2xl md:rounded-3xl relative group">
                        <button onClick={() => setData(prev => ({ ...prev, skills: prev.skills.filter(s => s.id !== skill.id) }))} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={16}/></button>
                        <Input label="Category" value={skill.category} onChange={(v:any) => updateSkills(skill.id, { category: v })} placeholder="e.g. Programming Languages, Software, Design Tools" />
                        <TextArea label="Skills List" value={skill.items} onChange={(v:any) => updateSkills(skill.id, { items: v })} placeholder="Python, JavaScript, React, Figma, SQL..." rows={2} />
                      </div>
                    ))}
                    {data.skills.length === 0 && (
                       <div className="py-12 md:py-20 text-center bg-slate-50 rounded-2xl md:rounded-3xl border border-dashed border-slate-200 text-slate-400 font-medium text-xs md:text-sm px-4">
                          Group your skills for maximum readability.
                       </div>
                    )}
                  </div>
                )}

                {activeStep === 4 && (
                  <div className="space-y-6 md:space-y-8">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl md:text-3xl font-black uppercase">Personal <span className="text-indigo-600">Projects.</span></h2>
                      <button onClick={() => setData(prev => ({ ...prev, projects: [...prev.projects, { id: Math.random().toString(), name: '', technologies: '', link: '', bullets: [''] }] }))} className="bg-indigo-600 text-white px-3 py-2 md:px-5 md:py-2.5 rounded-lg md:rounded-xl font-bold text-[9px] md:text-[10px] uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                        <Plus size={14} /> Add Project
                      </button>
                    </div>
                    {data.projects.map(proj => (
                      <div key={proj.id} className="p-5 md:p-8 bg-slate-50 border border-slate-100 rounded-2xl md:rounded-3xl relative group">
                        <button onClick={() => setData(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== proj.id) }))} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={16}/></button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-x-6">
                          <Input label="Project Name" value={proj.name} onChange={(v:any) => updateProjects(proj.id, { name: v })} placeholder="Project Title" />
                          <Input label="Technologies" value={proj.technologies} onChange={(v:any) => updateProjects(proj.id, { technologies: v })} placeholder="React, Node.js, AWS" />
                          <Input label="Link / URL" value={proj.link} onChange={(v:any) => updateProjects(proj.id, { link: v })} placeholder="github.com/user/project" />
                        </div>
                        <div className="mt-4 space-y-3">
                           <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest block">Project Details</label>
                           {proj.bullets.map((b, i) => (
                             <div key={i} className="flex gap-2 md:gap-3">
                               <textarea value={b} onChange={(e) => {
                                 const nb = [...proj.bullets]; nb[i] = e.target.value; updateProjects(proj.id, { bullets: nb });
                               }} className="flex-1 p-2 md:p-3 bg-white border border-slate-200 rounded-lg md:rounded-xl text-[11px] md:text-xs" rows={2} placeholder="Explain what you built and the impact..." />
                               <button onClick={() => handleAiRewrite(b, proj.id, 'proj', i)} className="p-2 md:p-3 bg-white border border-slate-200 text-indigo-600 rounded-lg md:rounded-xl hover:border-indigo-300 transition-all shadow-sm">
                                  {aiLoadingId === `${proj.id}-${i}` ? <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /> : <Sparkles size={16} className="md:w-[18px] md:h-[18px]"/>}
                               </button>
                             </div>
                           ))}
                           <button onClick={() => updateProjects(proj.id, { bullets: [...proj.bullets, ''] })} className="text-[9px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-widest flex items-center gap-1 mt-1">
                              <Plus size={10}/> Add Detail
                           </button>
                        </div>
                      </div>
                    ))}
                    {data.projects.length === 0 && (
                       <div className="py-12 md:py-20 text-center bg-slate-50 rounded-2xl md:rounded-3xl border border-dashed border-slate-200 text-slate-400 font-medium text-xs md:text-sm px-4">
                          Highlight unique projects or open-source contributions.
                       </div>
                    )}
                  </div>
                )}

                {activeStep === 5 && (
                  <div className="space-y-12">
                    <h2 className="text-2xl md:text-3xl font-black uppercase">Final <span className="text-indigo-600">Audit.</span></h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-slate-100 shadow-xl">
                          <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2"><Settings size={14}/> Template Control</h3>
                          <div className="grid grid-cols-2 gap-3">
                            {TEMPLATES.map(t => (
                              <button key={t.id} onClick={() => setData(prev => ({ ...prev, templateId: t.id as any }))} className={`flex flex-col gap-3 p-4 rounded-2xl border transition-all text-left ${data.templateId === t.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:bg-slate-50'}`}>
                                <t.icon size={18} className={data.templateId === t.id ? 'text-indigo-600' : 'text-slate-400'} />
                                <div className={`text-[10px] font-bold uppercase tracking-tight ${data.templateId === t.id ? 'text-indigo-700' : 'text-slate-600'}`}>{t.name}</div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-slate-100 shadow-xl">
                          <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2"><Check size={14}/> Health Check</h3>
                          <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-sm font-bold text-slate-600">
                              <div className="bg-green-100 text-green-600 p-1 rounded-full"><Check size={14}/></div> One Page Optimization
                            </li>
                            <li className="flex items-center gap-3 text-sm font-bold text-slate-600">
                               <div className="bg-green-100 text-green-600 p-1 rounded-full"><Check size={14}/></div> Action Verb Verification
                            </li>
                            <li className="flex items-center gap-3 text-sm font-bold text-slate-600">
                               <div className="bg-indigo-100 text-indigo-600 p-1 rounded-full"><Info size={14}/></div> Quantified Result Check
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-[#1E293B] p-8 md:p-10 rounded-2xl md:rounded-[2.5rem] text-white flex flex-col justify-center items-center text-center">
                         <div className="bg-white/10 p-4 rounded-3xl mb-6">
                            <Download size={40} className="text-white"/>
                         </div>
                         <h3 className="text-xl md:text-2xl font-black uppercase mb-4 tracking-tight">Ready to Export?</h3>
                         <p className="text-white/60 text-sm mb-8 leading-relaxed font-medium">Your resume is optimized based on Ivy League career guidelines and is ready for recruitment systems.</p>
                         <button onClick={triggerDownload} className="w-full bg-white text-[#1E293B] py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl">Download PDF</button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex justify-between border-t border-slate-100 pt-6 no-print">
               <button disabled={activeStep === 0} onClick={() => setActiveStep(p => p - 1)} className="px-4 py-2 md:px-6 md:py-3 text-slate-400 font-bold uppercase tracking-widest text-[9px] md:text-[10px] disabled:opacity-30 hover:text-slate-900 flex items-center gap-1.5 transition-all">
                  <ChevronLeft size={14}/> Prev
               </button>
               <button disabled={activeStep === 5} onClick={() => setActiveStep(p => p + 1)} className="px-6 py-3 md:px-10 md:py-4 bg-slate-900 text-white rounded-lg md:rounded-xl font-bold uppercase tracking-widest text-[9px] md:text-[10px] shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5">
                  {activeStep === 5 ? 'Download Now' : 'Next Stage'} <ChevronRight size={14}/>
               </button>
            </div>
          </div>
        </div>

        {/* Desktop Sidebar Preview */}
        <div className="hidden lg:flex w-[450px] bg-slate-100 p-10 overflow-y-auto no-print border-l border-slate-200 flex-shrink-0">
           <div className="w-full relative sticky top-0 flex flex-col items-center">
              <div className="w-full mb-4 flex items-center gap-2">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                 <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em]">Live Canvas</span>
              </div>
              <div className="preview-scale-wrapper">
                  <div className="resume-preview-container origin-top scale-[0.42] shadow-2xl ring-1 ring-slate-200">
                    <ResumeRenderer data={data} />
                  </div>
              </div>
           </div>
        </div>

        {/* Mobile Floating Preview Button */}
        <button 
          onClick={() => setIsPreviewMode(true)} 
          className="md:hidden fixed bottom-24 right-4 z-[100] bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all"
        >
          <Eye size={24} />
        </button>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-slate-100 px-4 py-2 flex justify-around items-center h-20 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] no-print">
          {STEPS.slice(0, 5).map((step, idx) => (
            <button 
              key={step.id} 
              onClick={() => setActiveStep(idx)} 
              className={`flex flex-col items-center gap-1 transition-all ${activeStep === idx ? 'text-indigo-600' : 'text-slate-300'}`}
            >
              <step.icon size={20} className={activeStep === idx ? 'scale-110' : ''} />
              <span className="text-[8px] font-black uppercase tracking-tighter">{step.label}</span>
            </button>
          ))}
          <button onClick={() => setIsPreviewMode(true)} className="flex flex-col items-center gap-1 text-slate-300">
            <Layout size={20} />
            <span className="text-[8px] font-black uppercase tracking-tighter">Preview</span>
          </button>
        </div>
      </main>

      {/* Hidden container for PDF capture */}
      <div id="printable-area" className="pdf-offscreen bg-white">
          <ResumeRenderer data={data} />
      </div>

      <AnimatePresence>
        {isPreviewMode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] bg-slate-900/95 backdrop-blur-xl flex flex-col no-print">
            <header className="h-16 md:h-20 flex justify-between items-center px-4 md:px-10 border-b border-white/10 shrink-0">
               <div className="flex items-center gap-2 md:gap-3">
                  <div className="bg-white/10 p-1.5 md:p-2 rounded-lg md:rounded-xl"><Maximize2 className="text-white" size={16} /></div>
                  <h3 className="text-white font-black text-[10px] md:text-sm uppercase tracking-widest">Portolio Render</h3>
               </div>
               <div className="flex gap-2 md:gap-4">
                  <button onClick={triggerDownload} className="bg-white text-slate-900 px-3 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl font-bold text-[9px] md:text-xs uppercase tracking-widest flex items-center gap-1.5 hover:bg-slate-100 transition-all"><Download size={16}/> Export</button>
                  <button onClick={() => setIsPreviewMode(false)} className="text-white/60 hover:text-white transition-colors p-2"><X size={24} className="md:w-8 md:h-8"/></button>
               </div>
            </header>
            <div className="flex-1 overflow-y-auto p-4 md:p-12 flex justify-center bg-slate-950 no-scrollbar">
               <div className="preview-scale-wrapper">
                   <div className="resume-preview-container origin-top scale-[0.4] xs:scale-[0.5] sm:scale-[0.7] md:scale-[0.8] lg:scale-[0.85] shadow-2xl">
                     <ResumeRenderer data={data} />
                   </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AIModal isOpen={!!aiSuggestionsModal} onClose={() => setAiSuggestionsModal(null)} suggestions={aiSuggestionsModal?.items || []} original={aiSuggestionsModal?.original || ''} onSelect={applyAiSuggestion}/>
    </div>
  );
}

// --- High Fidelity Landing Page ---

const LandingPage = ({ onStart, onProfile }: any) => {
  const { scrollYProgress } = useScroll();
  const laptopScale = useTransform(scrollYProgress, [0, 0.2], [0.8, 1.1]);
  const laptopRotate = useTransform(scrollYProgress, [0, 0.2], [15, 0]);
  const templatesRef = useRef<HTMLElement>(null);

  const scrollToTemplates = () => {
    templatesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sampleTemplates = [
    { name: 'Sarah Jenkins', role: 'Chief Financial Officer', type: 'Executive Leadership' },
    { name: 'Marcus Chen', role: 'Senior Cloud Engineer', type: 'Technical Engineering' },
    { name: 'Elena Rodriguez', role: 'Marketing Director', type: 'Creative Modern' },
    { name: 'Jordan Smith', role: 'Business Analyst', type: 'Institutional Standard' },
    { name: 'David Wilson', role: 'Product Manager', type: 'Academic Professional' },
  ];

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#1E293B] selection:bg-indigo-100 overflow-x-hidden font-sans">
      <nav className="max-w-7xl mx-auto px-6 md:px-10 py-6 md:py-10 flex justify-between items-center relative z-50">
        <div className="flex items-center gap-2 md:gap-3 group cursor-pointer">
          <div className="bg-[#1E293B] p-2 md:p-2.5 rounded-lg md:rounded-xl shadow-xl shadow-indigo-100 transition-all group-hover:bg-indigo-600">
            <BrandLogo className="text-white h-4 w-4 md:h-5 md:w-5" />
          </div>
          <span className="font-black text-xl md:text-2xl tracking-tighter uppercase">CV Craft</span>
        </div>
        
        <div className="flex items-center gap-3 md:gap-8">
          <button onClick={onProfile} className="text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-widest px-2 md:px-4 py-2 hover:bg-slate-100 rounded-lg transition-all flex items-center gap-1.5">
            <User size={14} className="hidden xs:block"/> <span className="whitespace-nowrap">Author</span>
          </button>
          <button onClick={onStart} className="bg-[#D4AF37] hover:bg-[#C29D2C] text-white px-4 py-2 md:px-8 md:py-4 rounded-lg md:rounded-xl font-black text-[10px] md:text-xs shadow-2xl transition-all uppercase tracking-widest whitespace-nowrap">Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pt-10 md:pt-20 pb-20 md:pb-32">
        <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="z-10 text-center lg:text-left">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] mb-6 md:mb-10 text-[#1E293B]">
              Build Your<br className="hidden md:block"/>Professional Resume.<br className="hidden md:block"/>Get Hired Faster.
            </h1>
            <p className="text-lg md:text-xl text-slate-500 mb-8 md:mb-14 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium px-4 lg:px-0">
              Build your new professional resume with AI-driven university guidelines. Stand out to recruiters from day one.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start px-6 lg:px-0">
              <button onClick={onStart} className="bg-[#1E293B] text-white px-8 py-4 md:px-12 md:py-6 rounded-lg md:rounded-xl font-black text-base md:text-lg shadow-2xl hover:scale-[1.05] active:scale-95 transition-all uppercase tracking-tighter">
                Start Building
              </button>
              <button onClick={scrollToTemplates} className="bg-white border-2 border-slate-200 text-[#1E293B] px-8 py-4 md:px-12 md:py-6 rounded-lg md:rounded-xl font-black text-base md:text-lg hover:bg-slate-50 transition-all uppercase tracking-tighter">
                Templates
              </button>
            </div>
          </motion.div>

          <div className="laptop-container relative group hidden lg:block">
            <motion.div 
              style={{ scale: laptopScale, rotateX: laptopRotate }} 
              whileHover={{ scale: 1.15, transition: { duration: 0.3 } }}
              className="relative mx-auto w-full max-w-[650px] aspect-[1.6/1] bg-[#1E293B] rounded-[2.5rem] p-4 shadow-[0_60px_100px_-20px_rgba(0,0,0,0.4)] border-[6px] border-[#334155] cursor-pointer"
            >
               <div className="w-full h-full bg-white rounded-2xl overflow-hidden shadow-inner flex relative">
                  <div className="w-1/4 bg-[#1E293B] p-6 flex flex-col gap-6">
                     <div className="w-10 h-10 bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/20" />
                     <div className="space-y-3">
                        <div className="h-2 w-full bg-white/10 rounded-full" />
                        <div className="h-2 w-3/4 bg-white/10 rounded-full" />
                        <div className="h-2 w-1/2 bg-white/10 rounded-full" />
                     </div>
                  </div>
                  <div className="flex-1 p-8 flex flex-col gap-8">
                     <div className="flex justify-between items-center">
                        <div className="h-8 w-40 bg-slate-100 rounded-xl" />
                        <div className="h-8 w-12 bg-[#D4AF37] rounded-lg" />
                     </div>
                     <div className="space-y-4">
                        <div className="h-4 w-full bg-slate-50 rounded-lg" />
                        <div className="h-4 w-full bg-slate-50 rounded-lg" />
                        <div className="h-4 w-3/4 bg-slate-50 rounded-lg" />
                     </div>
                  </div>
                  <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute bottom-10 right-10 bg-white shadow-2xl p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                     <div className="bg-indigo-600 p-2 rounded-lg text-white"><Sparkles size={16}/></div>
                     <span className="text-[10px] font-black uppercase tracking-widest">Optimizing...</span>
                  </motion.div>
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Templates Slider */}
      <section ref={templatesRef} className="bg-white py-20 md:py-32 border-y border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-10 mb-12 md:mb-20 text-center">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-6xl font-black mb-6 md:mb-8 tracking-tighter">Premium Templates</motion.h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed px-4">
            Curated by career experts from Harvard and MIT. Engineered for ATS success and human impact.
          </p>
        </div>

        <div className="relative">
          <div className="flex gap-6 md:gap-10 overflow-x-auto no-scrollbar px-6 md:px-10 py-10">
            {sampleTemplates.map((item, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -10, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }} 
                className="shrink-0 w-64 md:w-80 bg-[#F9F7F2] rounded-2xl md:rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm transition-all cursor-pointer group"
                onClick={onStart}
              >
                <div className="bg-white aspect-[3/4.2] rounded-xl md:rounded-2xl shadow-inner border border-slate-200 mb-6 md:mb-8 p-4 md:p-6 overflow-hidden relative">
                   <div className="w-full h-full bg-slate-50/50 flex flex-col gap-3 md:gap-4">
                      <div className="flex gap-3 md:gap-4">
                         <div className="w-10 h-10 md:w-14 md:h-14 bg-slate-200 rounded-full" />
                         <div className="flex-1 space-y-2 pt-1 md:pt-2">
                            <div className="h-2 md:h-3 w-3/4 bg-slate-200 rounded-full" />
                            <div className="h-1.5 md:h-2 w-1/2 bg-slate-100 rounded-full" />
                         </div>
                      </div>
                      <div className="mt-4 md:mt-8 space-y-3 md:space-y-4">
                         {[...Array(6)].map((_, j) => (
                           <div key={j} className="h-1 md:h-1.5 bg-slate-100 rounded-full" style={{ width: `${Math.random() * 40 + 60}%` }} />
                         ))}
                      </div>
                   </div>
                   <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-colors flex items-center justify-center">
                      <span className="bg-indigo-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl font-bold text-[10px] md:text-xs uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Use Template</span>
                   </div>
                </div>
                <h3 className="text-xl md:text-2xl font-black mb-1 md:mb-2 tracking-tight">{item.name}</h3>
                <p className="text-[8px] md:text-[10px] text-slate-400 font-black uppercase tracking-widest">{item.type}</p>
                <p className="text-xs md:text-sm text-slate-600 mt-1 md:mt-2 font-medium">{item.role}</p>
              </motion.div>
            ))}
          </div>
          <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-white to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-white pt-20 md:pt-32 pb-10 md:pb-16 px-6 md:px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-12 md:gap-20 border-b border-white/10 pb-16 md:pb-24">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6 md:mb-10">
              <div className="bg-white/10 p-2 md:p-3 rounded-lg md:rounded-xl backdrop-blur-md">
                <BrandLogo className="text-white h-5 w-5 md:h-6 md:w-6" />
              </div>
              <span className="font-black text-xl md:text-2xl tracking-tighter uppercase">CV Craft</span>
            </div>
            <p className="text-slate-400 max-w-sm text-base md:text-lg leading-relaxed mb-8 md:mb-12 font-medium">
              Ultimate AI architecture for professional resumes. Preserve your legacy, maximize your impact.
            </p>
            <div className="flex gap-4 md:gap-6">
               <button onClick={onProfile} className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer text-white">
                  <User size={18} />
               </button>
               <a href="https://linkedin.com/in/rahulshyamcivil/" target="_blank" className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"><Linkedin size={18} /></a>
               <a href="https://github.com/rahulcvwebsitehosting" target="_blank" className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"><Github size={18} /></a>
            </div>
          </div>

          <div>
            <h4 className="font-black text-[10px] md:text-xs uppercase tracking-[0.3em] mb-6 md:mb-10 text-indigo-400">Navigation</h4>
            <ul className="space-y-4 md:space-y-6 text-slate-400 font-bold text-xs md:text-sm">
              <li><button onClick={onProfile} className="hover:text-white transition-colors">Author Profile</button></li>
              <li><button onClick={onStart} className="hover:text-white transition-colors">Resume Builder</button></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto py-10 md:py-16 flex flex-col md:flex-row justify-between items-center text-[9px] md:text-[11px] font-black uppercase tracking-widest text-slate-500 gap-6 md:gap-8">
          <p>© 2026 CV Craft Design. All Rights Reserved.</p>
          <div className="flex gap-6 md:gap-10">
             <span className="hover:text-white cursor-pointer">Privacy</span>
             <span className="hover:text-white cursor-pointer">Security</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const AIModal = ({ isOpen, onClose, suggestions, onSelect, original }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-slate-900/80 backdrop-blur-md">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl md:rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100">
        <div className="bg-[#1E293B] p-6 md:p-10 text-white flex justify-between items-center">
          <div className="flex items-center gap-3 md:gap-4">
             <div className="bg-indigo-600 p-2 md:p-2.5 rounded-lg md:rounded-xl"><Sparkles size={20} className="md:w-6 md:h-6"/></div>
             <div>
                <h3 className="font-black text-lg md:text-xl tracking-tight">AI Optimizer</h3>
                <p className="text-[8px] md:text-[10px] uppercase font-black tracking-widest text-slate-400">Applying Academic Standards</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} className="md:w-6 md:h-6"/></button>
        </div>
        <div className="p-6 md:p-10 max-h-[70vh] overflow-y-auto no-scrollbar">
          <div className="p-4 md:p-6 bg-slate-50 rounded-xl md:rounded-2xl text-[11px] md:text-sm italic text-slate-500 mb-6 md:mb-10 leading-relaxed border border-slate-200">
             <span className="block text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1.5 md:mb-2">Original:</span>
             "{original}"
          </div>
          <div className="space-y-4 md:space-y-5">
            {suggestions.map((s: string, i: number) => (
              <button key={i} onClick={() => onSelect(s)} className="w-full text-left p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all flex gap-3 md:gap-5 group relative overflow-hidden">
                <span className="bg-indigo-100 text-indigo-600 font-black text-[10px] md:text-xs w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-lg md:rounded-xl shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">{i+1}</span>
                <p className="text-xs md:text-[13px] text-slate-700 font-bold leading-relaxed pr-6 md:pr-8">{s}</p>
                <ChevronRight className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all" size={16} />
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);