
import React, { useState, useEffect } from 'react';
import { gemini } from './services/geminiService';
import { PaperAnalysis, AppView } from './types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  PieChart, Pie, Cell 
} from 'recharts';

/**
 * STATIC DATA CONFIGURATION
 * To make this site static for GitHub:
 * 1. Upload your paper.
 * 2. Go to 'Stats Archive'.
 * 3. Click 'Copy Analysis Data'.
 * 4. Paste that JSON object below.
 */
const STATIC_DATA: PaperAnalysis | null = null; 

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

const Sidebar: React.FC<{ 
  currentView: AppView, 
  setView: (v: AppView) => void, 
  onReset: () => void, 
  isStatic: boolean 
}> = ({ currentView, setView, onReset, isStatic }) => {
  const menuItems: { id: AppView, icon: string, label: string }[] = [
    { id: 'overview', icon: 'fa-house', label: 'Core Summary' },
    { id: 'methodology', icon: 'fa-vials', label: 'Methodology' },
    { id: 'results', icon: 'fa-chart-column', label: 'Results & Viz' },
    { id: 'extraction', icon: 'fa-database', label: 'Stats Archive' },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 flex flex-col p-4 z-20">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
          <i className="fa-solid fa-graduation-cap text-xl"></i>
        </div>
        <h1 className="font-bold text-slate-800 text-lg tracking-tight italic">SumStat Viz</h1>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentView === item.id 
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <i className={`fa-solid ${item.icon} w-5 text-center`}></i>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-3">
        {!isStatic && (
          <button 
            onClick={onReset}
            className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-red-500 text-xs transition-colors font-bold uppercase tracking-widest"
          >
            <i className="fa-solid fa-rotate-left"></i>
            Analyze New Paper
          </button>
        )}
        <div className="p-5 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl text-white shadow-xl">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2 text-indigo-300">Project Reference</p>
          <div className="text-[10px] text-slate-400 leading-tight mb-3">
            Comparative analysis of labor market transitions.
          </div>
          <a 
            href="#" 
            className="text-xs font-bold hover:text-indigo-200 transition-colors flex items-center justify-between"
          >
            SumStat Docs
            <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
          </a>
        </div>
      </div>
    </div>
  );
};

const Header: React.FC<{ title: string, subtitle?: string }> = ({ title, subtitle }) => (
  <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-6 mb-8 flex items-center justify-between">
    <div className="flex flex-col max-w-3xl">
      <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">{title}</h2>
      <p className="text-[10px] text-indigo-600 font-bold tracking-[0.2em] uppercase mt-1">{subtitle || 'Empirical Dashboard'}</p>
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
          setError(err.message || "Extraction failed. Ensure your API key is valid and the file is a readable PDF.");
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Failed to process the PDF file.");
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
      setChatResponse("AI Query failed. Please check your connection.");
    } finally {
      setChatLoading(false);
      setChatInput('');
    }
  };

  if (!analysis) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 text-center">
          <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white text-4xl shadow-2xl shadow-indigo-200 mx-auto mb-10 transform -rotate-6">
            <i className="fa-solid fa-file-pdf"></i>
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Upload Research</h1>
          <p className="text-slate-500 mb-10 leading-relaxed font-medium">
            Please upload the <span className="text-indigo-600 font-bold">SumStat</span> paper PDF to generate your interactive dashboard.
          </p>
          
          <label className="block">
            <span className="sr-only">Choose PDF</span>
            <div className={`relative group cursor-pointer transition-all ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="absolute inset-0 bg-indigo-600 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-20"></div>
              <div className="relative bg-white border-2 border-dashed border-slate-200 rounded-3xl p-10 hover:border-indigo-400 transition-colors">
                <i className={`fa-solid ${isLoading ? 'fa-circle-notch fa-spin' : 'fa-cloud-arrow-up'} text-3xl mb-4 text-indigo-600`}></i>
                <p className="text-sm font-black text-slate-700 uppercase tracking-widest">
                  {isLoading ? 'Reading Paper...' : 'Select Paper PDF'}
                </p>
                <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
              </div>
            </div>
          </label>

          {error && (
            <div className="mt-8 text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-50 p-4 rounded-2xl border border-red-100">
              <p className="opacity-80 leading-relaxed">{error}</p>
            </div>
          )}
          
          <div className="mt-12 pt-8 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Static Site Deployment</p>
            <p className="text-[10px] text-slate-400 mt-2 leading-relaxed italic">
              After upload, you can export the data to make this page static forever.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (view) {
      case 'overview':
        return (
          <div className="space-y-8 pb-12 animate-in fade-in duration-500">
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
              <h3 className="text-[10px] font-black mb-4 text-indigo-600 uppercase tracking-[0.3em]">Theoretical Summary</h3>
              <p className="text-slate-700 leading-relaxed text-lg font-medium italic">"{analysis.abstract}"</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analysis.statistics.slice(0, 6).map((stat, idx) => (
                <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-2 hover:border-indigo-200 transition-all cursor-default group">
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                     <i className="fa-solid fa-chart-line text-slate-200 group-hover:text-indigo-400 transition-colors"></i>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase">{stat.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h3 className="text-[10px] font-black mb-6 text-indigo-600 uppercase tracking-[0.3em]">Core Scientific Contributions</h3>
                <div className="grid grid-cols-1 gap-4">
                  {analysis.keyFindings.map((finding, idx) => (
                    <div key={idx} className="flex gap-5 p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-lg hover:border-indigo-100 transition-all group">
                      <div className="w-12 h-12 rounded-xl bg-white text-indigo-600 border border-indigo-50 flex items-center justify-center text-sm font-black shrink-0 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        {idx + 1}
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed font-medium">{finding}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
                <h3 className="text-[10px] font-black mb-8 text-indigo-600 uppercase tracking-[0.3em]">Research Balance</h3>
                <div className="flex-1 h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analysis.performanceData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 900 }} />
                      <Radar name="Index" dataKey="score" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[9px] text-slate-400 text-center mt-6 font-bold uppercase tracking-widest opacity-50 italic">Generated from multi-dimensional paper evaluation</p>
              </div>
            </div>
          </div>
        );
      case 'methodology':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-[10px] font-black mb-10 text-indigo-600 uppercase tracking-[0.3em] flex items-center gap-2">
                <i className="fa-solid fa-code-merge"></i>
                Analytical Pipeline
              </h3>
              <div className="space-y-12 relative">
                <div className="absolute left-[23px] top-6 bottom-6 w-1 bg-indigo-50"></div>
                {analysis.methodology.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-8 relative group">
                    <div className="w-12 h-12 rounded-2xl bg-white border-2 border-indigo-600 text-indigo-600 flex items-center justify-center font-black shrink-0 z-10 shadow-sm group-hover:scale-110 transition-transform">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 tracking-tight text-lg">{step.split(':')[0]}</h4>
                      <p className="text-sm text-slate-500 mt-2 leading-relaxed font-medium italic">
                        {step.split(':')[1] || 'Primary research action extracted from study methodology.'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-8">
              <div className="bg-slate-900 p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-indigo-500 rounded-full opacity-10"></div>
                <h3 className="text-[10px] font-black mb-8 text-indigo-300 uppercase tracking-[0.3em]">Econometric Tools</h3>
                <div className="flex flex-wrap gap-3">
                  {analysis.methodology.modelsUsed.map((m, i) => (
                    <span key={i} className="px-6 py-3 bg-white/10 hover:bg-white/20 transition-all rounded-2xl text-[11px] font-black font-mono border border-white/5 uppercase tracking-tighter cursor-default">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-indigo-600 p-12 rounded-[3rem] text-white shadow-xl shadow-indigo-100">
                <h3 className="text-[10px] font-black mb-4 uppercase tracking-[0.3em] text-indigo-100">Regional Context Note</h3>
                <p className="text-base opacity-95 leading-relaxed font-medium italic">
                  This methodology specifically accounts for institutional heterogeneity across the European and North American labor markets.
                </p>
              </div>
            </div>
          </div>
        );
      case 'results':
        return (
          <div className="space-y-8 pb-12 animate-in zoom-in-95 duration-500">
            <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm">
              <h3 className="text-[10px] font-black mb-10 text-indigo-600 uppercase tracking-[0.3em]">Extracted Comparative Indicators</h3>
              <div className="h-[400px]">
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
                      contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', fontWeight: 900 }} 
                    />
                    <Bar dataKey="score" fill="#4f46e5" radius={[16, 16, 0, 0]} barSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h3 className="text-[10px] font-black mb-8 text-indigo-600 uppercase tracking-[0.3em]">Weight Distribution</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analysis.performanceData}
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={10}
                        dataKey="score"
                      >
                        {analysis.performanceData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-gradient-to-br from-indigo-800 to-slate-900 p-12 rounded-[3rem] text-white flex flex-col justify-center relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-white/10"></div>
                 <h4 className="text-2xl font-black mb-4 tracking-tight">Institutional Stability</h4>
                 <p className="text-indigo-100 mb-10 text-sm leading-relaxed font-medium">
                   Findings suggest that structural reforms in the Mediterranean region have historically failed to bridge the duality gap between permanent and temporary cohorts.
                 </p>
                 <div className="flex items-center gap-6">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="w-[100%] h-full bg-indigo-400"></div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 shrink-0">Peer Verified</span>
                 </div>
              </div>
            </div>
          </div>
        );
      case 'extraction':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-180px)] overflow-hidden animate-in fade-in duration-500">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 flex flex-col overflow-hidden shadow-sm">
              <div className="p-8 border-b bg-slate-50 font-black text-slate-800 uppercase text-[10px] tracking-[0.3em] flex items-center justify-between">
                <span>Research Data Lab</span>
                <span className={`text-[9px] px-3 py-1 rounded-full ${STATIC_DATA ? 'bg-slate-200 text-slate-600' : 'bg-green-100 text-green-700'}`}>
                  {STATIC_DATA ? 'ARCHIVAL MODE' : 'LIVE AI'}
                </span>
              </div>
              <div className="flex-1 p-8 overflow-y-auto space-y-8 bg-slate-50/20">
                {!chatResponse && !chatLoading && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4">
                    <i className="fa-solid fa-robot text-5xl opacity-50"></i>
                    <p className="text-[10px] font-black uppercase tracking-widest text-center max-w-[180px]">Ask specific technical questions about this paper</p>
                  </div>
                )}
                {chatResponse && (
                  <div className="flex gap-4">
                     <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg">
                       <i className="fa-solid fa-brain text-sm"></i>
                     </div>
                     <div className="bg-white p-6 rounded-3xl border border-indigo-50 text-sm text-slate-700 leading-relaxed shadow-sm font-medium">
                       {chatResponse}
                     </div>
                  </div>
                )}
                {chatLoading && (
                  <div className="flex gap-4 animate-pulse">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0"></div>
                    <div className="h-24 bg-slate-200 rounded-3xl flex-1"></div>
                  </div>
                )}
              </div>
              <div className="p-6 border-t bg-white">
                <div className="flex gap-3">
                  <input 
                    className="flex-1 bg-slate-100 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                    placeholder="Query coefficients, sample size, or results..." 
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleChat()}
                  />
                  <button 
                    onClick={handleChat}
                    disabled={chatLoading || !chatInput}
                    className="w-14 h-14 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-100"
                  >
                    <i className="fa-solid fa-paper-plane"></i>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 flex flex-col overflow-hidden shadow-sm">
              <div className="p-8 border-b bg-slate-50 font-black text-slate-800 uppercase text-[10px] tracking-[0.3em] flex items-center justify-between">
                <span>Detailed Indicators</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(analysis, null, 2));
                    alert("JSON data copied! You can now paste this into the STATIC_DATA variable in App.tsx.");
                  }}
                  className="bg-indigo-600 text-white text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Copy Analysis Data
                </button>
              </div>
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-white border-b border-slate-100 z-10">
                    <tr>
                      <th className="p-6 font-black text-slate-400 uppercase text-[9px] tracking-widest">Indicator</th>
                      <th className="p-6 font-black text-slate-400 uppercase text-[9px] tracking-widest">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {analysis.statistics.map((s, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="p-6 font-black text-slate-700 text-xs group-hover:text-indigo-600 transition-colors">{s.label}</td>
                        <td className="p-6 font-mono text-indigo-600 font-black text-sm">{s.value}{s.unit}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50/40">
                      <td className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest" colSpan={2}>Research Source Metadata</td>
                    </tr>
                    <tr>
                      <td className="p-6 font-black text-slate-500 text-xs italic">Extracted from</td>
                      <td className="p-6 font-black text-slate-500 text-[10px] uppercase">PDF Byte Stream</td>
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
        isStatic={!!STATIC_DATA}
        onReset={() => {
          if (confirm("Reset analysis to upload a new paper?")) {
            setAnalysis(null);
            setPdfBase64(null);
            setView('overview');
          }
        }}
      />
      <main className="pl-64 min-h-screen">
        <Header 
          title={analysis.title} 
          subtitle="SumStat Research Visualization"
        />
        <div className="px-10 pb-12">{renderContent()}</div>
      </main>
    </div>
  );
};

export default App;
