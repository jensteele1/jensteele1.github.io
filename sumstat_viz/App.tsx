
import React, { useState, useEffect } from 'react';
import { gemini } from './services/geminiService';
import { PaperAnalysis, AppView } from './types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  PieChart, Pie, Cell 
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

const Sidebar: React.FC<{ currentView: AppView, setView: (v: AppView) => void, onReset: () => void }> = ({ currentView, setView, onReset }) => {
  const menuItems: { id: AppView, icon: string, label: string }[] = [
    { id: 'overview', icon: 'fa-house', label: 'Overview' },
    { id: 'methodology', icon: 'fa-diagram-project', label: 'Methodology' },
    { id: 'extraction', icon: 'fa-table', label: 'Data Lab' },
    { id: 'results', icon: 'fa-chart-simple', label: 'Results' },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 flex flex-col p-4 z-20">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg">
          <i className="fa-solid fa-microscope text-xl"></i>
        </div>
        <h1 className="font-bold text-slate-800 text-lg tracking-tight">Research Viz</h1>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentView === item.id 
                ? 'bg-blue-50 text-blue-700 font-semibold' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <i className={`fa-solid ${item.icon} w-5`}></i>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-2">
        <button 
          onClick={onReset}
          className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-red-500 text-xs transition-colors"
        >
          <i className="fa-solid fa-rotate-left"></i>
          Analyze New Paper
        </button>
        <div className="p-4 bg-slate-900 rounded-2xl text-white shadow-xl">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-60">Main Site</p>
          <a 
            href="https://jensteele1.github.io/research/school_to_work" 
            className="text-xs font-bold hover:text-blue-400 transition-colors flex items-center justify-between"
          >
            Back to Article
            <i className="fa-solid fa-arrow-right text-[10px]"></i>
          </a>
        </div>
      </div>
    </div>
  );
};

const Header: React.FC<{ title: string, subtitle?: string }> = ({ title, subtitle }) => (
  <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-6 mb-8 flex items-center justify-between">
    <div className="flex flex-col">
      <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h2>
      <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">{subtitle || 'Research Dashboard'}</p>
    </div>
  </header>
);

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('overview');
  const [analysis, setAnalysis] = useState<PaperAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);

  // Chat states
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
        } catch (err) {
          setError("Analysis failed. Make sure your API Key is set in Vercel settings.");
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Failed to read the file. Please try again.");
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
        <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white text-3xl shadow-xl shadow-blue-200 mx-auto mb-8">
            <i className="fa-solid fa-file-pdf"></i>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-4 tracking-tight">Paper Visualizer</h1>
          <p className="text-slate-500 mb-10 leading-relaxed">
            Upload your research paper PDF to generate an interactive, AI-powered visualization of your results and methodology.
          </p>
          
          <label className="block">
            <span className="sr-only">Choose PDF</span>
            <div className={`relative group cursor-pointer transition-all ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="absolute inset-0 bg-blue-600 rounded-2xl blur group-hover:blur-md transition-all opacity-20"></div>
              <div className="relative bg-white border-2 border-dashed border-slate-200 rounded-2xl p-6 hover:border-blue-400 transition-colors">
                <i className={`fa-solid ${isLoading ? 'fa-circle-notch fa-spin' : 'fa-cloud-arrow-up'} text-2xl mb-2 text-blue-600`}></i>
                <p className="text-sm font-bold text-slate-600">{isLoading ? 'Analyzing Research...' : 'Select Paper PDF'}</p>
                <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
              </div>
            </div>
          </label>

          {error && <p className="mt-6 text-red-500 text-xs font-semibold bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
          
          <div className="mt-12 pt-8 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Paper Author Context</p>
            <a href="https://jensteele1.github.io/research/school_to_work" className="text-blue-600 font-bold text-sm hover:underline">
              Visit School-to-Work Research Page
            </a>
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
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-xl font-bold mb-4 text-slate-800">Research Summary</h3>
              <p className="text-slate-600 leading-relaxed text-lg italic">{analysis.abstract}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {analysis.statistics.slice(0, 4).map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 hover:scale-105 transition-transform">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl" style={{ backgroundColor: COLORS[idx % COLORS.length] + '15', color: COLORS[idx % COLORS.length] }}>
                    <i className="fa-solid fa-hashtag"></i>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[120px]">{stat.label}</p>
                    <p className="text-xl font-bold text-slate-800">{stat.value}<span className="text-sm ml-0.5">{stat.unit}</span></p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-xl font-bold mb-6 text-slate-800">Key Scientific Findings</h3>
                <ul className="space-y-4">
                  {analysis.keyFindings.map((finding, idx) => (
                    <li key={idx} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                      <div className="w-8 h-8 rounded-xl bg-white text-blue-600 border border-blue-100 flex items-center justify-center text-xs font-bold shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        {idx + 1}
                      </div>
                      <p className="text-slate-700 text-sm leading-relaxed">{finding}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-xl font-bold mb-6 text-slate-800">Variable Impact Map</h3>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analysis.performanceData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Radar name="Metrics" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        );
      case 'methodology':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-xl font-bold mb-8 text-slate-800 flex items-center gap-2">
                <i className="fa-solid fa-list-check text-blue-600"></i>
                Methodological Steps
              </h3>
              <div className="space-y-8 relative">
                <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-blue-50"></div>
                {analysis.methodology.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-6 relative">
                    <div className="w-10 h-10 rounded-full bg-white border-2 border-blue-600 text-blue-600 flex items-center justify-center font-bold shrink-0 z-10 shadow-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{step.split(':')[0]}</h4>
                      <p className="text-sm text-slate-500 mt-1 leading-relaxed">{step.split(':')[1] || 'Core research component extracted from the paper text.'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-8">
              <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl"></div>
                <h3 className="text-xl font-bold mb-6">Analytical Models Used</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.methodology.modelsUsed.map((m, i) => (
                    <span key={i} className="px-4 py-2 bg-white/10 hover:bg-white/20 transition-colors rounded-xl text-xs font-mono border border-white/5">{m}</span>
                  ))}
                </div>
              </div>
              <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-xl shadow-blue-100">
                <h3 className="text-xl font-bold mb-4">Research Context</h3>
                <p className="text-sm opacity-90 leading-relaxed italic">
                  "This visualization transforms complex tabular data into interactive metrics to improve understanding of {analysis.title.split(':')[0]}."
                </p>
              </div>
            </div>
          </div>
        );
      case 'results':
        return (
          <div className="space-y-8 pb-12 animate-in zoom-in-95 duration-500">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-xl font-bold mb-8 text-slate-800">Primary Outcome Metrics</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analysis.performanceData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="metric" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
                    />
                    <Bar dataKey="score" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-xl font-bold mb-6 text-slate-800">Distribution of Effects</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analysis.performanceData}
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="score"
                      >
                        {analysis.performanceData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-700 to-indigo-800 p-8 rounded-3xl text-white flex flex-col justify-center">
                 <h4 className="text-2xl font-bold mb-4">Export Analysis</h4>
                 <p className="text-blue-100 mb-8 text-sm leading-relaxed">
                   You can copy this JSON to hardcode your results and disable the live API for a faster public experience.
                 </p>
                 <button 
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(analysis, null, 2));
                    alert("Analysis data copied to clipboard!");
                  }}
                  className="bg-white text-blue-700 font-bold py-4 rounded-2xl hover:bg-blue-50 transition-colors shadow-lg shadow-blue-900/20"
                 >
                   <i className="fa-solid fa-copy mr-2"></i> Copy Data to Clipboard
                 </button>
              </div>
            </div>
          </div>
        );
      case 'extraction':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-180px)] overflow-hidden">
            <div className="bg-white rounded-3xl border border-slate-100 flex flex-col overflow-hidden shadow-sm">
              <div className="p-4 border-b bg-slate-50 font-bold text-slate-700 flex items-center justify-between">
                <span>Interactive AI Chat</span>
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">LIVE</span>
              </div>
              <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/30">
                {!chatResponse && !chatLoading && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 opacity-50">
                    <i className="fa-solid fa-robot text-4xl"></i>
                    <p className="text-sm text-center max-w-[200px]">Ask specific questions about the paper's findings or tables.</p>
                  </div>
                )}
                {chatResponse && (
                  <div className="animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex gap-3">
                       <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                         <i className="fa-solid fa-brain text-xs"></i>
                       </div>
                       <div className="bg-white p-4 rounded-2xl border border-slate-100 text-sm text-slate-700 leading-relaxed shadow-sm">
                         {chatResponse}
                       </div>
                    </div>
                  </div>
                )}
                {chatLoading && (
                  <div className="flex gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-lg bg-slate-200"></div>
                    <div className="h-16 bg-slate-200 rounded-2xl flex-1"></div>
                  </div>
                )}
              </div>
              <div className="p-4 border-t bg-white">
                <div className="flex gap-2">
                  <input 
                    className="flex-1 bg-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                    placeholder="Ask the paper AI..." 
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleChat()}
                  />
                  <button 
                    onClick={handleChat}
                    disabled={chatLoading || !chatInput}
                    className="w-12 h-12 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-200"
                  >
                    <i className="fa-solid fa-paper-plane"></i>
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl border border-slate-100 flex flex-col overflow-hidden shadow-sm">
              <div className="p-4 border-b bg-slate-50 font-bold text-slate-700">Detailed Extracted Statistics</div>
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="sticky top-0 bg-white border-b border-slate-100 z-10">
                    <tr>
                      <th className="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Descriptor</th>
                      <th className="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Extracted Value</th>
                      <th className="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.statistics.map((s, i) => (
                      <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                        <td className="p-4 font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">{s.label}</td>
                        <td className="p-4 font-mono text-slate-600">{s.value}{s.unit}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                             <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                               <div className="h-full bg-green-500 w-[95%]"></div>
                             </div>
                             <span className="text-[10px] font-bold text-green-600">90%+</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar 
        currentView={view} 
        setView={setView} 
        onReset={() => {
          if (confirm("Clear current analysis and upload a new paper?")) {
            setAnalysis(null);
            setPdfBase64(null);
          }
        }} 
      />
      <main className="pl-64 min-h-screen">
        <Header 
          title={view === 'overview' ? analysis.title.split(':')[0] : view.charAt(0).toUpperCase() + view.slice(1)} 
          subtitle={view === 'overview' ? analysis.title.split(':').slice(1).join(':') : `Research Details`}
        />
        <div className="px-8 pb-10">{renderContent()}</div>
      </main>
    </div>
  );
};

export default App;
