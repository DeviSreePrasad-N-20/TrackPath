import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';
import Layout from '../components/Layout';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend,
} from 'chart.js';
import { 
  Filter, Download, ArrowRight, CheckCircle2, Sparkles, AlertTriangle, X, Eye, ChevronRight, Zap, 
  RefreshCw, Search, PhoneCall, Send, Users, TrendingUp, Award, Building, Check, Clock, PlusCircle, 
  ShieldCheck, AlertCircle, MapPin, BarChart3, Activity, PieChart, Layers, HelpCircle
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

export default function AdminDashboard({ auth, handleLogout }) {
  const [data, setData] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [filters, setFilters] = useState({ scheme: '', region: '', trade: '', cohort: '', gender: '' });
  const [dateRange, setDateRange] = useState('Q2 2025 (Apr - Jun)');
  
  // Tab Switcher for Admin Portal
  const [activeAdminTab, setActiveAdminTab] = useState('overview'); // overview, ai-skills, risk, interventions, ab-test, geo-map, data-quality
  
  // Search & Trainee Directory States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedJourney, setSelectedJourney] = useState(null);
  const [selectedCity, setSelectedCity] = useState('Andhra Pradesh');

  // Modals & Drawers
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [showFunnelModal, setShowFunnelModal] = useState(false);
  const [showWageModal, setShowWageModal] = useState(false);
  const [showSkillGapsModal, setShowSkillGapsModal] = useState(false);
  const [showDistributionModal, setShowDistributionModal] = useState(false);
  const [showInterventionModal, setShowInterventionModal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  // New Intervention Form State
  const [newCampaignName, setNewCampaignName] = useState('PLC Automation Masterclass');
  const [newSkillTarget, setNewSkillTarget] = useState('PLC Basics');
  const [newTargetRegion, setNewTargetRegion] = useState('North Region');

  const location = useLocation();
  const path = location.pathname;
  const isTrainees = path.includes('/trainees');
  const isOutcomes = path.includes('/outcomes');
  const isResults = path.includes('/results');

  const loadData = async () => {
    try {
      const q = new URLSearchParams(filters).toString();
      const res = await api.get(`/api/admin/dashboard?${q}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadFollowUps = async () => {
    try {
      const res = await api.get('/api/admin/follow-ups');
      setFollowUps(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    loadFollowUps();
  }, [filters]);

  const handleNudgeTrainee = async (traineeId, traineeName) => {
    try {
      await api.post(`/api/admin/follow-ups/${traineeId}`);
      setFollowUps(prev => prev.filter(t => t.id !== traineeId));
      setActionSuccess(`Follow-up WhatsApp reminder sent to ${traineeName}!`);
      setTimeout(() => setActionSuccess(''), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await api.get('/api/admin/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'trackpath_longitudinal_policy_report.csv');
      document.body.appendChild(link);
      link.click();
      setActionSuccess('Official Longitudinal CSV Report downloaded successfully!');
      setTimeout(() => setActionSuccess(''), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateIntervention = (e) => {
    e.preventDefault();
    setShowInterventionModal(false);
    setActionSuccess(`Remedial Intervention "${newCampaignName}" successfully deployed!`);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  if (!data) return (
    <Layout auth={auth} handleLogout={handleLogout}>
      <div className="flex justify-center items-center h-64 text-gray-500 font-bold">Loading longitudinal intelligence engine...</div>
    </Layout>
  );

  const wageData = {
    labels: ['At Placement', '3 Months', '6 Months', '12 Months'],
    datasets: [{
      label: 'Average Wage (₹)',
      data: [13500, 16200, 19800, 20350],
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.12)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#10b981'
    }]
  };

  const donutData = {
    labels: ['Employed (Formal)', 'Still Seeking', 'Self-Employed', 'Apprenticeship'],
    datasets: [{
      data: [67, 25, 6, 2],
      backgroundColor: ['#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'],
      borderWidth: 0,
    }]
  };

  const cohortsList = data.cohorts || [];
  const schemesList = data.schemes || [];
  const health = data.programmeHealth || { score: 86, placement: 92, retention: 84, wageGrowth: 76, skillUsage: 81, employerValidation: 90, attention: [] };
  const skillMarketGaps = data.skillMarketGaps || [];
  const risk = data.riskPrediction || { lowRisk: 68, mediumRisk: 22, highRisk: 10, primaryReasons: [] };
  const interventionsHistory = data.interventionsHistory || [];
  const ab = data.abComparison || {};
  const geoSkills = data.geoSkills || [];
  const dataQuality = data.dataQuality || { employerVerified: 87, traineeReported: 11, pendingVerification: 2, duplicateRecords: 0.2, expiredConsent: 0.8 };
  const intelligentAlerts = data.intelligentAlerts || [];

  const currentGeo = geoSkills.find(g => g.city === selectedCity) || geoSkills[0] || {};

  // Filtered Cohorts for Trainees View
  const filteredCohorts = cohortsList.filter(c => {
    const matchesSearch = !searchQuery || 
      (c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.outcomeId && c.outcomeId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.cohort && c.cohort.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'ALL' || c.status.toLowerCase().includes(statusFilter.toLowerCase());
    return matchesSearch && matchesStatus;
  });

  return (
    <Layout auth={auth} handleLogout={handleLogout}>
      <div className="space-y-6">
        
        {/* Success Alert Banner */}
        {actionSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-3.5 rounded-2xl text-sm font-semibold flex items-center justify-between shadow-sm animate-in fade-in">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-600" /> {actionSuccess}
            </span>
            <button onClick={() => setActionSuccess('')} className="text-green-600 hover:text-green-800"><X size={16} /></button>
          </div>
        )}

        {/* 1. INTELLIGENT ALERTS TICKER BANNER */}
        <div className="space-y-2">
          {intelligentAlerts.map(alert => (
            <div 
              key={alert.id} 
              className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all ${
                alert.type === 'critical' ? 'bg-red-50/80 border-red-200 text-red-950' :
                alert.type === 'warning' ? 'bg-amber-50/80 border-amber-200 text-amber-950' :
                'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {alert.type === 'critical' ? <AlertCircle size={18} className="text-red-600 shrink-0" /> :
                 alert.type === 'warning' ? <AlertTriangle size={18} className="text-amber-600 shrink-0" /> :
                 <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />}
                <div>
                  <span className="font-extrabold text-xs uppercase tracking-wider block sm:inline mr-2">
                    {alert.title}:
                  </span>
                  <span className="text-xs font-medium">{alert.desc}</span>
                </div>
              </div>

              <button 
                onClick={() => {
                  if (alert.targetId === 'followup') {
                    if (followUps.length > 0) handleNudgeTrainee(followUps[0].id, followUps[0].name);
                    else setActionSuccess('All trainee follow-ups are currently up to date!');
                  } else if (alert.targetId === 'skills') {
                    setActiveAdminTab('ai-skills');
                  } else {
                    setActiveAdminTab('ab-test');
                  }
                }}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm transition shrink-0 ${
                  alert.type === 'critical' ? 'bg-red-600 text-white hover:bg-red-700' :
                  alert.type === 'warning' ? 'bg-amber-600 text-white hover:bg-amber-700' :
                  'bg-emerald-700 text-white hover:bg-emerald-800'
                }`}
              >
                {alert.action} →
              </button>
            </div>
          ))}
        </div>

        {/* Top Header & Command Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              National Skilling Outcomes Intelligence
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Decision-support system for longitudinal retention, market skill gaps, and intervention ROI.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select 
              value={dateRange} 
              onChange={e => setDateRange(e.target.value)}
              className="bg-gray-50 border border-gray-300 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option>Q2 2025 (Apr - Jun)</option>
              <option>Q1 2025 (Jan - Mar)</option>
              <option>Full Year 2025 (YTD)</option>
              <option>All-Time Longitudinal</option>
            </select>

            <button 
              onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              className="bg-blue-50 border border-blue-200 px-3.5 py-2 rounded-xl text-xs font-bold text-blue-700 hover:bg-blue-100 flex items-center gap-1.5 transition shadow-sm"
            >
              <Filter size={14} /> Multi-Filter
            </button>

            <button 
              onClick={() => setShowInterventionModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Zap size={14} /> + New Intervention
            </button>

            <button 
              onClick={handleExportCSV}
              className="bg-gray-900 hover:bg-gray-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* 2. ADVANCED FEATURE TABS */}
        <div className="flex overflow-x-auto gap-2 pb-1 border-b border-gray-200 scrollbar-none">
          {[
            { id: 'overview', label: '📊 Overview & Health', icon: Activity },
            { id: 'ai-skills', label: '🤖 AI Skill-Gap Matrix', icon: Sparkles },
            { id: 'risk', label: '🔮 Employment Risk Signals', icon: AlertTriangle },
            { id: 'interventions', label: '🔄 Intervention Impact Tracker', icon: Zap },
            { id: 'ab-test', label: '🧪 Programme A/B Benchmark', icon: Layers },
            { id: 'geo-map', label: '🌍 Regional Skill Intelligence', icon: MapPin },
            { id: 'data-quality', label: '🔐 Privacy & Data Quality', icon: ShieldCheck },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveAdminTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all ${
                  activeAdminTab === tab.id 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Icon size={14} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* ================= TAB 1: OVERVIEW & PROGRAMME HEALTH ================= */}
        {activeAdminTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Top 5 KPIs Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'Consented Trainees', val: '2,543', trend: '+12%', sub: 'vs last quarter' },
                { label: 'Placement Rate', val: '86%', trend: '+8%', sub: 'Target: >70%' },
                { label: '6M Retention Rate', val: '78%', trend: '+6%', sub: 'Target: >65%' },
                { label: 'Avg Wage Growth', val: '+24%', trend: '+7%', sub: '₹13.5k → ₹20.3k' },
                { label: 'Self-Employed', val: '6%', trend: '+2%', sub: 'Freelance & Enterprise' },
              ].map((k, i) => (
                <div key={i} className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-xs text-gray-500 font-semibold mb-1">{k.label}</p>
                  <p className="text-2xl font-extrabold text-gray-900">{k.val}</p>
                  <p className="text-xs text-green-600 font-bold mt-1 flex items-center gap-1">
                    ↑ {k.trend} <span className="text-gray-400 font-normal">{k.sub}</span>
                  </p>
                </div>
              ))}
            </div>

            {/* PROGRAMME HEALTH SCORE SECTION (0-100) */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 flex flex-col items-center justify-center">
                    <span className="text-xl font-extrabold">{health.score}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-blue-500">/ 100</span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base">National Programme Health Score</h3>
                    <p className="text-xs text-gray-500">Composite index evaluating placement, retention, wage growth, skill usage, and employer validation.</p>
                  </div>
                </div>
                <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
                  ● Healthy Performance Tier
                </span>
              </div>

              {/* 5 Component Progress Bars */}
              <div className="grid md:grid-cols-5 gap-3 pt-2">
                {[
                  { name: 'Placement Rate', val: health.placement, color: 'bg-blue-600' },
                  { name: '6M Retention', val: health.retention, color: 'bg-emerald-600' },
                  { name: 'Wage Growth', val: health.wageGrowth, color: 'bg-green-500' },
                  { name: 'Skill Utilisation', val: health.skillUsage, color: 'bg-amber-500' },
                  { name: 'Employer Valid.', val: health.employerValidation, color: 'bg-purple-600' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-gray-700">
                      <span>{item.name}</span>
                      <span>{item.val}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.val}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* What Needs Attention Callouts */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 p-4 rounded-2xl border border-gray-200 space-y-2 text-xs">
                <span className="font-extrabold text-gray-900 uppercase text-[10px] tracking-wider">What Needs Attention?</span>
                <div className="grid md:grid-cols-3 gap-2 pt-1">
                  {health.attention.map((att, i) => (
                    <div key={i} className="flex items-start gap-2 text-gray-700">
                      <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${att.type === 'negative' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                      <span>{att.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Funnel */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-900">Longitudinal Retention Funnel</h3>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">67% 12M Retention</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center space-y-1.5">
                    <div className="bg-blue-600 text-white text-xs font-bold w-full py-3 rounded-xl text-center shadow-sm">2,543 (Enrolled & Consented)</div>
                    <div className="bg-purple-500 text-white text-xs font-bold w-11/12 py-3 rounded-xl text-center shadow-sm">2,187 (Placed - 86%)</div>
                    <div className="bg-pink-500 text-white text-xs font-bold w-5/6 py-3 rounded-xl text-center shadow-sm">1,990 (Employer Verified - 78%)</div>
                    <div className="bg-orange-400 text-white text-xs font-bold w-3/4 py-3 rounded-xl text-center shadow-sm">1,708 (Retained 3M - 67%)</div>
                    <div className="bg-yellow-400 text-white text-xs font-bold w-2/3 py-3 rounded-xl text-center shadow-sm">1,329 (Retained 6M - 52%)</div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowFunnelModal(true)}
                  className="text-xs font-bold text-blue-600 mt-6 text-center w-full hover:underline"
                >
                  Inspect drop-off analysis →
                </button>
              </div>

              {/* Wage Chart */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900">Wage Progression (Longitudinal Growth)</h3>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">+51% in 12 Mos</span>
                  </div>
                  <div className="h-56">
                    <Line data={wageData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                  </div>
                </div>
                <button 
                  onClick={() => setShowWageModal(true)}
                  className="text-xs font-bold text-blue-600 mt-4 text-center w-full hover:underline"
                >
                  View full wage breakdown report →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: AI SKILL-GAP & MARKET DEMAND ================= */}
        {activeAdminTab === 'ai-skills' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                    <Sparkles size={18} className="text-blue-600" /> AI Skill-Market Gap Engine
                  </h3>
                  <p className="text-xs text-gray-500">Triangulates Employer Requirements + Trainee Exam Scores + Job Outcomes to identify curriculum shortages.</p>
                </div>
                <button 
                  onClick={() => setShowInterventionModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-sm"
                >
                  + Deploy Remedial Campaign
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Skill Area</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Employer Demand</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Trainee Supply</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Skill Gap</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Affected Trainees</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">AI Recommendation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {skillMarketGaps.map((s, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-5 py-4 font-bold text-gray-900 text-xs">{s.skill}</td>
                        <td className="px-5 py-4 text-center font-bold text-xs text-blue-700">{s.demand}%</td>
                        <td className="px-5 py-4 text-center font-semibold text-xs text-gray-600">{s.supply}%</td>
                        <td className="px-5 py-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            s.status === 'HIGH' ? 'bg-red-100 text-red-800 border border-red-200' :
                            s.status === 'MODERATE' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            'bg-green-100 text-green-800 border border-green-200'
                          }`}>
                            {s.gap}% {s.status === 'HIGH' ? '🔴' : s.status === 'MODERATE' ? '🟡' : '🟢'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs font-semibold text-gray-700">{s.traineesAffected} Candidates</td>
                        <td className="px-5 py-4 text-xs text-gray-600 max-w-xs">{s.rec}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: EMPLOYMENT RISK PREDICTION ================= */}
        {activeAdminTab === 'risk' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                    <AlertTriangle size={18} className="text-amber-600" /> Employment Stability & Risk Prediction Engine
                  </h3>
                  <p className="text-xs text-gray-500">Decision-support signals identifying cohorts at risk of 6-month attrition before drop-off occurs.</p>
                </div>
                <span className="text-[11px] font-bold bg-blue-50 text-blue-800 px-3 py-1 rounded-full">
                  Decision Support Signal (Non-Profiling)
                </span>
              </div>

              {/* 3 Risk Tiers */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-5 rounded-3xl bg-green-50 border border-green-200 text-green-950 space-y-1">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider bg-green-200 text-green-900 px-2 py-0.5 rounded-full">
                    🟢 Low Attrition Risk
                  </span>
                  <p className="text-3xl font-extrabold mt-2">{risk.lowRisk}%</p>
                  <p className="text-xs text-green-800 font-medium">1,729 Candidates • Strong skill match & regular wage progression.</p>
                </div>

                <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                    🟡 Moderate Risk
                  </span>
                  <p className="text-3xl font-extrabold mt-2">{risk.mediumRisk}%</p>
                  <p className="text-xs text-amber-800 font-medium">559 Candidates • Borderline skill utilisation, stable salary.</p>
                </div>

                <div className="p-5 rounded-3xl bg-red-50 border border-red-200 text-red-950 space-y-1">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider bg-red-200 text-red-900 px-2 py-0.5 rounded-full">
                    🔴 High Risk Cohort
                  </span>
                  <p className="text-3xl font-extrabold mt-2">{risk.highRisk}%</p>
                  <p className="text-xs text-red-800 font-medium">254 Candidates • Requires immediate remedial micro-learning intervention.</p>
                </div>
              </div>

              {/* Root Cause Diagnostics Table */}
              <div className="pt-2">
                <h4 className="text-xs font-bold text-gray-700 uppercase mb-2">Primary Drivers of High-Risk Classification</h4>
                <div className="space-y-2 text-xs">
                  {risk.primaryReasons.map((r, i) => (
                    <div key={i} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-gray-900">{r.reason}</span>
                        <span className="text-gray-400 ml-2">({r.percentage}% of high-risk pool)</span>
                      </div>
                      <button 
                        onClick={() => setShowInterventionModal(true)}
                        className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1"
                      >
                        Action: {r.action} →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: INTERVENTION IMPACT TRACKER ================= */}
        {activeAdminTab === 'interventions' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                    <Zap size={18} className="text-purple-600" /> Intervention Impact Tracking (Before vs. After)
                  </h3>
                  <p className="text-xs text-gray-500">Measures whether a specific skilling intervention actually produced retention and wage improvements.</p>
                </div>
                <button 
                  onClick={() => setShowInterventionModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-sm"
                >
                  + Launch New Campaign
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {interventionsHistory.map(inv => (
                  <div key={inv.id} className="p-5 rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 shadow-sm flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold uppercase bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full">
                          {inv.status}
                        </span>
                        <span className="text-xs font-extrabold text-emerald-700">{inv.retentionLift}</span>
                      </div>
                      <h4 className="font-extrabold text-gray-900 text-sm">{inv.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Target: {inv.target} • Duration: {inv.duration}</p>
                    </div>

                    {/* Before vs After Progress Gauge */}
                    <div className="space-y-2 bg-white p-3.5 rounded-2xl border border-indigo-100 text-xs">
                      <div>
                        <div className="flex justify-between font-bold text-gray-500 mb-0.5">
                          <span>Before Intervention</span>
                          <span>{inv.beforeUsage}% Skill Usage</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full">
                          <div className="bg-gray-400 h-2 rounded-full" style={{ width: `${inv.beforeUsage}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-bold text-emerald-700 mb-0.5">
                          <span>After Intervention</span>
                          <span>{inv.afterUsage}% (+{inv.afterUsage - inv.beforeUsage}%)</span>
                        </div>
                        <div className="w-full bg-emerald-100 h-2 rounded-full">
                          <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${inv.afterUsage}%` }}></div>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-gray-500 flex justify-between items-center pt-1 border-t border-indigo-100">
                      <span>Channel: WhatsApp Micro-LMS</span>
                      <button className="font-bold text-indigo-700 hover:underline">Full Report →</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: PROGRAMME A/B COMPARISON ================= */}
        {activeAdminTab === 'ab-test' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <div className="pb-2 border-b border-gray-100">
                <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                  <Layers size={18} className="text-blue-600" /> Programme A/B Comparison Matrix
                </h3>
                <p className="text-xs text-gray-500">Compares different pedagogical training approaches to discover which model achieves superior retention and wage growth.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Scheme A */}
                <div className="p-6 rounded-3xl bg-gray-50 border border-gray-200 space-y-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase bg-gray-200 text-gray-800 px-2.5 py-0.5 rounded-full">Approach A</span>
                    <h4 className="font-extrabold text-gray-900 text-base mt-1">{ab.progA?.name}</h4>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between p-2.5 bg-white rounded-xl"><span>Placement Rate:</span><strong className="text-gray-900">{ab.progA?.placement}%</strong></div>
                    <div className="flex justify-between p-2.5 bg-white rounded-xl"><span>3-Month Retention:</span><strong className="text-gray-900">{ab.progA?.retention3M}%</strong></div>
                    <div className="flex justify-between p-2.5 bg-white rounded-xl"><span>6-Month Retention:</span><strong className="text-gray-900">{ab.progA?.retention6M}%</strong></div>
                    <div className="flex justify-between p-2.5 bg-white rounded-xl"><span>Average Wage Growth:</span><strong className="text-gray-900">+{ab.progA?.wageGrowth}%</strong></div>
                    <div className="flex justify-between p-2.5 bg-white rounded-xl"><span>Skill Utilisation Rate:</span><strong className="text-gray-900">{ab.progA?.skillUsage}%</strong></div>
                  </div>
                </div>

                {/* Scheme B */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 space-y-4 shadow-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase bg-emerald-200 text-emerald-900 px-2.5 py-0.5 rounded-full">Approach B (Winner)</span>
                      <h4 className="font-extrabold text-emerald-950 text-base mt-1">{ab.progB?.name}</h4>
                    </div>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-xl">🏆 +11% Retention Lift</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between p-2.5 bg-white rounded-xl"><span>Placement Rate:</span><strong className="text-emerald-700">{ab.progB?.placement}% (+6%)</strong></div>
                    <div className="flex justify-between p-2.5 bg-white rounded-xl"><span>3-Month Retention:</span><strong className="text-emerald-700">{ab.progB?.retention3M}% (+7%)</strong></div>
                    <div className="flex justify-between p-2.5 bg-white rounded-xl"><span>6-Month Retention:</span><strong className="text-emerald-700">{ab.progB?.retention6M}% (+11%)</strong></div>
                    <div className="flex justify-between p-2.5 bg-white rounded-xl"><span>Average Wage Growth:</span><strong className="text-emerald-700">+{ab.progB?.wageGrowth}% (+8%)</strong></div>
                    <div className="flex justify-between p-2.5 bg-white rounded-xl"><span>Skill Utilisation Rate:</span><strong className="text-emerald-700">{ab.progB?.skillUsage}% (+16%)</strong></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 6: GEOGRAPHIC REGIONAL SKILL MAP ================= */}
        {activeAdminTab === 'geo-map' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <div className="pb-2 border-b border-gray-100">
                <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                  <MapPin size={18} className="text-blue-600" /> Geographic Regional Skill Intelligence
                </h3>
                <p className="text-xs text-gray-500">Select a region to analyze localized employer hiring demands and regional skill gaps.</p>
              </div>

              {/* City / State Selector Buttons */}
              <div className="flex flex-wrap gap-2">
                {geoSkills.map(g => (
                  <button
                    key={g.city}
                    onClick={() => setSelectedCity(g.city)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                      selectedCity === g.city ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    📍 {g.city}
                  </button>
                ))}
              </div>

              {/* Selected City Intelligence Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-3xl border border-blue-100 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xl font-extrabold text-blue-950">{currentGeo.city} Regional Analytics</h4>
                    <p className="text-xs text-blue-700">Region: {currentGeo.region} India • Real-time employer triangulation</p>
                  </div>
                  <span className="text-xs font-bold bg-white text-blue-900 px-3 py-1 rounded-full shadow-sm">
                    {currentGeo.placement}% Placement Rate
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 bg-white rounded-2xl shadow-sm">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Top Employer Demands</span>
                    <ul className="mt-2 space-y-1 font-bold text-gray-800">
                      {currentGeo.topDemands?.map((d, i) => <li key={i}>• {d}</li>)}
                    </ul>
                  </div>

                  <div className="p-4 bg-white rounded-2xl shadow-sm">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Largest Regional Skill Gap</span>
                    <p className="text-sm font-extrabold text-red-600 mt-2">{currentGeo.topGap}</p>
                    <p className="text-[11px] text-gray-500 mt-1">Shortage reported by 64% of local employers.</p>
                  </div>

                  <div className="p-4 bg-white rounded-2xl shadow-sm">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">6-Month Longitudinal Retention</span>
                    <p className="text-sm font-extrabold text-emerald-700 mt-2">{currentGeo.retention6M}%</p>
                    <p className="text-[11px] text-gray-500 mt-1">Exceeds national 65% baseline.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 7: DATA QUALITY & PRIVACY CONTROL ================= */}
        {activeAdminTab === 'data-quality' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <div className="pb-2 border-b border-gray-100">
                <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                  <ShieldCheck size={18} className="text-blue-600" /> Data Quality & Differential Privacy Verification Layer
                </h3>
                <p className="text-xs text-gray-500">Guarantees verifiable triangulation while safeguarding citizen privacy under the DPDP framework.</p>
              </div>

              {/* Data Quality Metrics Grid */}
              <div className="grid md:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-green-50 rounded-2xl border border-green-200">
                  <span className="text-green-800 font-bold uppercase text-[10px]">Employer Verified Signals</span>
                  <p className="text-2xl font-extrabold text-green-950 mt-1">{dataQuality.employerVerified}%</p>
                  <p className="text-green-700 text-[11px] mt-0.5">Triangulated with enterprise HR payroll.</p>
                </div>

                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                  <span className="text-blue-800 font-bold uppercase text-[10px]">Trainee Self-Reported</span>
                  <p className="text-2xl font-extrabold text-blue-950 mt-1">{dataQuality.traineeReported}%</p>
                  <p className="text-blue-700 text-[11px] mt-0.5">Direct 30-second low-burden check-ins.</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                  <span className="text-gray-600 font-bold uppercase text-[10px]">Duplicate Records Filtered</span>
                  <p className="text-2xl font-extrabold text-gray-900 mt-1">{dataQuality.duplicateRecords}%</p>
                  <p className="text-gray-500 text-[11px] mt-0.5">Automated deduplication algorithm active.</p>
                </div>

                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200">
                  <span className="text-purple-800 font-bold uppercase text-[10px]">Differential Privacy Parameter</span>
                  <p className="text-lg font-extrabold text-purple-950 mt-1 font-mono">ε = 0.5</p>
                  <p className="text-purple-700 text-[11px] mt-0.5">Provably private aggregated reporting.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODALS ================= */}

        {/* 1. Full Funnel Modal */}
        {showFunnelModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-7 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 text-lg">Longitudinal Retention Funnel</h3>
                <button onClick={() => setShowFunnelModal(false)} className="text-gray-400 hover:text-gray-700 p-1"><X size={18} /></button>
              </div>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex justify-between font-bold text-blue-900 mb-1">
                    <span>1. Enrolled & Trained</span>
                    <span>2,543 Trainees (100%)</span>
                  </div>
                  <div className="w-full bg-blue-200 h-2 rounded-full"><div className="bg-blue-600 h-2 rounded-full w-full"></div></div>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <div className="flex justify-between font-bold text-purple-900 mb-1">
                    <span>2. Initial Placement (Month 0)</span>
                    <span>2,187 Placed (86%)</span>
                  </div>
                  <div className="w-full bg-purple-200 h-2 rounded-full"><div className="bg-purple-600 h-2 rounded-full" style={{width: '86%'}}></div></div>
                </div>
                <div className="p-3 bg-pink-50 rounded-xl border border-pink-100">
                  <div className="flex justify-between font-bold text-pink-900 mb-1">
                    <span>3. Employer Verified (Month 1-2)</span>
                    <span>1,990 Verified (78%)</span>
                  </div>
                  <div className="w-full bg-pink-200 h-2 rounded-full"><div className="bg-pink-600 h-2 rounded-full" style={{width: '78%'}}></div></div>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="flex justify-between font-bold text-amber-900 mb-1">
                    <span>4. 3-Month Retention Check-in</span>
                    <span>1,708 Retained (67%)</span>
                  </div>
                  <div className="w-full bg-amber-200 h-2 rounded-full"><div className="bg-amber-600 h-2 rounded-full" style={{width: '67%'}}></div></div>
                </div>
              </div>
              <button onClick={() => setShowFunnelModal(false)} className="mt-6 w-full py-2.5 bg-gray-900 text-white text-xs font-bold rounded-xl">Close</button>
            </div>
          </div>
        )}

        {/* 2. Wage Report Modal */}
        {showWageModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-7 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 text-lg">Longitudinal Wage Progression Report</h3>
                <button onClick={() => setShowWageModal(false)} className="text-gray-400 hover:text-gray-700 p-1"><X size={18} /></button>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="font-semibold text-gray-700">Placement Starting Salary</span>
                  <span className="font-bold text-gray-900">₹13,500 / month</span>
                </div>
                <div className="flex justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="font-semibold text-gray-700">3-Month Follow-up Average</span>
                  <span className="font-bold text-gray-900">₹16,200 / month (+20%)</span>
                </div>
                <div className="flex justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="font-semibold text-gray-700">6-Month Follow-up Average</span>
                  <span className="font-bold text-green-700">₹19,800 / month (+46%)</span>
                </div>
                <div className="flex justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="font-semibold text-gray-700">12-Month Follow-up Average</span>
                  <span className="font-bold text-green-700">₹20,350 / month (+51%)</span>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowWageModal(false)} className="flex-1 py-2.5 border border-gray-200 text-xs font-semibold rounded-xl">Close</button>
                <button onClick={handleExportCSV} className="flex-1 py-2.5 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 flex items-center justify-center gap-1.5">
                  <Download size={14} /> Download CSV
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Deploy New Intervention Modal */}
        {showInterventionModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-7 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <Zap size={20} className="text-purple-600" /> Deploy Remedial Intervention
                </h3>
                <button onClick={() => setShowInterventionModal(false)} className="text-gray-400 hover:text-gray-700 p-1"><X size={18} /></button>
              </div>

              <form onSubmit={handleCreateIntervention} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Campaign Title</label>
                  <input 
                    type="text" 
                    required
                    value={newCampaignName}
                    onChange={e => setNewCampaignName(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl bg-gray-50 text-xs font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Target Skill Gap</label>
                    <select value={newSkillTarget} onChange={e => setNewSkillTarget(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-xl bg-gray-50">
                      <option value="PLC Basics">PLC Automation Basics</option>
                      <option value="Advanced Excel">Advanced Excel & Data</option>
                      <option value="Digital Docs">Digital Documentation</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Target Region</label>
                    <select value={newTargetRegion} onChange={e => setNewTargetRegion(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-xl bg-gray-50">
                      <option>North Region</option>
                      <option>South Region</option>
                      <option>Pan-India All Batches</option>
                    </select>
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-purple-900">
                  <p className="font-bold mb-0.5">Delivery Mechanism: WhatsApp Micro-LMS & Mobile Learning</p>
                  <p className="text-[11px] text-purple-700">Projected impact: +18% retention lift across target cohort.</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowInterventionModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl font-semibold">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md">Deploy Intervention Now</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
