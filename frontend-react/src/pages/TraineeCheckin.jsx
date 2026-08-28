import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import Layout from '../components/Layout';
import { Briefcase, CreditCard, Award, ArrowRight, UserCheck, MessageSquare, CheckCircle2, Clock, X, Shield, Calendar, MapPin, Building, Sparkles } from 'lucide-react';

export default function TraineeCheckin({ auth, handleLogout }) {
  const [traineeDetail, setTraineeDetail] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Active view based on URL
  const path = location.pathname;
  const isProfile = path.includes('/profile');
  const isJourney = path.includes('/journey');
  const isUpdates = path.includes('/updates');

  // Modals state
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showWageModal, setShowWageModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  // Form states
  const [status, setStatus] = useState('employed');
  const [roleTitle, setRoleTitle] = useState('Junior Software Associate');
  const [wageBand, setWageBand] = useState('₹20k - ₹30k');
  const [usingSkill, setUsingSkill] = useState(true);
  const [dropoutReason, setDropoutReason] = useState('Low wages');
  const [consent, setConsent] = useState(true);

  const loadProfile = async () => {
    try {
      const res = await api.get(`/api/trainees/me`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setTraineeDetail(res.data);
      setConsent(Boolean(res.data.consent));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleConsentToggle = async () => {
    try {
      const newConsent = !consent;
      setConsent(newConsent);
      await api.patch('/api/trainees/me/consent', { consent: newConsent });
      setActionSuccess(newConsent ? 'Consent enabled for tracking' : 'Consent revoked');
      setTimeout(() => setActionSuccess(''), 3000);
      loadProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckinSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/checkins', {
        status,
        role: roleTitle,
        wageBand,
        usingSkill,
        selfEmployed: status === 'self-employed'
      });
      setShowUpdateModal(false);
      setShowWageModal(false);
      setShowSkillModal(false);
      setActionSuccess('Employment check-in submitted successfully!');
      setTimeout(() => setActionSuccess(''), 3500);
      loadProfile();
    } catch (err) {
      console.error(err);
    }
  };

  if (!traineeDetail) return (
    <Layout auth={auth} handleLogout={handleLogout}>
      <div className="flex justify-center items-center h-64 text-gray-500">Loading trainee profile...</div>
    </Layout>
  );

  const checkins = traineeDetail.checkins || [];
  const latestCheckin = checkins[checkins.length - 1];
  const isEmployed = latestCheckin?.status === 'employed' || latestCheckin?.selfEmployed;

  return (
    <Layout auth={auth} handleLogout={handleLogout}>
      <div className="space-y-6">
        
        {/* Success Banner */}
        {actionSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-3.5 rounded-xl text-sm font-medium flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-600" /> {actionSuccess}
            </span>
            <button onClick={() => setActionSuccess('')} className="text-green-600 hover:text-green-800"><X size={14} /></button>
          </div>
        )}

        {/* 1. MY PROFILE VIEW */}
        {isProfile && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-500 text-sm">Personal details, training batch credentials, and consent preferences.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Profile Card */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl">
                  {traineeDetail.name?.split(' ').map(n => n[0]).join('') || 'AP'}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{traineeDetail.name || 'Amit Patel'}</h3>
                  <p className="text-xs text-gray-500">Trainee ID: <span className="font-mono text-gray-700">{traineeDetail.outcomeId || 'TP-2025-Q1-T01'}</span></p>
                </div>
                <div className="pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-600">
                  <p className="flex items-center gap-2"><MapPin size={14} className="text-gray-400" /> North Region, India</p>
                  <p className="flex items-center gap-2"><Calendar size={14} className="text-gray-400" /> Batch: {traineeDetail.cohort || '2025-Q1'}</p>
                </div>
              </div>

              {/* Training Program Details */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm md:col-span-2 space-y-4">
                <h3 className="font-bold text-gray-900">Skilling Certification</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-400 font-semibold mb-1">Scheme</p>
                    <p className="font-bold text-gray-800">Digital Skilling Initiative (DSI)</p>
                  </div>
                  <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-400 font-semibold mb-1">Trade</p>
                    <p className="font-bold text-gray-800">IT & Software Associate</p>
                  </div>
                  <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-400 font-semibold mb-1">Training Completed On</p>
                    <p className="font-bold text-gray-800">{traineeDetail.trainedOn || '2025-01-15'}</p>
                  </div>
                  <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-400 font-semibold mb-1">Certified Skills</p>
                    <p className="font-bold text-gray-800">Excel, Python, Digital Docs</p>
                  </div>
                </div>

                {/* Consent Section */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                      <Shield size={16} className="text-green-600" /> Longitudinal Tracking Consent
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">Allows anonymous employment signals to measure training impact.</p>
                  </div>
                  <button
                    onClick={handleConsentToggle}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                      consent ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {consent ? '✓ Consent Active' : 'Consent Inactive'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. OUTCOME JOURNEY VIEW */}
        {isJourney && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Outcome Journey Timeline</h1>
              <p className="text-gray-500 text-sm">Longitudinal milestones tracked over 12 months after completion.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-8">
              <div className="relative border-l-2 border-blue-200 ml-4 space-y-8 py-2">
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 bg-blue-600 rounded-full ring-4 ring-white shadow"></div>
                  <h4 className="font-bold text-gray-900 text-sm">Training Completed</h4>
                  <p className="text-xs text-gray-500">Graduated with certification in IT & Software • Jan 2025</p>
                </div>

                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 bg-blue-600 rounded-full ring-4 ring-white shadow"></div>
                  <h4 className="font-bold text-gray-900 text-sm">Actively Seeking & Placed</h4>
                  <p className="text-xs text-gray-500">Secured placement opportunity • Feb 2025</p>
                </div>

                <div className="relative pl-6">
                  <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ring-4 ring-white shadow ${isEmployed ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                  <h4 className="font-bold text-gray-900 text-sm">Employed (Initial Milestone)</h4>
                  <p className="text-xs text-gray-500">Role: Junior Software Associate ({latestCheckin?.wageBand || '₹20k - ₹30k'})</p>
                </div>

                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 bg-amber-500 rounded-full ring-4 ring-white shadow"></div>
                  <h4 className="font-bold text-gray-900 text-sm">3-Month Retention Check-in (Current Phase)</h4>
                  <p className="text-xs text-gray-500">Due for verification and wage progression review.</p>
                  <button 
                    onClick={() => setShowUpdateModal(true)} 
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
                  >
                    Submit 3-Month Check-in →
                  </button>
                </div>

                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 bg-gray-200 rounded-full ring-4 ring-white"></div>
                  <h4 className="font-bold text-gray-400 text-sm">6-Month Longitudinal Review</h4>
                  <p className="text-xs text-gray-400">Scheduled for August 2025.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. EMPLOYMENT UPDATES VIEW */}
        {isUpdates && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Employment Updates History</h1>
                <p className="text-gray-500 text-sm">All self-reported check-ins and employer verification confirmations.</p>
              </div>
              <button
                onClick={() => setShowUpdateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition flex items-center gap-1.5 shadow-sm"
              >
                + New Update
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Role / Trade</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Monthly Wage</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Skills In Use</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Employer Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {checkins.length === 0 ? (
                    <tr><td colSpan="6" className="px-5 py-6 text-center text-gray-400">No updates logged yet. Submit your first update above.</td></tr>
                  ) : (
                    checkins.map((c, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-5 py-4 text-xs font-medium text-gray-600">{c.date}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                            c.status === 'employed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs font-semibold text-gray-900">{c.role || 'Associate'}</td>
                        <td className="px-5 py-4 text-xs font-medium text-gray-700">{c.wageBand}</td>
                        <td className="px-5 py-4 text-xs text-gray-600">{c.usingSkill ? '✓ Yes' : '— No'}</td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                            <CheckCircle2 size={12} /> Verified
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. MAIN DASHBOARD VIEW (Default) */}
        {!isProfile && !isJourney && !isUpdates && (
          <>
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Good morning, {traineeDetail.name || auth.user.name}</h1>
                <p className="text-gray-500 text-sm">Keep tracking your journey. You're doing great!</p>
              </div>
            </div>

            {/* Top KPI Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-4">Current Status</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xl font-bold ${isEmployed ? 'text-green-600' : 'text-blue-600'}`}>
                      {isEmployed ? 'Employed' : 'Seeking'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Since Jan 2025</p>
                  </div>
                  {isEmployed && (
                    <div className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded border border-green-100">
                      Verified
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-4">Monthly Income</p>
                <p className="text-xl font-bold text-blue-600">
                  {latestCheckin?.wageBand || '₹20k - ₹30k'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Updated recently</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-4">Skills in Use</p>
                <p className="text-xl font-bold text-blue-600">
                  {latestCheckin?.usingSkill !== false ? '80%' : 'Pending'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Using trained skills</p>
              </div>
            </div>

            {/* Outcome Journey Timeline Preview */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-8">Outcome Journey</h3>
              
              <div className="relative">
                <div className="absolute top-3 left-0 w-full h-1 bg-gray-100 -z-10"></div>
                
                <div className="flex justify-between items-start text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold ring-4 ring-white shadow-sm mb-3">✓</div>
                    <p className="text-xs font-bold text-gray-900">Training<br/>Completed</p>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold ring-4 ring-white shadow-sm mb-3">✓</div>
                    <p className="text-xs font-bold text-gray-900">Actively<br/>Seeking</p>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full ${isEmployed ? 'bg-green-600 text-white' : 'bg-gray-200'} flex items-center justify-center text-xs font-bold ring-4 ring-white shadow-sm mb-3`}>
                      {isEmployed ? '✓' : '3'}
                    </div>
                    <p className={`text-xs font-bold ${isEmployed ? 'text-gray-900' : 'text-gray-400'}`}>Employed</p>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold ring-4 ring-white shadow-sm mb-3">4</div>
                    <p className="text-xs font-bold text-gray-900">3-Month<br/>Review</p>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold ring-4 ring-white shadow-sm mb-3">5</div>
                    <p className="text-xs font-bold text-gray-400">6-Month<br/>Review</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <button 
                  onClick={() => navigate('/trainee/journey')}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  View full timeline →
                </button>
              </div>
            </div>

            {/* Bottom Split */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 mb-6">Latest Follow-up</h3>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-4 items-start">
                    <div className="text-blue-600 bg-white p-2 rounded-lg border border-blue-100"><UserCheck size={20} /></div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">3-Month Follow-up</h4>
                      <p className="text-xs text-gray-500 mt-1">Due today • Verify employment status & wage</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowUpdateModal(true)}
                  className="w-max mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg text-sm transition-colors shadow-sm"
                >
                  Update Now
                </button>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => setShowUpdateModal(true)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group text-left"
                  >
                    <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                      <Briefcase size={18} className="text-blue-500" />
                      Update Employment Status
                    </div>
                    <ArrowRight size={16} className="text-gray-400 group-hover:text-blue-600" />
                  </button>
                  
                  <button 
                    onClick={() => setShowWageModal(true)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group text-left"
                  >
                    <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                      <CreditCard size={18} className="text-blue-500" />
                      Add Wage Information
                    </div>
                    <ArrowRight size={16} className="text-gray-400 group-hover:text-blue-600" />
                  </button>
                  
                  <button 
                    onClick={() => setShowSkillModal(true)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group text-left"
                  >
                    <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                      <Award size={18} className="text-blue-500" />
                      Share Skill Usage & Feedback
                    </div>
                    <ArrowRight size={16} className="text-gray-400 group-hover:text-blue-600" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ================= MODALS ================= */}

        {/* 1. Update Employment Modal */}
        {showUpdateModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 text-lg">Update Employment Status</h3>
                <button onClick={() => setShowUpdateModal(false)} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCheckinSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Current Working Status</label>
                  <select 
                    value={status} 
                    onChange={e => setStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-gray-50"
                  >
                    <option value="employed">Employed (Full-time / Part-time)</option>
                    <option value="self-employed">Self-Employed / Freelancer</option>
                    <option value="apprenticeship">Apprenticeship / Internship</option>
                    <option value="not-employed">Not currently employed (Seeking)</option>
                  </select>
                </div>

                {status !== 'not-employed' ? (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Job Title / Role</label>
                      <input 
                        type="text" 
                        required
                        value={roleTitle}
                        onChange={e => setRoleTitle(e.target.value)}
                        placeholder="e.g. Junior IT Associate"
                        className="w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Approximate Monthly Salary</label>
                      <select 
                        value={wageBand} 
                        onChange={e => setWageBand(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-gray-50"
                      >
                        <option>Below ₹10k</option>
                        <option>₹10k–15k</option>
                        <option>₹15k–20k</option>
                        <option>₹20k–30k</option>
                        <option>Above ₹30k</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Primary Reason (Dropout Tracking)</label>
                    <select 
                      value={dropoutReason} 
                      onChange={e => setDropoutReason(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-gray-50"
                    >
                      <option>Low wages / compensation</option>
                      <option>Skill mismatch with market demand</option>
                      <option>Location / Relocation constraints</option>
                      <option>Higher education / Personal reasons</option>
                    </select>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="usingSkillCheck"
                    checked={usingSkill}
                    onChange={e => setUsingSkill(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="usingSkillCheck" className="text-xs text-gray-700 font-medium">
                    I am actively using the skills acquired during my training program
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button 
                    type="button"
                    onClick={() => setShowUpdateModal(false)}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 shadow-sm"
                  >
                    Save Status Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 2. Add Wage Information Modal */}
        {showWageModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 text-lg">Wage Progression</h3>
                <button onClick={() => setShowWageModal(false)} className="text-gray-400 hover:text-gray-700 p-1"><X size={18} /></button>
              </div>
              <form onSubmit={handleCheckinSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Current Monthly Pay Band</label>
                  <select value={wageBand} onChange={e => setWageBand(e.target.value)} className="w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-gray-50">
                    <option>Below ₹10k</option>
                    <option>₹10k–15k</option>
                    <option>₹15k–20k</option>
                    <option>₹20k–30k</option>
                    <option>Above ₹30k</option>
                  </select>
                </div>
                <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded-xl border border-blue-100">
                  🔒 <strong>Privacy Note:</strong> Exact salary is never stored or revealed. Only broad statistical bands are used for programme impact evaluations.
                </p>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowWageModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700">Submit Wage Update</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 3. Share Skill Usage Modal */}
        {showSkillModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 text-lg">Skill Usage Feedback</h3>
                <button onClick={() => setShowSkillModal(false)} className="text-gray-400 hover:text-gray-700 p-1"><X size={18} /></button>
              </div>
              <form onSubmit={handleCheckinSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">How often do you apply your course skills?</label>
                  <select className="w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-gray-50">
                    <option>Daily in my primary responsibilities</option>
                    <option>Several times per week</option>
                    <option>Occasionally / Supplementary</option>
                    <option>Rarely / Not currently using</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Emerging Skill Needs</label>
                  <input type="text" placeholder="e.g. Advanced Data Analytics, Cloud basics" className="w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-gray-50" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowSkillModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700">Submit Feedback</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
