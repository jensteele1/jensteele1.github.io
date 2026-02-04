
import React, { useState } from 'react';
import { gemini } from './services/geminiService';
import { PaperAnalysis, AppView } from './types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  PieChart, Pie, Cell 
} from 'recharts';

/**
 * STATIC DATA CONFIGURATION
 * Set this to null to enable the PDF Upload interface.
 * Once you have analyzed a paper, copy the JSON from 'Stats Archive' 
 * and paste it here to make your dashboard permanent.
 */
const STATIC_DATA: PaperAnalysis | null = null; 

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#4f46e5'];

const Sidebar: React.FC<{ 
  currentView: AppView, 
  setView: (v: AppView) => void, 
  onReset: () => void,
  title: string
}> = ({ currentView, setView, onReset, title }) => {
  const menuItems: { id: AppView, icon: string, label: string }[] = [
    { id: 'overview', icon: 'fa-house', label: 'Summary' },
    { id: 'methodology', icon: 'fa-vials', label: 'Methodology' },
    { id: 'results', icon: 'fa-chart-column', label: 'Visualizations' },
    { id: 'extraction', icon: 'fa-database', label: 'Data Lab' },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 flex flex-col p-6 z-20">
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
          <i className="fa-solid fa-microscope text-xl"></i>
        </div>
        <div>
          <h1 className="font-black text-slate-800 text-sm tracking-tighter uppercase leading-none">SumStat</h1>
          <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-1">Research Viz</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
              currentView === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <i className={`fa-solid ${item.icon} w-5 text-center ${currentView === item.id ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`}></i>
            <span className="text-sm font-bold">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-100">
        <button 
          onClick={onReset}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-500 text-[10px] transition-colors font-black uppercase tracking-[0.2em]"
        >
          <i className="fa-solid fa-arrow-up-from-bracket"></i>
          New Analysis
        </button>
      </div>
    </div>
  );
};

const Header: React.FC<{ title: string }> = ({ title }) => (
  <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 px-10 py-8 mb-8">
    <div className="flex flex-col">
      <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{title}</h2>
      <p className="text-[10px] text-indigo-600 font-black tracking-[0.3em] uppercase mt-2">Validated Research Extraction</p>
    </div>
  </header>
);

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('overview');
  const [analysis, setAnalysis] = useState<PaperAnalysis | null>(STATIC_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatResponse, setChatResponse] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        setPdfBase64(base64);
        try {
          const result = await gemini.analyzePaper(base64);
          setAnalysis(result);
        } catch (err: any) {
          setError(err.message || "Extraction failed. The AI couldn't parse the paper structure.");
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Failed to read PDF file.");
      setIsLoading(false);
    }
  };

  const handleChat = async () => {
    if (!chatInput || !pdfBase64) return;
    setChatLoading(true);
    try {
      const response = await gemini.chatWithPaper(pdfBase64, chatInput);
      setChatResponse(response);
    } catch (err) {
      setChatResponse("Query failed. Please check your connection.");
    } finally {
      setChatLoading(false);
      setChatInput('');
    }
  };

  if (!analysis) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
          
          <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 text-3xl mx-auto mb-8 shadow-inner">
            <i className={`fa-solid ${isLoading ? 'fa-dna fa-spin' : 'fa-file-pdf'}`}></i>
          </div>
          
          <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
            {isLoading ? 'Processing Research...' : 'Research Analysis Portal'}
          </h1>
          <p className="text-slate-500 mb-10 leading-relaxed font-medium">
            {isLoading 
              ? 'Gemini 3 Pro is currently mapping your methodology and extracting summary statistics from the document...'
              : 'Upload your research paper PDF to generate an interactive, data-driven dashboard. No manual data entry required.'
            }
          </p>
          
          <label className={`block group relative ${isLoading ? 'pointer-events-none' : 'cursor-pointer'}`}>
            <div className={`border-2 border-dashed rounded-[2.5rem] p-12 transition-all ${
              isLoading ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200 group-hover:border-indigo-400 group-hover:bg-indigo-50/30'
            }`}>
              <div className="space-y-4">
                <i className={`fa-solid ${isLoading ? 'fa-spinner fa-spin' : 'fa-cloud-arrow-up'} text-4xl text-indigo-600`}></i>
                <p className="text-sm font-black text-slate-700 uppercase tracking-widest">
                  {isLoading ? 'Analyzing Data Structure' : 'Select PDF Manuscript'}
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Supports PDF up to 20MB</p>
              </div>
              <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
            </div>
          </label>

          {error && (
            <div className="mt-8 p-6 bg-red-50 border border-red-100 rounded-3xl text-red-600 text-[10px] font-black uppercase tracking-widest leading-relaxed">
              <i className="fa-solid fa-circle-exclamation mr-2"></i>
              {error}
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-slate-50 flex items-center justify-center gap-8 opacity-40">
            <div className="flex flex-col items-center gap-1">
              <i className="fa-solid fa-chart-area text-xl"></i>
              <span className="text-[8px] font-black uppercase tracking-widest">Visualizations</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <i className="fa-solid fa-database text-xl"></i>
              <span className="text-[8px] font-black uppercase tracking-widest">Stats Extraction</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <i className="fa-solid fa-robot text-xl"></i>
              <span className="text-[8px] font-black uppercase tracking-widest">AI Synthesis</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (view) {
      case 'overview':
        return (
          <div className="space-y-8 pb-12 animate-in fade-in duration-700">
            <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110"></div>
              <h3 className="text-[10px] font-black mb-6 text-indigo-600 uppercase tracking-[0.3em]">Scientific Abstract</h3>
              <p className="text-slate-700 leading-relaxed text-xl font-semibold italic relative z-10">"{analysis.abstract}"</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analysis.statistics.slice(0, 6).map((stat, idx) => (
                <div key={idx} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-3 hover:border-indigo-300 transition-all cursor-default group">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">{stat.value}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm">
                <h3 className="text-[10px] font-black mb-8 text-indigo-600 uppercase tracking-[0.3em]">Primary Findings</h3>
                <div className="grid grid-cols-1 gap-4">
                  {analysis.keyFindings.map((finding, idx) => (
                    <div key={idx} className="flex gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:border-indigo-100 transition-all group">
                      <div className="w-12 h-12 rounded-2xl bg-white text-indigo-600 border border-indigo-50 flex items-center justify-center text-sm font-black shrink-0 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        {idx + 1}
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed font-bold">{finding}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col">
                <h3 className="text-[10px] font-black mb-8 text-indigo-600 uppercase tracking-[0.3em]">Metric Distribution</h3>
                <div className="flex-1 h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analysis.performanceData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 900 }} />
                      <Radar name="Index" dataKey="score" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        );
      case 'methodology':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12 animate-in slide-in-from-bottom-8 duration-700">
            <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm">
              <h3 className="text-[10px] font-black mb-10 text-indigo-600 uppercase tracking-[0.3em] flex items-center gap-3">
                <i className="fa-solid fa-layer-group"></i>
                Analysis Pipeline
              </h3>
              <div className="space-y-12 relative">
                <div className="absolute left-[27px] top-8 bottom-8 w-1 bg-indigo-50"></div>
                {analysis.methodology.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-10 relative group">
                    <div className="w-14 h-14 rounded-3xl bg-white border-2 border-indigo-600 text-indigo-600 flex items-center justify-center font-black shrink-0 z-10 shadow-sm group-hover:scale-110 transition-transform">
                      {idx + 1}
                    </div>
                    <div className="pt-2">
                      <h4 className="font-black text-slate-800 tracking-tight text-lg leading-tight mb-2">{step.split(':')[0]}</h4>
                      <p className="text-sm text-slate-400 font-medium italic leading-relaxed">
                        {step.split(':')[1] || 'Extraction from manuscript section.'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-8">
              <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-500 rounded-full opacity-10"></div>
                <h3 className="text-[10px] font-black mb-8 text-indigo-400 uppercase tracking-[0.3em]">Statistical Framework</h3>
                <div className="flex flex-wrap gap-3">
                  {analysis.methodology.modelsUsed.map((m, i) => (
                    <span key={i} className="px-6 py-4 bg-white/5 hover:bg-white/10 transition-all rounded-[1.5rem] text-[10px] font-black font-mono border border-white/5 uppercase tracking-wider cursor-default">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-indigo-600 p-12 rounded-[3.5rem] text-white shadow-2xl shadow-indigo-100 flex items-start gap-6">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-circle-info text-2xl text-white/50"></i>
                </div>
                <div>
                  <h3 className="text-[10px] font-black mb-3 uppercase tracking-[0.3em] text-indigo-100">Methodological Note</h3>
                  <p className="text-base opacity-90 leading-relaxed font-bold italic">
                    All findings are derived from the uploaded manuscript and validated using cross-sectional summary statistics.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'results':
        return (
          <div className="space-y-8 pb-12 animate-in zoom-in-95 duration-700">
            <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-[10px] font-black mb-12 text-indigo-600 uppercase tracking-[0.3em]">Comparative Performance Indicators</h3>
              <div className="h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analysis.performanceData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="metric" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 900 }} 
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 900 }} />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '2rem', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', fontWeight: 900, padding: '1.5rem' }} 
                    />
                    <Bar dataKey="score" fill="#4f46e5" radius={[1.5, 1.5, 0, 0]} barSize={80} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
                <h3 className="text-[10px] font-black mb-8 text-indigo-600 uppercase tracking-[0.3em]">Relative Proportions</h3>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analysis.performanceData}
                        innerRadius={90}
                        outerRadius={120}
                        paddingAngle={8}
                        dataKey="score"
                      >
                        {analysis.performanceData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', paddingTop: '2rem' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 p-12 rounded-[3.5rem] text-white flex flex-col justify-center relative overflow-hidden group">
                 <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <h4 className="text-3xl font-black mb-4 tracking-tighter italic">Empirical Validation</h4>
                 <p className="text-indigo-100 mb-12 text-sm leading-relaxed font-bold opacity-80">
                   The summary statistics presented here are dynamically extracted from the provided research text and tabular data.
                 </p>
                 <div className="flex items-center gap-6 mt-auto">
                    <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                      <div className="w-[100%] h-full bg-indigo-400"></div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-200 shrink-0">100% Extracted</span>
                 </div>
              </div>
            </div>
          </div>
        );
      case 'extraction':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-200px)] overflow-hidden animate-in fade-in duration-700">
            <div className="bg-white rounded-[3.5rem] border border-slate-100 flex flex-col overflow-hidden shadow-sm">
              <div className="p-10 border-b bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-[0.3em]">AI Inquiry Lab</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Chat directly with the manuscript</p>
                </div>
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <i className="fa-solid fa-robot"></i>
                </div>
              </div>
              <div className="flex-1 p-10 overflow-y-auto space-y-8 bg-slate-50/20">
                {!chatResponse && !chatLoading && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-6">
                    <i className="fa-solid fa-message text-6xl opacity-20"></i>
                    <div className="text-center space-y-2">
                      <p className="text-[11px] font-black uppercase tracking-widest">Awaiting Question</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">e.g. "What is the confidence interval for β₁?"</p>
                    </div>
                  </div>
                )}
                {chatResponse && (
                  <div className="flex gap-6 animate-in slide-in-from-left-4">
                     <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-100">
                       <i className="fa-solid fa-brain text-lg"></i>
                     </div>
                     <div className="bg-white p-8 rounded-[2rem] border border-indigo-50 text-sm text-slate-700 leading-relaxed shadow-sm font-bold italic">
                       {chatResponse}
                     </div>
                  </div>
                )}
                {chatLoading && (
                  <div className="flex gap-6 animate-pulse">
                    <div className="w-12 h-12 rounded-2xl bg-slate-200 shrink-0"></div>
                    <div className="h-32 bg-slate-200 rounded-[2rem] flex-1"></div>
                  </div>
                )}
              </div>
              <div className="p-10 border-t bg-white">
                <div className="flex gap-4">
                  <input 
                    className="flex-1 bg-slate-100 rounded-[1.5rem] px-8 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all placeholder:text-slate-300" 
                    placeholder="Ask about a specific coefficient or table..." 
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleChat()}
                  />
                  <button 
                    onClick={handleChat}
                    disabled={chatLoading || !chatInput}
                    className="w-16 h-16 bg-indigo-600 text-white rounded-[1.5rem] hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center"
                  >
                    <i className="fa-solid fa-paper-plane text-lg"></i>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[3.5rem] border border-slate-100 flex flex-col overflow-hidden shadow-sm">
              <div className="p-10 border-b bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-[0.3em]">Extracted Metadata</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Summary Statistic Records</p>
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(analysis, null, 2));
                    alert("JSON data copied to clipboard! Paste this into STATIC_DATA to freeze the app.");
                  }}
                  className="bg-indigo-600 text-white text-[9px] px-5 py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  <i className="fa-solid fa-copy mr-2"></i>
                  Copy JSON
                </button>
              </div>
              <div className="flex-1 overflow-auto p-10">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-white border-b border-slate-100 z-10">
                    <tr>
                      <th className="pb-6 font-black text-slate-400 uppercase text-[9px] tracking-widest">Statistical Indicator</th>
                      <th className="pb-6 font-black text-slate-400 uppercase text-[9px] tracking-widest text-right">Observation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {analysis.statistics.map((s, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="py-6 font-black text-slate-700 text-xs group-hover:text-indigo-600 transition-colors">{s.label}</td>
                        <td className="py-6 font-mono text-indigo-600 font-black text-right text-sm">{s.value}{s.unit}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50/40">
                      <td className="py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center" colSpan={2}>Analysis Provenance Metadata</td>
                    </tr>
                    <tr>
                      <td className="py-6 font-black text-slate-500 text-xs italic">System Model</td>
                      <td className="py-6 font-black text-slate-500 text-[10px] uppercase text-right tracking-widest">Gemini 3 Pro</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc]">
      <Sidebar 
        currentView={view} 
        setView={setView} 
        title={analysis.title}
        onReset={() => {
          if (confirm("Reset current analysis to upload a new research manuscript?")) {
            setAnalysis(null);
            setPdfBase64(null);
            setView('overview');
          }
        }}
      />
      <main className="pl-64 min-h-screen">
        <Header title={analysis.title} />
        <div className="px-12 pb-16">{renderContent()}</div>
      </main>
    </div>
  );
};

export default App;
