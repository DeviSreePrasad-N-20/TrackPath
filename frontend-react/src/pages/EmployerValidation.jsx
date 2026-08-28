import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import Layout from '../components/Layout';
import { UserCheck, Clock, Building2, Timer, Search, PlusCircle, MessageSquare, CheckCircle2, X, Download, Filter, Upload, AlertCircle } from 'lucide-react';

export default function EmployerValidation({ auth, handleLogout }) {
  const [validations, setValidations] = useState([]);
  const [trainees, setTrainees] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  // Validation Form State
  const [traineeId, setTraineeId] = useState('');
  const [status, setStatus] = useState('employed');
  const [tenure, setTenure] = useState('3–6 months');
  const [wageBand, setWageBand] = useState('₹20k - ₹30k');
  const [orgName, setOrgName] = useState('TechSolutions Pvt. Ltd.');
  const [skillRating, setSkillRating] = useState('High');

  const location = useLocation();
  const path = location.pathname;
  const isValidateQueue = path.includes('/validate');
  const isList = path.includes('/list');

  const loadData = async () => {
    try {
      const res = await api.get('/api/trainees');
      setTrainees(res.data);
      const mapped = res.data.map((t, i) => ({
        ...t,
        org: 'TechSolutions Pvt. Ltd.',
        wageBand: i % 2 === 0 ? '₹20k - ₹30k' : '₹15k - ₹20k',
        status: i % 3 === 0 ? 'Pending' : 'Verified',
        time: `${i + 1}d ago`
      }));
      setValidations(mapped);
      if (res.data.length > 0) {
        setTraineeId(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/employer/validate', {
        traineeId: traineeId || trainees[0]?.id,
        employerName: orgName,
        status,
        tenure,
        wageBand
      });

      // Update local state immediately
      setValidations(prev => prev.map(v => 
        v.id === (traineeId || trainees[0]?.id) ? { ...v, status: 'Verified', wageBand } : v
      ));

      setShowValidateModal(false);
      setActionSuccess('Employment validation successfully recorded!');
      setTimeout(() => setActionSuccess(''), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenRowValidation = (trainee) => {
    setSelectedTrainee(trainee);
    setTraineeId(trainee.id);
    setShowValidateModal(true);
  };

  const filteredValidations = validations.filter(v => {
    if (isValidateQueue) return v.status === 'Pending';
    if (isList) return true;
    if (filterStatus === 'PENDING') return v.status === 'Pending';
    if (filterStatus === 'VERIFIED') return v.status === 'Verified';
    return true;
  });

  const verifiedCount = validations.filter(v => v.status === 'Verified').length;
  const pendingCount = validations.filter(v => v.status === 'Pending').length;

  return (
    <Layout auth={auth} handleLogout={handleLogout}>
      <div className="space-y-8">
        
        {/* Success Alert */}
        {actionSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-3.5 rounded-xl text-sm font-medium flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-600" /> {actionSuccess}
            </span>
            <button onClick={() => setActionSuccess('')} className="text-green-600 hover:text-green-800"><X size={14} /></button>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isValidateQueue ? 'Trainee Validation Queue' : isList ? 'Complete Validations Directory' : 'Verify employment. Build better futures.'}
            </h1>
            <p className="text-sm text-gray-500">Fast, lightweight confirmation of placement and skill utilization.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowBulkModal(true)}
              className="bg-white border border-gray-200 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 shadow-sm"
            >
              <Upload size={14} /> Bulk CSV Upload
            </button>
            <button 
              onClick={() => setShowValidateModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              + Validate Trainee
            </button>
          </div>
        </div>

        {/* KPI Row (Clickable filter cards) */}
        {!isValidateQueue && (
          <div className="grid md:grid-cols-4 gap-4">
            <button 
              onClick={() => setFilterStatus('VERIFIED')}
              className={`p-5 rounded-2xl border text-left transition-all ${
                filterStatus === 'VERIFIED' ? 'bg-green-50 border-green-300 ring-2 ring-green-500 shadow-md' : 'bg-white border-gray-200 shadow-sm hover:border-gray-300'
              }`}
            >
              <p className="text-xs text-gray-500 font-semibold mb-2">Validations Done</p>
              <p className="text-2xl font-bold text-gray-900">{verifiedCount || 24}</p>
              <p className="text-xs text-green-600 font-medium mt-1">✓ Verified this month</p>
            </button>

            <button 
              onClick={() => setFilterStatus('PENDING')}
              className={`p-5 rounded-2xl border text-left transition-all ${
                filterStatus === 'PENDING' ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500 shadow-md' : 'bg-white border-gray-200 shadow-sm hover:border-gray-300'
              }`}
            >
              <p className="text-xs text-gray-500 font-semibold mb-2">Pending Validations</p>
              <p className="text-2xl font-bold text-gray-900">{pendingCount || 8}</p>
              <p className="text-xs text-red-500 font-semibold mt-1">Need Action (Click to filter)</p>
            </button>

            <button 
              onClick={() => setFilterStatus('ALL')}
              className={`p-5 rounded-2xl border text-left transition-all ${
                filterStatus === 'ALL' ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500 shadow-md' : 'bg-white border-gray-200 shadow-sm hover:border-gray-300'
              }`}
            >
              <p className="text-xs text-gray-500 font-semibold mb-2">Partner Organisations</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
              <p className="text-xs text-gray-400 mt-1">Associated industries</p>
            </button>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-semibold mb-2">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900">2.4 Days</p>
              <p className="text-xs text-green-600 font-medium mt-1">⚡ 18% faster than benchmark</p>
            </div>
          </div>
        )}

        {/* Validations Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">
              {isValidateQueue ? 'Pending Verification Queue' : 'Recent Trainee Validations'}
            </h3>
            {filterStatus !== 'ALL' && (
              <button 
                onClick={() => setFilterStatus('ALL')}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                Reset Filter (Showing {filterStatus})
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Trainee ID</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Trainee Name</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Organisation</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Wage Band</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredValidations.map(v => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-mono text-xs text-gray-500">{v.outcomeId}</td>
                    <td className="px-5 py-4 font-bold text-gray-900">{v.name || 'Priya Sharma'}</td>
                    <td className="px-5 py-4 text-gray-600">{v.org}</td>
                    <td className="px-5 py-4 text-gray-600">{v.wageBand}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        v.status === 'Verified' 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {v.status === 'Pending' ? (
                        <button 
                          onClick={() => handleOpenRowValidation(v)}
                          className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 shadow-sm"
                        >
                          Confirm & Verify →
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleOpenRowValidation(v)}
                          className="text-xs text-gray-500 hover:text-gray-900 font-semibold"
                        >
                          Edit Record
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Split (Dashboard only) */}
        {!isValidateQueue && !isList && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setShowValidateModal(true)}
                  className="flex flex-col items-center justify-center p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors border border-orange-100 text-center"
                >
                  <Search size={24} className="text-orange-600 mb-2" />
                  <span className="text-xs font-bold text-gray-900">Validate Employment</span>
                  <span className="text-[10px] text-gray-500 mt-0.5">Search & confirm tenure</span>
                </button>

                <button 
                  onClick={() => setShowBulkModal(true)}
                  className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100 text-center"
                >
                  <PlusCircle size={24} className="text-blue-600 mb-2" />
                  <span className="text-xs font-bold text-gray-900">Bulk Validation</span>
                  <span className="text-[10px] text-gray-500 mt-0.5">Upload multiple records</span>
                </button>

                <button 
                  onClick={() => setShowFeedbackModal(true)}
                  className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors border border-purple-100 col-span-2 text-center"
                >
                  <MessageSquare size={24} className="text-purple-600 mb-2" />
                  <span className="text-xs font-bold text-gray-900">Share Industry Skill Feedback</span>
                  <span className="text-[10px] text-gray-500 mt-0.5">Highlight skill gaps & curriculum demands</span>
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">How it works?</h3>
                <p className="text-xs text-gray-500 mb-6">30-second low-burden confirmation loop.</p>
              </div>
              <div className="flex items-center justify-between px-2">
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs mb-2 shadow-sm">1</div>
                  <p className="text-[11px] font-semibold text-gray-700 text-center">Search<br/>Trainee</p>
                </div>
                <div className="w-12 border-t-2 border-dashed border-gray-200"></div>
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 bg-green-50 text-green-600 rounded-full flex items-center justify-center font-bold text-xs mb-2 shadow-sm">2</div>
                  <p className="text-[11px] font-semibold text-gray-700 text-center">Verify<br/>Tenure</p>
                </div>
                <div className="w-12 border-t-2 border-dashed border-gray-200"></div>
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center font-bold text-xs mb-2 shadow-sm">3</div>
                  <p className="text-[11px] font-semibold text-gray-700 text-center">Confirm<br/>Pay Band</p>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 text-center mt-4">Zero long paperwork. Fully privacy-compliant.</p>
            </div>
          </div>
        )}

        {/* ================= MODALS ================= */}

        {/* 1. Validation Modal */}
        {showValidateModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 text-lg">Verify Trainee Employment</h3>
                <button onClick={() => setShowValidateModal(false)} className="text-gray-400 hover:text-gray-700 p-1"><X size={18} /></button>
              </div>

              <form onSubmit={handleVerifySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Select Candidate</label>
                  <select 
                    value={traineeId} 
                    onChange={e => setTraineeId(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-gray-50 font-medium"
                  >
                    {trainees.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.outcomeId}) • Batch {t.cohort}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Employing Organisation</label>
                  <input 
                    type="text" 
                    required
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-gray-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Active Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value)} className="w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-gray-50">
                      <option value="employed">Yes, Currently Employed</option>
                      <option value="not-employed">Left Organisation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Tenure with Org</label>
                    <select value={tenure} onChange={e => setTenure(e.target.value)} className="w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-gray-50">
                      <option>Less than 3 months</option>
                      <option>3–6 months</option>
                      <option>6–12 months</option>
                      <option>Over 12 months</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Approximate Monthly Salary Band</label>
                  <select value={wageBand} onChange={e => setWageBand(e.target.value)} className="w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-gray-50">
                    <option>Below ₹10k</option>
                    <option>₹10k–15k</option>
                    <option>₹15k–20k</option>
                    <option>₹20k–30k</option>
                    <option>Above ₹30k</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setShowValidateModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-xs font-semibold hover:bg-green-700 shadow-sm">Save Confirmation</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 2. Industry Skill Feedback Modal */}
        {showFeedbackModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 text-lg">Industry Skill Feedback</h3>
                <button onClick={() => setShowFeedbackModal(false)} className="text-gray-400 hover:text-gray-700 p-1"><X size={18} /></button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); setShowFeedbackModal(false); setActionSuccess('Industry skill requirements logged!'); setTimeout(() => setActionSuccess(''), 3000); }} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Which skills are in highest demand for your hires?</label>
                  <input type="text" defaultValue="Digital Documentation, Excel, Data Analysis" className="w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Trainee Technical Preparedness</label>
                  <select className="w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-gray-50">
                    <option>Good (Ready for production work)</option>
                    <option>Moderate (Requires 2–4 weeks onboarding)</option>
                    <option>Needs Improvement in domain tools</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowFeedbackModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-semibold hover:bg-purple-700">Submit Feedback</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 3. Bulk CSV Upload Modal */}
        {showBulkModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 text-lg">Bulk Trainee Validation</h3>
                <button onClick={() => setShowBulkModal(false)} className="text-gray-400 hover:text-gray-700 p-1"><X size={18} /></button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-gray-600">Upload a spreadsheet of employees to validate retention in bulk.</p>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
                  <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-xs font-bold text-gray-700">Drag and drop CSV or click to browse</p>
                  <p className="text-[10px] text-gray-400 mt-1">Columns: traineeId, status, tenure, wageBand</p>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowBulkModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold">Cancel</button>
                  <button 
                    onClick={() => { setShowBulkModal(false); setActionSuccess('Processed 12 validations in batch!'); setTimeout(() => setActionSuccess(''), 3000); }} 
                    className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-xs font-semibold hover:bg-green-700"
                  >
                    Simulate Process CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
