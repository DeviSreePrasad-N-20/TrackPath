import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import Layout from '../components/Layout';
import { 
  Briefcase, CreditCard, Award, ArrowRight, UserCheck, MessageSquare, CheckCircle2, Clock, X, 
  Shield, Calendar, MapPin, Building, Sparkles, Check, ChevronRight, Lock, Zap, RefreshCw, BarChart2
} from 'lucide-react';

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
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  // Form states
  const [status, setStatus] = useState('employed');
  const [roleTitle, setRoleTitle] = useState('Junior Software Associate');
  const [wageBand, setWageBand] = useState('₹20k - ₹30k');
  const [usingSkill, setUsingSkill] = useState(true);
  const [consent, setConsent] = useState(true);
  
  // Granular Privacy States
  const [allowEmployerVerification, setAllowEmployerVerification] = useState(true);
  const [allowPolicyAnalytics, setAllowPolicyAnalytics] = useState(true);
  const [allowSkillBenchmarking, setAllowSkillBenchmarking] = useState(true);

  // Skill Utilisation state
  const [skillRatings, setSkillRatings] = useState({
    communication: 90,
    technical: 80,
    digitalTools: 60,
    problemSolving: 70
  });

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
      setActionSuccess(newConsent ? 'Consent enabled for longitudinal tracking' : 'Consent revoked: Data masked from analytics');
      setTimeout(() => setActionSuccess(''), 3500);
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
      setActionSuccess('Employment check-in submitted successfully!');
      setTimeout(() => setActionSuccess(''), 3500);
      loadProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const handleWageSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/checkins', {
        status: traineeDetail?.status || 'employed',
        role: traineeDetail?.role || 'Associate',
        wageBand,
        usingSkill: true,
        selfEmployed: false
      });
      setShowWageModal(false);
      setActionSuccess('Wage progression band updated successfully!');
      setTimeout(() => setActionSuccess(''), 3500);
      loadProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSkillSubmit = (e) => {
    e.preventDefault();
    setShowSkillModal(false);
    setActionSuccess('Skill utilisation scores updated successfully!');
    setTimeout(() => setActionSuccess(''), 3500);
  };

  const t = traineeDetail || {
    name: auth?.user?.name || 'Amit Patel',
    outcomeId: 'TP-S1-T01',
    cohort: '2025-Q1',
    schemeName: 'Digital Skilling Initiative',
    status: 'employed',
    role: 'Junior Software Associate',
    wageBand: '₹20k - ₹30k',
    employerValidation: {
      employerName: 'TechCorp India',
      status: 'employed',
      date: '2025-06-20'
    },
    timeline: [
      { date: '2025-01-15', label: 'Training Completed', details: 'Certified in Digital IT & Software' },
      { date: '2025-04-10', label: 'Job Seeking / Interviewing', details: 'Placed with TechCorp India' },
      { date: '2025-06-20', label: 'Employer Verified', details: 'Verified by TechCorp India HR' },
      { date: '2025-09-15', label: '3-Month Retention Check-in', details: 'Status: Employed • Wage: ₹20k - ₹30k' },
      { date: '2026-01-15', label: '6-Month Retention Verified', details: 'Status: Employed • Using Skills: Yes' },
    ]
  };

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

        {/* Top Profile Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {t.cohort} Cohort
              </span>
              <span className="bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Check size={11} /> {t.status === 'employed' ? 'Actively Employed' : 'Seeking Placement'}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold">{t.name}</h1>
            <p className="text-xs text-blue-100 flex items-center gap-3">
              <span>Scheme: <strong>{t.schemeName || 'Digital Skilling Initiative'}</strong></span>
              <span>•</span>
              <span>Anonymous ID: <strong className="font-mono">{t.outcomeId}</strong></span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setShowPrivacyModal(true)}
              className="bg-white/10 hover:bg-white/20 border border-white/30 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition"
            >
              <Shield size={14} /> Privacy Center
            </button>
            <button 
              onClick={() => setShowUpdateModal(true)}
              className="bg-white text-blue-700 hover:bg-blue-50 text-xs font-extrabold px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition"
            >
              <RefreshCw size={14} /> Update Check-in
            </button>
          </div>
        </div>

        {/* 1. UNIFIED OUTCOME TIMELINE (Core Journey) */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Clock size={18} className="text-blue-600" /> Longitudinal Outcome Journey
              </h3>
              <p className="text-xs text-gray-500">Every portal (Trainee, Employer, and Admin) contributes to this unified longitudinal track.</p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Milestone 4 of 6 Completed
            </span>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-2">
            {[
              { step: '1. Training Completed', date: 'Jan 2025', status: 'done', desc: 'Certified' },
              { step: '2. Job Seeking', date: 'Apr 2025', status: 'done', desc: 'Placed' },
              { step: '3. Employer Verified', date: 'Jun 2025', status: 'done', desc: 'TechCorp India' },
              { step: '4. 3M Retention', date: 'Sep 2025', status: 'done', desc: '₹20k - ₹30k' },
              { step: '5. 6M Retention', date: 'Jan 2026', status: 'done', desc: 'Using Skills' },
              { step: '6. 12M Outcome', date: 'Jul 2026', status: 'upcoming', desc: 'Upcoming' },
            ].map((m, i) => (
              <div 
                key={i} 
                className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-all ${
                  m.status === 'done' 
                    ? 'bg-blue-50/60 border-blue-200 text-blue-900' 
                    : 'bg-gray-50 border-gray-200 text-gray-400'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold uppercase">{m.date}</span>
                  {m.status === 'done' ? <CheckCircle2 size={14} className="text-blue-600" /> : <Clock size={14} />}
                </div>
                <p className="text-xs font-extrabold text-gray-900">{m.step}</p>
                <p className="text-[11px] text-gray-500 mt-1 font-medium">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 2. THREE KEY METRICS ROW */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1: Employment Status */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-500 uppercase">Employment Status</span>
                <span className="bg-green-100 text-green-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                  Verified
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-1">{t.role || 'Software Associate'}</h3>
              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <Building size={14} className="text-gray-400" /> {t.employerValidation?.employerName || 'TechCorp India'}
              </p>
            </div>
            <button 
              onClick={() => setShowUpdateModal(true)}
              className="mt-6 w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-800 text-xs font-bold rounded-xl border border-gray-200 transition"
            >
              Update Job Status →
            </button>
          </div>

          {/* Card 2: Wage Progression Band */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-500 uppercase">Current Wage Band</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                  +24% Growth
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-1">{t.wageBand || '₹20k - ₹30k'}</h3>
              <p className="text-xs text-gray-500">Starting baseline: ₹15k at initial placement</p>
            </div>
            <button 
              onClick={() => setShowWageModal(true)}
              className="mt-6 w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-800 text-xs font-bold rounded-xl border border-gray-200 transition"
            >
              Update Salary Range →
            </button>
          </div>

          {/* Card 3: Employer Verification Status */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-500 uppercase">Employer Triangulation</span>
                <span className="bg-purple-100 text-purple-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                  Confirmed
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-1">TechCorp India</h3>
              <p className="text-xs text-gray-500">Verified by HR Manager on {t.employerValidation?.date || '2025-06-20'}</p>
            </div>
            <div className="mt-6 p-2 bg-purple-50 rounded-xl border border-purple-100 text-center text-[11px] font-bold text-purple-900">
              ✓ Low-Burden 30-Sec Validation Active
            </div>
          </div>
        </div>

        {/* 3. SKILL UTILISATION RADAR & BREAKDOWN */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-5">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <BarChart2 size={18} className="text-blue-600" /> Your Skill Utilisation Score
              </h3>
              <p className="text-xs text-gray-500">How frequently you apply the skills learned in your training on the job.</p>
            </div>
            <button 
              onClick={() => setShowSkillModal(true)}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Update Skill Feedback →
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3.5">
              {[
                { label: 'Technical Core Skills', score: skillRatings.technical, color: 'bg-blue-600' },
                { label: 'Communication & Teamwork', score: skillRatings.communication, color: 'bg-emerald-600' },
                { label: 'Digital Tools & Software', score: skillRatings.digitalTools, color: 'bg-amber-500' },
                { label: 'Problem Solving & Quality', score: skillRatings.problemSolving, color: 'bg-purple-600' },
              ].map((s, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-gray-700">
                    <span>{s.label}</span>
                    <span>{s.score}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div className={`${s.color} h-2.5 rounded-full transition-all`} style={{ width: `${s.score}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-100 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                  Skill Intelligence Insights
                </span>
                <div className="mt-3 space-y-2 text-xs">
                  <p className="text-gray-800">
                    🌟 <strong>Your Strongest Skill:</strong> <span className="text-emerald-700 font-bold">Communication (90%)</span>
                  </p>
                  <p className="text-gray-800">
                    📈 <strong>Recommended to Strengthen:</strong> <span className="text-amber-700 font-bold">Digital Tools (60%)</span>
                  </p>
                </div>
                <p className="text-[11px] text-gray-500 mt-2">
                  Tip: Completing the 2-hour micro-learning module on Digital Documentation can unlock higher wage bands in your next review!
                </p>
              </div>

              <button 
                onClick={() => setShowSkillModal(true)}
                className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Log Skill Usage Feedback
              </button>
            </div>
          </div>
        </div>

        {/* ================= MODALS ================= */}

        {/* 1. Update Employment Check-in Modal */}
        {showUpdateModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-7 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 text-lg">Quick Longitudinal Check-in</h3>
                <button onClick={() => setShowUpdateModal(false)} className="text-gray-400 hover:text-gray-700 p-1"><X size={18} /></button>
              </div>

              <form onSubmit={handleCheckinSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">What is your current working status?</label>
                  <select 
                    value={status} 
                    onChange={e => setStatus(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl bg-gray-50 font-semibold"
                  >
                    <option value="employed">Employed (Full-time / Part-time)</option>
                    <option value="self-employed">Self-Employed / Freelance</option>
                    <option value="apprenticeship">Apprenticeship</option>
                    <option value="seeking">Looking for Work / Seeking</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Current Job Role / Designation</label>
                  <input 
                    type="text" 
                    required
                    value={roleTitle}
                    onChange={e => setRoleTitle(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl bg-gray-50"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Monthly Wage Range</label>
                  <select 
                    value={wageBand} 
                    onChange={e => setWageBand(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl bg-gray-50"
                  >
                    <option>Below ₹10k</option>
                    <option>₹10k - ₹20k</option>
                    <option>₹20k - ₹30k</option>
                    <option>₹30k - ₹50k</option>
                    <option>Above ₹50k</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <input 
                    type="checkbox" 
                    id="usingSkillCheck"
                    checked={usingSkill}
                    onChange={e => setUsingSkill(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="usingSkillCheck" className="text-gray-800 font-medium">
                    I am actively applying the skills I learned during training.
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowUpdateModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl font-semibold">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md">Submit Check-in</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 2. Wage Modal */}
        {showWageModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-7 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 text-lg">Update Salary Progression</h3>
                <button onClick={() => setShowWageModal(false)} className="text-gray-400 hover:text-gray-700 p-1"><X size={18} /></button>
              </div>

              <form onSubmit={handleWageSubmit} className="space-y-4 text-xs">
                <p className="text-gray-500">Track how your wage increases over your 3, 6, and 12-month career journey.</p>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Select Updated Salary Band</label>
                  <select 
                    value={wageBand} 
                    onChange={e => setWageBand(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl bg-gray-50 text-sm font-bold"
                  >
                    <option>Below ₹10k</option>
                    <option>₹10k - ₹20k</option>
                    <option>₹20k - ₹30k</option>
                    <option>₹30k - ₹50k</option>
                    <option>Above ₹50k</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowWageModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl font-semibold">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-md">Save Wage Update</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 3. Skill Utilisation Modal */}
        {showSkillModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-7 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 text-lg">Update Skill Utilisation</h3>
                <button onClick={() => setShowSkillModal(false)} className="text-gray-400 hover:text-gray-700 p-1"><X size={18} /></button>
              </div>

              <form onSubmit={handleSkillSubmit} className="space-y-4 text-xs">
                {Object.keys(skillRatings).map(k => (
                  <div key={k} className="space-y-1">
                    <div className="flex justify-between font-bold text-gray-700 capitalize">
                      <span>{k.replace(/([A-Z])/g, ' $1')}</span>
                      <span>{skillRatings[k]}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="100" 
                      value={skillRatings[k]}
                      onChange={e => setSkillRatings({ ...skillRatings, [k]: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-blue-600"
                    />
                  </div>
                ))}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowSkillModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl font-semibold">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md">Save Skill Scores</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 4. Granular Privacy Center Modal */}
        {showPrivacyModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-7 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <Shield size={20} className="text-blue-600" /> Trainee Privacy & Data Protection Center
                </h3>
                <button onClick={() => setShowPrivacyModal(false)} className="text-gray-400 hover:text-gray-700 p-1"><X size={18} /></button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-100 space-y-1">
                  <p className="font-bold text-blue-950">Your Digital Privacy Guarantees:</p>
                  <p className="text-blue-700">Under the Data Protection & Consent framework, your personal contact, Aadhaar, and exact finances are never exposed. All analytics use your masked Anonymous ID: <strong className="font-mono">{t.outcomeId}</strong>.</p>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">
                    <span className="font-semibold text-gray-800">Longitudinal Career Tracking Consent</span>
                    <input type="checkbox" checked={consent} onChange={handleConsentToggle} className="w-4 h-4 text-blue-600 rounded" />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">
                    <span className="font-semibold text-gray-800">Allow Employer Verification Triangulation</span>
                    <input type="checkbox" checked={allowEmployerVerification} onChange={e => setAllowEmployerVerification(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">
                    <span className="font-semibold text-gray-800">Participate in Anonymized Scheme Analytics</span>
                    <input type="checkbox" checked={allowPolicyAnalytics} onChange={e => setAllowPolicyAnalytics(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                  </label>
                </div>
              </div>

              <button 
                onClick={() => setShowPrivacyModal(false)}
                className="mt-6 w-full py-2.5 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-gray-800"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
