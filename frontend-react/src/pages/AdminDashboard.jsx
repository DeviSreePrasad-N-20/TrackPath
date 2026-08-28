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
  RefreshCw, Search, PhoneCall, Send, Users, TrendingUp, Award, Building, Check, Clock, PlusCircle, ShieldCheck
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

export default function AdminDashboard({ auth, handleLogout }) {
  const [data, setData] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [filters, setFilters] = useState({ scheme: '', region: '', trade: '', cohort: '', gender: '' });
  const [dateRange, setDateRange] = useState('Q2 2025 (Apr - Jun)');
  
  // Search & Tab States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedJourney, setSelectedJourney] = useState(null);

  // Modals & Drawers
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [showFunnelModal, setShowFunnelModal] = useState(false);
  const [showWageModal, setShowWageModal] = useState(false);
  const [showSkillGapsModal, setShowSkillGapsModal] = useState(false);
  const [showDistributionModal, setShowDistributionModal] = useState(false);
  const [showInterventionModal, setShowInterventionModal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  // Active Interventions state
  const [interventions, setInterventions] = useState([
    { id: 1, name: 'Digital Documentation Micro-Module', skill: 'Digital Docs', target: '25 Trainees', status: 'Active', lift: '+18% Retention' },
    { id: 2, name: 'Advanced Excel Bridge Program', skill: 'Excel & Data', target: '38 Trainees', status: 'Active', lift: '+24% Wage Jump' },
  ]);

  // New Intervention Form
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
    const newCamp = {
      id: Date.now(),
      name: newCampaignName,
      skill: newSkillTarget,
      target: '30 Candidates',
      status: 'Active',
      lift: '+20% Projected'
    };
    setInterventions([newCamp, ...interventions]);
    setShowInterventionModal(false);
    setActionSuccess(`Remedial Intervention "${newCampaignName}" successfully deployed!`);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  if (!data) return (
    <Layout auth={auth} handleLogout={handleLogout}>
      <div className="flex justify-center items-center h-64 text-gray-500">Loading outcome intelligence...</div>
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

        {/* Top Header & Command Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              {isTrainees ? 'Trainee Cohorts & Individual Outcomes' :
               isOutcomes ? 'Outcomes Timeline & Early Warning Engine' :
               isResults ? 'Scheme Benchmarking & ROI Analysis' :
               'Programme insights. Impact that matters.'}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">National Skilling Longitudinal Intelligence • Real-time employer triangulation</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Preset Date Range Picker */}
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

        {/* Multi-Dimension Filter Drawer */}
        {showFilterDrawer && (
          <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-xl space-y-4 animate-in fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <Filter size={16} className="text-blue-600" /> Filter Longitudinal Dataset ({filteredCohorts.length} matches)
              </h3>
              <button 
                onClick={() => setFilters({ scheme: '', region: '', trade: '', cohort: '', gender: '' })} 
                className="text-xs text-blue-600 hover:underline font-bold"
              >
                Reset All Filters
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Scheme</label>
                <select value={filters.scheme} onChange={e => setFilters({...filters, scheme: e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50 font-medium">
                  <option value="">All Schemes</option>
                  {schemesList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">Region</label>
                <select value={filters.region} onChange={e => setFilters({...filters, region: e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50 font-medium">
                  <option value="">All Regions</option>
                  <option value="North">North Region</option>
                  <option value="South">South Region</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">Trade</label>
                <select value={filters.trade} onChange={e => setFilters({...filters, trade: e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50 font-medium">
                  <option value="">All Trades</option>
                  <option value="IT & Software">IT & Software</option>
                  <option value="Renewables">Renewables</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">Cohort Batch</label>
                <select value={filters.cohort} onChange={e => setFilters({...filters, cohort: e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50 font-medium">
                  <option value="">All Batches</option>
                  <option value="2025-Q1">2025-Q1</option>
                  <option value="2024-Q4">2024-Q4</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">Gender</label>
                <select value={filters.gender} onChange={e => setFilters({...filters, gender: e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50 font-medium">
                  <option value="">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 1. TRAINEES SUB-VIEW (/admin/trainees) */}
        {isTrainees && (
          <div className="space-y-6">
            {/* Search & Filter Bar */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search candidate name, ID code, or cohort batch..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-xs bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                {['ALL', 'employed', 'seeking'].map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                      statusFilter === st ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {st === 'ALL' ? 'All Statuses' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Trainees Directory Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">Trainee Longitudinal Cohort Directory</h3>
                <span className="text-xs font-semibold text-gray-500">Showing {filteredCohorts.length} candidates</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Trainee Name</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">ID Code</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Cohort</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Current Status</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Latest Milestone</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredCohorts.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4 font-bold text-gray-900">{c.name || 'Candidate'}</td>
                        <td className="px-5 py-4 font-mono text-xs text-gray-500">{c.outcomeId}</td>
                        <td className="px-5 py-4 text-xs text-gray-600 font-medium">{c.cohort}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${
                            c.status === 'employed' 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-600">
                          {c.timeline?.length > 0 ? `${c.timeline.length} Check-ins Logged` : 'Training Completed'}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button 
                            onClick={() => setSelectedJourney(c)}
                            className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-200 transition"
                          >
                            Inspect Journey →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. OUTCOMES SUB-VIEW (/admin/outcomes) */}
        {isOutcomes && (
          <div className="space-y-6">
            {/* Live Follow-up Queue */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Active Follow-up Queue (Nudge Engine)</h3>
                  <p className="text-xs text-gray-500">Candidates due for 3-month retention check-ins who have not yet submitted status.</p>
                </div>
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
                  {followUps.length} Pending Nudges
                </span>
              </div>

              <div className="divide-y divide-gray-100">
                {followUps.length === 0 ? (
                  <p className="py-6 text-center text-xs text-gray-400">All candidate follow-ups are up to date for this cycle!</p>
                ) : (
                  followUps.slice(0, 5).map(f => (
                    <div key={f.id} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-xs text-gray-900">{f.name} <span className="font-mono text-gray-400 font-normal">({f.outcomeId})</span></p>
                        <p className="text-[11px] text-gray-500">Contact: {f.contact || '+91 98765-XXXXX'} • Due: 3-Month Retention Signal</p>
                      </div>
                      <button 
                        onClick={() => handleNudgeTrainee(f.id, f.name)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                      >
                        <Send size={12} /> Send WhatsApp Nudge
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Active Remedial Interventions List */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-indigo-950 text-base flex items-center gap-2">
                    <Zap size={18} className="text-indigo-600" /> Active Early Warning & Remedial Interventions
                  </h3>
                  <p className="text-xs text-indigo-700">Automated micro-learning campaigns dispatched based on real-time employer signals.</p>
                </div>
                <button 
                  onClick={() => setShowInterventionModal(true)}
                  className="bg-indigo-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-sm"
                >
                  + Deploy Campaign
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {interventions.map(inv => (
                  <div key={inv.id} className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                          {inv.status}
                        </span>
                        <span className="text-xs font-bold text-indigo-600">{inv.lift}</span>
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">{inv.name}</h4>
                      <p className="text-xs text-gray-500">Targeting: {inv.target} • Skill Area: {inv.skill}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                      <span className="text-gray-400">Deployed via WhatsApp & LMS</span>
                      <button className="text-indigo-600 font-bold hover:underline">View Analytics →</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. PROGRAMME BENCHMARKS SUB-VIEW (/admin/results) */}
        {isResults && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Scheme-by-Scheme Comparative Benchmark</h3>
                  <p className="text-xs text-gray-500">Evaluates placement, 6-month retention against the 70% national benchmark threshold.</p>
                </div>
                <button 
                  onClick={handleExportCSV}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Download size={13} /> Export Report
                </button>
              </div>

              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Scheme Name</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Trade / Sector</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Region</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Placement %</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">6M Retention %</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {schemesList.map(s => {
                    const passesBenchmark = (s.placementRate || 86) >= 70;
                    return (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4 font-bold text-gray-900">{s.name}</td>
                        <td className="px-5 py-4 text-xs text-gray-600">{s.trade}</td>
                        <td className="px-5 py-4 text-xs text-gray-600">{s.region}</td>
                        <td className="px-5 py-4 text-xs font-bold text-green-700">{s.placementRate || 86}%</td>
                        <td className="px-5 py-4 text-xs font-bold text-blue-700">{s.retention6 || 78}%</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            passesBenchmark ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {passesBenchmark ? '✓ Exceeds Benchmark' : 'Needs Review'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. MAIN OVERVIEW INTELLIGENCE DASHBOARD (Default) */}
        {!isTrainees && !isOutcomes && !isResults && (
          <>
            {/* Top 5 KPIs Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'Consented Trainees', val: '2,543', trend: '+12%', sub: 'vs last quarter' },
                { label: 'Placement Rate', val: '86%', trend: '+8%', sub: 'Target: >70%' },
                { label: '6M Retention Rate', val: '78%', trend: '+6%', sub: 'Target: >65%' },
                { label: 'Avg Wage Growth', val: '+24%', trend: '+7%', sub: '₹13.5k → ₹20.3k' },
                { label: 'Self-Employed', val: '6%', trend: '+2%', sub: 'Freelance & Enterprise' },
              ].map((k, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-xs text-gray-500 font-semibold mb-1">{k.label}</p>
                  <p className="text-2xl font-extrabold text-gray-900">{k.val}</p>
                  <p className="text-xs text-green-600 font-bold mt-1 flex items-center gap-1">
                    ↑ {k.trend} <span className="text-gray-400 font-normal">{k.sub}</span>
                  </p>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Funnel */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
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
                  className="text-sm font-bold text-blue-600 mt-6 text-center w-full hover:underline"
                >
                  Inspect drop-off analysis →
                </button>
              </div>

              {/* Wage Chart */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
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
                  className="text-sm font-bold text-blue-600 mt-4 text-center w-full hover:underline"
                >
                  View full wage breakdown report →
                </button>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Skill Gaps Matrix */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900">Regional Skill Gap Matrix</h3>
                    <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded font-bold">2 High Priority</span>
                  </div>
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-gray-100 text-xs text-gray-400">
                      <tr>
                        <th className="pb-2 font-semibold">Skill Area</th>
                        <th className="pb-2 font-semibold text-center">Demand</th>
                        <th className="pb-2 font-semibold text-center">Score</th>
                        <th className="pb-2 font-semibold text-center">Gap</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {[
                        { skill: 'Advanced Excel', d: '78%', p: '32%', gap: '46%', level: 'High' },
                        { skill: 'Digital Documentation', d: '74%', p: '35%', gap: '39%', level: 'High' },
                        { skill: 'PLC Basics', d: '68%', p: '29%', gap: '39%', level: 'Moderate' },
                        { skill: 'Data Analysis', d: '62%', p: '31%', gap: '31%', level: 'Moderate' },
                        { skill: 'Communication', d: '85%', p: '58%', gap: '27%', level: 'Low' },
                      ].map((s, i) => (
                        <tr key={i}>
                          <td className="py-2.5 font-bold text-gray-900 text-xs">{s.skill}</td>
                          <td className="py-2.5 text-center text-xs text-gray-600">{s.d}</td>
                          <td className="py-2.5 text-center text-xs text-gray-600">{s.p}</td>
                          <td className="py-2.5 text-center">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              s.level === 'High' ? 'text-red-700 bg-red-50 border border-red-200' : 'text-amber-700 bg-amber-50 border border-amber-200'
                            }`}>
                              {s.gap}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button 
                  onClick={() => setShowSkillGapsModal(true)}
                  className="text-sm font-bold text-blue-600 mt-4 text-center w-full hover:underline"
                >
                  View full heatmap & deploy fixes →
                </button>
              </div>

              {/* Outcome Distribution Donut */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900">Employment Pathway Breakdown</h3>
                    <span className="text-xs font-semibold text-gray-400">Total: 2,543</span>
                  </div>
                  <div className="flex items-center justify-center h-52 relative">
                    <div className="w-52 h-52">
                      <Doughnut data={donutData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} />
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowDistributionModal(true)}
                  className="text-sm font-bold text-blue-600 mt-4 text-center w-full hover:underline"
                >
                  Inspect demographic cross-tabs →
                </button>
              </div>
            </div>
          </>
        )}

        {/* ================= MODALS & ACTIONS ================= */}

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

        {/* 3. Skill Gaps Heatmap Modal */}
        {showSkillGapsModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-7 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 text-lg">Full Skill Gap Intelligence Heatmap</h3>
                <button onClick={() => setShowSkillGapsModal(false)} className="text-gray-400 hover:text-gray-700 p-1"><X size={18} /></button>
              </div>
              <div className="space-y-2 text-xs">
                <p className="text-gray-500 mb-3">Triangulated from 12 partner employer job postings vs. graduate exam scores.</p>
                <div className="p-3 bg-red-50 text-red-900 rounded-xl border border-red-100 flex justify-between items-center">
                  <span>Advanced Excel Modeling</span>
                  <span className="font-bold bg-red-100 px-2 py-0.5 rounded">46% Gap (High Priority)</span>
                </div>
                <div className="p-3 bg-red-50 text-red-900 rounded-xl border border-red-100 flex justify-between items-center">
                  <span>Digital Documentation</span>
                  <span className="font-bold bg-red-100 px-2 py-0.5 rounded">39% Gap (High Priority)</span>
                </div>
                <div className="p-3 bg-amber-50 text-amber-900 rounded-xl border border-amber-100 flex justify-between items-center">
                  <span>PLC Programming Basics</span>
                  <span className="font-bold bg-amber-100 px-2 py-0.5 rounded">39% Gap (Moderate)</span>
                </div>
              </div>
              <button 
                onClick={() => { setShowSkillGapsModal(false); setShowInterventionModal(true); }} 
                className="mt-6 w-full py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700"
              >
                Launch Automated Remedial Campaign →
              </button>
            </div>
          </div>
        )}

        {/* 4. Demographic Breakdown Modal */}
        {showDistributionModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-7 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 text-lg">Demographic Pathway Breakdown</h3>
                <button onClick={() => setShowDistributionModal(false)} className="text-gray-400 hover:text-gray-700 p-1"><X size={18} /></button>
              </div>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl flex justify-between">
                  <span className="font-semibold text-gray-700">Formal Employment (Tech / IT / Green)</span>
                  <span className="font-bold text-gray-900">1,708 Trainees (67%)</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl flex justify-between">
                  <span className="font-semibold text-gray-700">Actively Seeking Placement</span>
                  <span className="font-bold text-amber-700">635 Trainees (25%)</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl flex justify-between">
                  <span className="font-semibold text-gray-700">Self-Employed / Freelance Enterprises</span>
                  <span className="font-bold text-purple-700">152 Trainees (6%)</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl flex justify-between">
                  <span className="font-semibold text-gray-700">Registered Apprenticeships</span>
                  <span className="font-bold text-blue-700">51 Trainees (2%)</span>
                </div>
              </div>
              <button onClick={() => setShowDistributionModal(false)} className="mt-6 w-full py-2.5 bg-gray-900 text-white text-xs font-bold rounded-xl">Close</button>
            </div>
          </div>
        )}

        {/* 5. Deploy New Intervention Modal */}
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
                      <option value="PLC Basics">PLC Basics</option>
                      <option value="Advanced Excel">Advanced Excel</option>
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
                  <p className="font-bold mb-0.5">Deployment Channel: WhatsApp & iGOT Mobile Micro-Modules</p>
                  <p className="text-[11px] text-purple-700">Estimated cohort coverage: ~30 at-risk candidates with 20% projected retention lift.</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowInterventionModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl font-semibold">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md">Deploy Intervention Now</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 6. Inspect Trainee Journey Modal */}
        {selectedJourney && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-7 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{selectedJourney.name || 'Candidate'} Journey</h3>
                  <p className="text-xs text-gray-500">ID: {selectedJourney.outcomeId} • Cohort: {selectedJourney.cohort}</p>
                </div>
                <button onClick={() => setSelectedJourney(null)} className="text-gray-400 hover:text-gray-700 p-1"><X size={18} /></button>
              </div>
              <div className="relative border-l-2 border-purple-200 ml-4 space-y-6 py-2">
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 bg-purple-600 rounded-full ring-4 ring-white"></div>
                  <h4 className="font-bold text-gray-900 text-xs">Training Completed</h4>
                  <p className="text-[11px] text-gray-500">Scheme Batch {selectedJourney.cohort} • Certified</p>
                </div>
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 bg-green-600 rounded-full ring-4 ring-white"></div>
                  <h4 className="font-bold text-gray-900 text-xs">Placed & Employed</h4>
                  <p className="text-[11px] text-gray-500">Current Status: {selectedJourney.status} • Verified by TechSolutions</p>
                </div>
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 bg-blue-600 rounded-full ring-4 ring-white"></div>
                  <h4 className="font-bold text-gray-900 text-xs">Longitudinal Tracking Status</h4>
                  <p className="text-[11px] text-gray-500">Consent active • 3-Month Retention Verified</p>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={() => setSelectedJourney(null)} className="flex-1 py-2.5 border border-gray-200 text-xs font-semibold rounded-xl">Close</button>
                <button 
                  onClick={() => { setSelectedJourney(null); handleNudgeTrainee(selectedJourney.id, selectedJourney.name); }}
                  className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Send size={14} /> Send WhatsApp Nudge
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
