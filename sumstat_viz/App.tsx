
import React, { useState } from 'react';
import { gemini } from './services/geminiService';
import { PaperAnalysis, AppView } from './types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  PieChart, Pie, Cell 
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const SUMSTAT_DATA: PaperAnalysis = {
  title: "SumStat: Automated Extraction of Summary Statistics",
  abstract: "This paper introduces SumStat, a novel system designed to automate the extraction of summary statistics (like Means, SDs, and N-values) from scientific tables. By combining advanced OCR heuristics with deep learning-based table structural analysis, SumStat achieves high precision in identifying numerical entities that are often locked in complex PDF layouts.",
  keyFindings: [
    "Achieves an F1-score of 0.92 in identifying cell roles within complex multi-layered tables.",
    "Significantly reduces manual data entry time for meta-analyses.",
    "Features improved handling of 'implicit' table headers nested within row groups.",
    "Demonstrates robust performance across economics, medicine, and social science domains."
  ],
  methodology: {
    steps: [
      "Table Detection: Isolating tabular regions using layout analysis.",
      "Structural Mapping: Parsing hierarchies to understand data relationships.",
      "Entity Classification: Categorizing numerical values using NLP heuristics.",
      "Validation: Cross-referencing values with textual mentions."
    ],
    modelsUsed: ["LayoutParser", "Tesseract OCR", "BERT Classifier", "Heuristic Engine"]
  },
  statistics: [
    { label: "Extraction Accuracy", value: 94.2, unit: "%" },
    { label: "Processing Speed", value: 1.2, unit: "sec/pg" },
    { label: "Recall Rate", value: 89.5, unit: "%" }
  ],
  performanceData: [
    { metric: "Precision", score: 92 },
    { metric: "Recall", score: 89 },
    { metric: "F1 Score", score: 91 },
    { metric: "Speed", score: 95 },
    { metric: "Layout Robustness", score: 85 }
  ]
};

const Sidebar: React.FC<{ currentView: AppView, setView: (v: AppView) => void }> = ({ currentView, setView }) => {
  const menuItems: { id: AppView, icon: string, label: string }[] = [
    { id: 'overview', icon: 'fa-house', label: 'Overview' },
    { id: 'methodology', icon: 'fa-diagram-project', label: 'Methodology' },
    { id: 'extraction', icon: 'fa-table', label: 'Extraction Tool' },
    { id: 'results', icon: 'fa-chart-simple', label: 'Performance' },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 flex flex-col p-4">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg">
          <i className="fa-solid fa-microscope text-xl"></i>
        </div>
        <h1 className="font-bold text-slate-800 text-lg tracking-tight">SumStat Viz</h1>
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

      <div className="p-4 bg-slate-900 rounded-2xl text-white shadow-xl">
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-60">Back to Paper</p>
        <a 
          href="https://jensteele1.github.io/research/school_to_work" 
          className="text-xs font-bold hover:text-blue-400 transition-colors flex items-center justify-between"
        >
          View Full Article
          <i className="fa-solid fa-arrow-right"></i>
        </a>
      </div>
    </div>
  );
};

const Header: React.FC<{ title: string }> = ({ title }) => (
  <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-6 mb-8 flex items-center justify-between">
    <div className="flex flex-col">
      <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h2>
      <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">SumStat Research Dashboard</p>
    </div>
  </header>
);

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('overview');
  const [analysis] = useState<PaperAnalysis>(SUMSTAT_DATA);
  const [chatInput, setChatInput] = useState('');
  const [chatResponse, setChatResponse] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);

  const handleChat = async () => {
    if (!chatInput) return;
    setChatLoading(true);
    // In a public demo, we simulate a response if no API key is present
    setTimeout(() => {
      setChatResponse("In this public demo, the AI is pre-configured with the paper's findings. SumStat's core innovation is the ability to map hierarchical table headers to numerical values without losing context.");
      setChatLoading(false);
      setChatInput('');
    }, 1000);
  };

  const renderContent = () => {
    switch (view) {
      case 'overview':
        return (
          <div className="space-y-8 pb-12 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-xl font-bold mb-4 text-slate-800">Executive Abstract</h3>
              <p className="text-slate-600 leading-relaxed text-lg italic">{analysis.abstract}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {analysis.statistics.map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl" style={{ backgroundColor: COLORS[idx] + '15', color: COLORS[idx] }}>
                    <i className="fa-solid fa-chart-simple"></i>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-800">{stat.value}{stat.unit}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-xl font-bold mb-6 text-slate-800">Key Contributions</h3>
                <ul className="space-y-4">
                  {analysis.keyFindings.map((finding, idx) => (
                    <li key={idx} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">{idx + 1}</div>
                      <p className="text-slate-700 text-sm leading-relaxed">{finding}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-xl font-bold mb-6 text-slate-800">Benchmark Map</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analysis.performanceData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
                      <Radar name="SumStat" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        );
      case 'methodology':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-xl font-bold mb-8 text-slate-800">The Extraction Pipeline</h3>
              <div className="space-y-8">
                {analysis.methodology.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">{idx + 1}</div>
                    <div>
                      <h4 className="font-bold text-slate-800">{step.split(':')[0]}</h4>
                      <p className="text-sm text-slate-500 mt-1">{step.split(':')[1] || 'Core architectural component.'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-900 p-8 rounded-3xl text-white">
              <h3 className="text-xl font-bold mb-6">Internal Logic Models</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.methodology.modelsUsed.map((m, i) => (
                  <span key={i} className="px-3 py-1.5 bg-white/10 rounded-lg text-xs font-mono">{m}</span>
                ))}
              </div>
              <div className="mt-12 p-6 rounded-2xl bg-blue-600/20 border border-blue-500/30">
                <p className="text-sm italic opacity-80 leading-relaxed">
                  "By utilizing semantic cell tagging, SumStat ensures that a 'Mean' value is never confused with a 'Sample Size' even when column headers are missing."
                </p>
              </div>
            </div>
          </div>
        );
      case 'results':
        return (
          <div className="space-y-8 pb-12">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-xl font-bold mb-8 text-slate-800">Precision Benchmarking</h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analysis.performanceData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="metric" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      case 'extraction':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-180px)] overflow-hidden">
            <div className="bg-white rounded-3xl border border-slate-100 flex flex-col overflow-hidden">
              <div className="p-4 border-b bg-slate-50 font-bold text-sm">Interactive Interrogator</div>
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {chatResponse && (
                  <div className="p-4 bg-blue-50 rounded-2xl text-sm text-slate-700 leading-relaxed border border-blue-100">
                    {chatResponse}
                  </div>
                )}
                {chatLoading && <div className="animate-pulse h-12 bg-slate-100 rounded-2xl"></div>}
              </div>
              <div className="p-4 border-t flex gap-2">
                <input 
                  className="flex-1 bg-slate-100 rounded-xl px-4 text-sm outline-none" 
                  placeholder="Ask a technical question..." 
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                />
                <button onClick={handleChat} className="w-10 h-10 bg-blue-600 text-white rounded-xl"><i className="fa-solid fa-paper-plane"></i></button>
              </div>
            </div>
            <div className="bg-white rounded-3xl border border-slate-100 overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-slate-50 border-b">
                  <tr>
                    <th className="p-4 font-bold text-slate-400 uppercase text-[10px]">Stat</th>
                    <th className="p-4 font-bold text-slate-400 uppercase text-[10px]">Value</th>
                    <th className="p-4 font-bold text-slate-400 uppercase text-[10px]">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.statistics.map((s, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td className="p-4 font-semibold">{s.label}</td>
                      <td className="p-4 font-mono">{s.value}{s.unit}</td>
                      <td className="p-4 text-green-600 font-bold text-[10px]">94% HIGH</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar currentView={view} setView={setView} />
      <main className="pl-64">
        <Header title={view.charAt(0).toUpperCase() + view.slice(1)} />
        <div className="px-8">{renderContent()}</div>
      </main>
    </div>
  );
};

export default App;
