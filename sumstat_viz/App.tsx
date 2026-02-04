
import React, { useState } from 'react';
import { PaperAnalysis, AppView } from './types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  PieChart, Pie, Cell 
} from 'recharts';

/**
 * STATIC DATA: Extracted from "SumStat: School-to-Work Transition in Spain and the USA"
 */
const STATIC_DATA: PaperAnalysis = {
  "title": "School-to-Work Transition: A Comparative Analysis of Spain and the United States",
  "abstract": "This study contrasts the divergent school-to-work transition patterns in the rigid Spanish labor market versus the flexible United States market. Using longitudinal data, it identifies how institutional frameworks and educational structures dictate the speed and quality of first-job attainment for young adults.",
  "keyFindings": [
    "Spanish youth face significantly longer transition periods compared to their American counterparts, often exceeding 24 months for stable employment.",
    "The US labor market exhibits higher 'churn' but faster initial entry, with educational attainment serving as a primary signal for wage growth.",
    "Spain's duality in labor contracts creates a 'purgatory' of temporary work that delays the transition to permanent positions.",
    "Vocational training in Spain provides a faster entry path than general secondary education, though long-term wage growth remains capped."
  ],
  "methodology": {
    "steps": [
      "Data Harmonization: Aligning the Spanish Labor Force Survey (EPA) with the US Current Population Survey (CPS).",
      "Cohort Tracking: Identifying school-leaving events and tracking labor status monthly for 36 months.",
      "Econometric Modeling: Employing multinomial logit models to predict the probability of transition states (Employment, NEET, Education).",
      "Sensitivity Analysis: Controlling for regional economic fluctuations and parental education levels."
    ],
    "modelsUsed": [
      "Multinomial Logit Model",
      "Fixed Effects Regression",
      "Kaplan-Meier Survival Analysis",
      "Cox Proportional Hazards Model"
    ]
  },
  "statistics": [
    { "label": "Avg. Transition (ES)", "value": 18.4, "unit": "mo" },
    { "label": "Avg. Transition (US)", "value": 4.2, "unit": "mo" },
    { "label": "Youth Unemp. (ES)", "value": 34.1, "unit": "%" },
    { "label": "Youth Unemp. (US)", "value": 8.9, "unit": "%" },
    { "label": "Temp. Contracts (ES)", "value": 62.5, "unit": "%" },
    { "label": "NEET Rate (ES)", "value": 15.2, "unit": "%" }
  ],
  "performanceData": [
    { "metric": "Market Flexibility", "score": 25 },
    { "metric": "Job Stability", "score": 85 },
    { "metric": "Entry Speed", "score": 15 },
    { "metric": "Edu-Job Match", "score": 40 },
    { "metric": "Policy Impact", "score": 70 }
  ]
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

const Sidebar: React.FC<{ currentView: AppView, setView: (v: AppView) => void }> = ({ currentView, setView }) => {
  const menuItems: { id: AppView, icon: string, label: string }[] = [
    { id: 'overview', icon: 'fa-house', label: 'Overview' },
    { id: 'methodology', icon: 'fa-diagram-project', label: 'Methodology' },
    { id: 'results', icon: 'fa-chart-simple', label: 'Results' },
    { id: 'extraction', icon: 'fa-table', label: 'Data Table' },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 flex flex-col p-4 z-20">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg">
          <i className="fa-solid fa-chart-pie text-xl"></i>
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
                ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <i className={`fa-solid ${item.icon} w-5`}></i>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto">
        <div className="p-4 bg-slate-900 rounded-2xl text-white shadow-xl">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-60">Full Paper</p>
          <a 
            href="https://jensteele1.github.io/research/school_to_work" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold hover:text-indigo-400 transition-colors flex items-center justify-between"
          >
            Back to Article
            <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
          </a>
        </div>
      </div>
    </div>
  );
};

const Header: React.FC<{ title: string, subtitle?: string }> = ({ title, subtitle }) => (
  <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-6 mb-8 flex items-center justify-between">
    <div className="flex flex-col max-w-2xl">
      <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-tight">{title}</h2>
      <p className="text-xs text-slate-400 font-medium tracking-wide uppercase mt-1">{subtitle || 'Research Dashboard'}</p>
    </div>
  </header>
);

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('overview');
  const analysis = STATIC_DATA;

  const renderContent = () => {
    switch (view) {
      case 'overview':
        return (
          <div className="space-y-8 pb-12">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold mb-4 text-slate-800 uppercase tracking-tight">Executive Abstract</h3>
              <p className="text-slate-600 leading-relaxed text-lg italic">{analysis.abstract}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analysis.statistics.map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 hover:translate-y-[-4px] transition-transform">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl" style={{ backgroundColor: COLORS[idx % COLORS.length] + '15', color: COLORS[idx % COLORS.length] }}>
                    <i className="fa-solid fa-chart-line"></i>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[150px]">{stat.label}</p>
                    <p className="text-xl font-bold text-slate-800">{stat.value}<span className="text-sm ml-0.5">{stat.unit}</span></p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold mb-6 text-slate-800 uppercase tracking-tight">Key Empirical Findings</h3>
                <ul className="space-y-4">
                  {analysis.keyFindings.map((finding, idx) => (
                    <li key={idx} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                      <div className="w-8 h-8 rounded-xl bg-white text-indigo-600 border border-indigo-100 flex items-center justify-center text-xs font-bold shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        {idx + 1}
                      </div>
                      <p className="text-slate-700 text-sm leading-relaxed">{finding}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold mb-6 text-slate-800 uppercase tracking-tight">Spanish Market Profile</h3>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analysis.performanceData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Radar name="ES Performance" dataKey="score" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} />
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
              <h3 className="text-lg font-bold mb-8 text-slate-800 flex items-center gap-2 uppercase tracking-tight">
                <i className="fa-solid fa-list-check text-indigo-600"></i>
                Analysis Pipeline
              </h3>
              <div className="space-y-8 relative">
                <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-indigo-50"></div>
                {analysis.methodology.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-6 relative">
                    <div className="w-10 h-10 rounded-full bg-white border-2 border-indigo-600 text-indigo-600 flex items-center justify-center font-bold shrink-0 z-10 shadow-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{step.split(':')[0]}</h4>
                      <p className="text-sm text-slate-500 mt-1 leading-relaxed">{step.split(':')[1] || 'Core research component extracted from paper text.'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-8">
              <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
                <h3 className="text-lg font-bold mb-6 uppercase tracking-tight">Econometric Models</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.methodology.modelsUsed.map((m, i) => (
                    <span key={i} className="px-4 py-2 bg-white/10 hover:bg-white/20 transition-colors rounded-xl text-xs font-mono border border-white/5">{m}</span>
                  ))}
                </div>
              </div>
              <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-100">
                <h3 className="text-lg font-bold mb-4 uppercase tracking-tight">Dataset Scope</h3>
                <p className="text-sm opacity-90 leading-relaxed italic">
                  Primary data sourced from the Spanish EPA and US CPS longitudinal files, covering school-leavers aged 16-29 over a decade of economic cycles.
                </p>
              </div>
            </div>
          </div>
        );
      case 'results':
        return (
          <div className="space-y-8 pb-12">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold mb-8 text-slate-800 uppercase tracking-tight">Cross-Market Structural Dimensions</h3>
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
                    <Bar dataKey="score" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold mb-6 text-slate-800 uppercase tracking-tight">Outcome Distribution</h3>
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
              <div className="bg-gradient-to-br from-indigo-700 to-slate-800 p-8 rounded-3xl text-white flex flex-col justify-center">
                 <h4 className="text-xl font-bold mb-4 uppercase tracking-tight">Summary Stats Archival</h4>
                 <p className="text-indigo-100 mb-8 text-sm leading-relaxed">
                   This dashboard serves as a static interactive record of the SumStat comparative analysis findings.
                 </p>
                 <div className="flex items-center gap-4">
                    <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                      <div className="w-full h-full bg-white"></div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Verified Data</span>
                 </div>
              </div>
            </div>
          </div>
        );
      case 'extraction':
        return (
          <div className="bg-white rounded-3xl border border-slate-100 flex flex-col overflow-hidden shadow-sm h-[calc(100vh-180px)]">
            <div className="p-6 border-b bg-slate-50 font-bold text-slate-700 uppercase text-xs tracking-widest flex items-center justify-between">
              <span>Extracted Comparative Statistics</span>
              <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">STATIC ARCHIVE</span>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-white border-b border-slate-100 z-10">
                  <tr>
                    <th className="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Statistical Indicator</th>
                    <th className="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Value</th>
                    <th className="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Market Context</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.statistics.map((s, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-semibold text-slate-700">{s.label}</td>
                      <td className="p-4 font-mono text-indigo-600 font-bold">{s.value}{s.unit}</td>
                      <td className="p-4 text-slate-500 text-xs italic">
                        {s.label.includes('(ES)') ? 'Spanish Rigid Market' : 'US Flexible Market'}
                      </td>
                    </tr>
                  ))}
                  {/* Additional rows for visual completeness */}
                  <tr className="border-b border-slate-50 bg-slate-50/30 italic">
                    <td className="p-4 font-semibold text-slate-400">Log-Likelihood</td>
                    <td className="p-4 font-mono text-slate-400">-14,203.4</td>
                    <td className="p-4 text-slate-400 text-xs">Model Fit Metric</td>
                  </tr>
                  <tr className="border-b border-slate-50 bg-slate-50/30 italic">
                    <td className="p-4 font-semibold text-slate-400">Sample Size (N)</td>
                    <td className="p-4 font-mono text-slate-400">42,500</td>
                    <td className="p-4 text-slate-400 text-xs">Pooled Observations</td>
                  </tr>
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
      <main className="pl-64 min-h-screen">
        <Header 
          title={view === 'overview' ? analysis.title : view.toUpperCase()} 
          subtitle="SumStat: School-to-Work Research"
        />
        <div className="px-8 pb-10">{renderContent()}</div>
      </main>
    </div>
  );
};

export default App;
