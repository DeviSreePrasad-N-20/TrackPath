import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Building, Settings, ArrowRight, HelpCircle, LogIn, Sparkles, X, ShieldCheck } from 'lucide-react';
import Layout from '../components/Layout';

export default function Hub({ auth, setAuth, handleLogout }) {
  const [showGuideModal, setShowGuideModal] = useState(false);

  const isTraineeAllowed = auth?.role === 'trainee' || auth?.role === 'admin';
  const isEmployerAllowed = auth?.role === 'employer' || auth?.role === 'admin';
  const isAdminAllowed = auth?.role === 'admin';

  return (
    <Layout auth={auth} handleLogout={handleLogout} showSidebar={false}>
      <div className="max-w-6xl mx-auto space-y-8 py-4">
        
        {/* Clean Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {auth?.user?.name ? (
              <>Welcome back, <span className="text-blue-600">{auth.user.name}</span> 👋</>
            ) : (
              <>Welcome to <span className="text-blue-600">TrackPath</span></>
            )}
          </h1>
          <p className="text-gray-500 text-sm md:text-base">
            Choose a portal to continue. Each portal is designed for a specific role and experience.
          </p>
        </div>

        {/* 3 Main Portal Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* 1. Trainee Portal Card */}
          <div className="bg-white border border-gray-200 rounded-3xl p-7 flex flex-col hover:shadow-xl hover:border-blue-300 transition-all group">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <User size={24} />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Trainee Portal</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Share your employment updates, salary progression, and track your longitudinal outcome journey.
            </p>
            <ul className="text-xs text-gray-600 space-y-2.5 mb-8 flex-1">
              <li className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span> Update employment status</li>
              <li className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span> Track wage progression bands</li>
              <li className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span> Share skill usage & feedback</li>
            </ul>
            <div className="mt-auto space-y-2 pt-4 border-t border-gray-100">
              {isTraineeAllowed ? (
                <Link 
                  to="/trainee" 
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-md"
                >
                  Enter Trainee Portal <ArrowRight size={16} />
                </Link>
              ) : (
                <Link 
                  to="/login/trainee" 
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-md"
                >
                  Sign In as Trainee <ArrowRight size={16} />
                </Link>
              )}
              <Link to="/login/trainee" className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold">
                <LogIn size={13} /> Trainee Credentials
              </Link>
            </div>
          </div>

          {/* 2. Employer Portal Card */}
          <div className="bg-white border border-gray-200 rounded-3xl p-7 flex flex-col hover:shadow-xl hover:border-green-300 transition-all group">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Building size={24} />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Employer Portal</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Validate employment details in seconds and help ensure training programmes deliver real value.
            </p>
            <ul className="text-xs text-gray-600 space-y-2.5 mb-8 flex-1">
              <li className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span> Confirm trainee employment</li>
              <li className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span> Confirm approximate wage band</li>
              <li className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span> Share industry skill demands</li>
            </ul>
            <div className="mt-auto space-y-2 pt-4 border-t border-gray-100">
              {isEmployerAllowed ? (
                <Link 
                  to="/employer" 
                  className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors shadow-md"
                >
                  Enter Employer Portal <ArrowRight size={16} />
                </Link>
              ) : (
                <Link 
                  to="/login/employer" 
                  className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors shadow-md"
                >
                  Sign In as Employer <ArrowRight size={16} />
                </Link>
              )}
              <Link to="/login/employer" className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-green-600 hover:text-green-800 font-semibold">
                <LogIn size={13} /> Employer Credentials
              </Link>
            </div>
          </div>

          {/* 3. Admin Portal Card */}
          <div className="bg-white border border-gray-200 rounded-3xl p-7 flex flex-col hover:shadow-xl hover:border-purple-300 transition-all group">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Settings size={24} />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Admin Portal</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              View longitudinal analytics, skill gap intelligence, and auto-deploy remedial interventions.
            </p>
            <ul className="text-xs text-gray-600 space-y-2.5 mb-8 flex-1">
              <li className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span> Longitudinal retention funnel</li>
              <li className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span> Regional skill gap heatmap</li>
              <li className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span> Early warning & interventions</li>
            </ul>
            <div className="mt-auto space-y-2 pt-4 border-t border-gray-100">
              {isAdminAllowed ? (
                <Link 
                  to="/admin" 
                  className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition-colors shadow-md"
                >
                  Enter Admin Portal <ArrowRight size={16} />
                </Link>
              ) : (
                <Link 
                  to="/login/admin" 
                  className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition-colors shadow-md"
                >
                  Sign In as Admin <ArrowRight size={16} />
                </Link>
              )}
              <Link to="/login/admin" className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-purple-600 hover:text-purple-800 font-semibold">
                <LogIn size={13} /> Admin Credentials
              </Link>
            </div>
          </div>
        </div>

        {/* User Guide Card */}
        <div className="bg-[#FFFBEC] border border-[#FDE68A] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-left">
            <div className="p-3 bg-yellow-100 text-yellow-800 rounded-xl shrink-0">
              <HelpCircle size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Need help understanding TrackPath?</h4>
              <p className="text-xs text-gray-600">Learn how longitudinal tracking connects trainees, employers, and government administrators.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowGuideModal(true)}
            className="py-2.5 px-5 bg-white border border-yellow-300 rounded-xl text-xs font-bold text-yellow-800 hover:bg-yellow-50 transition-colors shadow-sm shrink-0"
          >
            View User Guide →
          </button>
        </div>

      </div>

      {/* User Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <HelpCircle size={20} className="text-blue-600" /> TrackPath Platform User Guide
              </h3>
              <button onClick={() => setShowGuideModal(false)} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs text-gray-600 leading-relaxed">
              <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-100">
                <h4 className="font-bold text-blue-900 text-sm mb-1">1. The One Outcome Journey, Three Connected Portals</h4>
                <p>TrackPath solves longitudinal skilling drop-off by creating a continuous data loop between trainees, employers, and government administrators.</p>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                <h4 className="font-bold text-gray-900">🔹 Trainee Portal</h4>
                <p>Trainees grant explicit consent to share low-burden employment updates, salary ranges, and career satisfaction at 3M, 6M, and 12M intervals.</p>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                <h4 className="font-bold text-gray-900">🔹 Employer Portal</h4>
                <p>Hiring managers confirm active working status and job role in under 30 seconds or via bulk CSV upload, verifying authentic placement signals.</p>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                <h4 className="font-bold text-gray-900">🔹 Admin Portal</h4>
                <p>Program officers analyze longitudinal retention funnels, identify emerging regional skill gaps, and auto-deploy remedial micro-learning modules.</p>
              </div>
            </div>

            <button 
              onClick={() => setShowGuideModal(false)} 
              className="mt-6 w-full py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700"
            >
              Close User Guide
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
