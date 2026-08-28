import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Bell, ChevronDown, LayoutDashboard, User, Building, Navigation, FileText, Settings, HelpCircle, LogOut, X, CheckCircle2, AlertTriangle, Info, Lock } from 'lucide-react';

export default function Layout({ auth, handleLogout, children, showSidebar = true }) {
  const location = useLocation();
  const path = location.pathname;

  const sidebarLinks = {
    trainee: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/trainee' },
      { name: 'My Profile', icon: User, path: '/trainee/profile' },
      { name: 'Outcome Journey', icon: Navigation, path: '/trainee/journey' },
      { name: 'Employment Updates', icon: FileText, path: '/trainee/updates' },
    ],
    employer: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/employer' },
      { name: 'Validate Trainees', icon: User, path: '/employer/validate' },
      { name: 'Validated List', icon: FileText, path: '/employer/list' },
    ],
    admin: [
      { name: 'Overview', icon: LayoutDashboard, path: '/admin' },
      { name: 'Trainees', icon: User, path: '/admin/trainees' },
      { name: 'Outcomes Timeline', icon: Navigation, path: '/admin/outcomes' },
      { name: 'Programme Results', icon: FileText, path: '/admin/results' },
    ]
  };

  // Infer active role strictly from current URL path so portals are never mixed!
  let currentRole = 'admin';
  if (path.startsWith('/trainee')) currentRole = 'trainee';
  else if (path.startsWith('/employer')) currentRole = 'employer';
  else if (path.startsWith('/admin')) currentRole = 'admin';
  else currentRole = auth?.role || 'admin';

  const links = sidebarLinks[currentRole] || [];
  
  // Dynamic user display name based on active portal context
  let name = auth?.user?.name || 'Amit Patel';
  if (currentRole === 'employer' && (!name || name === 'Amit Patel')) {
    name = 'TechSolutions HR';
  }
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const notifications = [
    { id: 1, title: 'Follow-up Due', desc: '5 candidates in 2025-Q1 batch are due for their 3-Month retention check-in.', time: '10m ago', type: 'alert' },
    { id: 2, title: 'Employer Verification', desc: 'TechSolutions HR confirmed employment for Priya Singh (₹20k–30k band).', time: '1h ago', type: 'success' },
    { id: 3, title: 'Skill Gap Signal', desc: 'Digital Documentation proficiency gap reached 39% across North region.', time: '3h ago', type: 'info' },
  ];

  return (
    <div className="h-screen bg-gray-50 flex flex-col font-sans overflow-hidden">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 h-16 flex justify-between items-center px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-blue-600 text-white font-bold p-1 rounded h-8 w-8 flex items-center justify-center text-sm">TP</div>
            <div>
              <h1 className="font-bold text-gray-900 leading-tight">TrackPath</h1>
              <p className="text-[10px] text-gray-500 hidden sm:block">Tracking Outcomes. Building Futures.</p>
            </div>
          </Link>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Privacy Badge */}
          <button 
            onClick={() => setShowPrivacyModal(true)}
            className="hidden md:flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-100 hover:bg-green-100 transition-colors"
          >
            <ShieldCheck size={14} /> Data Protected
          </button>
          
          {/* Notifications Bell */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative text-gray-500 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Bell size={20} />
              <span className="absolute 0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">3</span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 z-50 animate-in fade-in duration-150">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <h4 className="font-bold text-sm text-gray-900">Notifications & Alerts</h4>
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">3 New</span>
                </div>
                <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto mt-2">
                  {notifications.map(n => (
                    <div key={n.id} className="py-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                          {n.type === 'alert' ? <AlertTriangle size={12} className="text-amber-500" /> :
                           n.type === 'success' ? <CheckCircle2 size={12} className="text-green-500" /> :
                           <Info size={12} className="text-blue-500" />}
                          {n.title}
                        </p>
                        <span className="text-[10px] text-gray-400">{n.time}</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{n.desc}</p>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="w-full text-center text-xs font-semibold text-blue-600 hover:text-blue-700 pt-3 border-t border-gray-100"
                >
                  Close
                </button>
              </div>
            )}
          </div>
          
          {/* User Profile */}
          <div className="relative">
            <div 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 border-l border-gray-200 pl-6 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                {initials}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600">{name}</p>
                <p className="text-[10px] text-gray-400 capitalize">{currentRole}</p>
              </div>
              <ChevronDown size={16} className="text-gray-400" />
            </div>

            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 z-50 animate-in fade-in duration-150">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs text-gray-400 font-medium">Logged in as</p>
                  <p className="text-sm font-bold text-gray-900">{name}</p>
                  <span className="inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                    {currentRole}
                  </span>
                </div>
                
                <div className="py-1">
                  <p className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase">Switch Portal</p>
                  <Link 
                    to="/trainee" 
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <User size={14} className="text-blue-600" /> Trainee Portal
                  </Link>
                  <Link 
                    to="/employer" 
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-green-50 hover:text-green-700"
                  >
                    <Building size={14} className="text-green-600" /> Employer Portal
                  </Link>
                  <Link 
                    to="/admin" 
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                  >
                    <Settings size={14} className="text-purple-600" /> Admin Portal
                  </Link>
                </div>

                <div className="border-t border-gray-100 pt-1">
                  <p className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase">Portal Logins</p>
                  <Link 
                    to="/login/trainee" 
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-4 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
                  >
                    Trainee Sign In
                  </Link>
                  <Link 
                    to="/login/employer" 
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-4 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
                  >
                    Employer Sign In
                  </Link>
                  <Link 
                    to="/login/admin" 
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-4 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
                  >
                    Admin Sign In
                  </Link>
                </div>

                <div className="border-t border-gray-100 pt-1">
                  <Link 
                    to="/" 
                    onClick={() => { setShowProfileMenu(false); if (handleLogout) handleLogout(); }}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={14} /> Back to Hub / Logout
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col shrink-0">
            <div className="p-4 flex flex-col h-full">
              {/* Role badge */}
              <div className="mb-6 flex justify-center">
                 <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                  ${currentRole === 'trainee' ? 'bg-blue-600 text-white' : 
                    currentRole === 'employer' ? 'bg-green-600 text-white' : 
                    'bg-purple-600 text-white'}`}>
                   {currentRole} Portal
                 </span>
              </div>
              
              <nav className="flex-1 space-y-1">
                {links.map((link) => {
                  const Icon = link.icon;
                  // Handle exact match for dashboard, else prefix match
                  const isDashboard = link.path === `/${currentRole}`;
                  const isActive = isDashboard ? path === link.path : path.startsWith(link.path);
                  
                  return (
                    <Link key={link.name} to={link.path} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                      <Icon size={18} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                      {link.name}
                    </Link>
                  );
                })}
              </nav>
              
              <div className="mt-auto pt-4 border-t border-gray-100 space-y-1">
                <button 
                  onClick={() => setShowHelpModal(true)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 text-left"
                >
                  <HelpCircle size={18} className="text-gray-400" />
                  Help & Support
                </button>
                <Link to="/" onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">
                  <LogOut size={18} className="text-red-400" />
                  Logout
                </Link>
              </div>
            </div>
          </aside>
        )}
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Privacy Architecture Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                  <Lock size={20} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Privacy & Security Architecture</h3>
              </div>
              <button onClick={() => setShowPrivacyModal(false)} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-3 text-sm text-gray-600">
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                <p className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-1">1. Explicit Trainee Consent</p>
                <p className="text-xs">Trainee employment status is strictly collected on an opt-in basis. Consent status can be revoked at any time.</p>
              </div>
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                <p className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-1">2. Zero Sensitive PII Leakage</p>
                <p className="text-xs">Aadhaar, exact salaries, and home addresses are never exposed to employers or unvetted parties.</p>
              </div>
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                <p className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-1">3. Differential Privacy in Reporting</p>
                <p className="text-xs">Analytics reports aggregate outcome cohorts into anonymous statistical bands to protect individual privacy.</p>
              </div>
            </div>

            <button 
              onClick={() => setShowPrivacyModal(false)}
              className="mt-6 w-full py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
            >
              Close Privacy Overview
            </button>
          </div>
        </div>
      )}

      {/* Help & Support Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                  <HelpCircle size={20} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Help & Support</h3>
              </div>
              <button onClick={() => setShowHelpModal(false)} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-3 text-sm text-gray-600">
              <div className="border border-gray-100 rounded-xl p-3">
                <h4 className="font-bold text-gray-900 text-xs mb-1">How does longitudinal tracking work?</h4>
                <p className="text-xs text-gray-500">TrackPath tracks skilling outcomes at 3-month, 6-month, and 12-month intervals, triangulating self-reported check-ins with employer confirmations.</p>
              </div>
              <div className="border border-gray-100 rounded-xl p-3">
                <h4 className="font-bold text-gray-900 text-xs mb-1">How do employers validate tenure?</h4>
                <p className="text-xs text-gray-500">Employers access the lightweight verification portal or bulk upload CSVs to confirm working status and approximate wage bands in seconds.</p>
              </div>
              <div className="border border-gray-100 rounded-xl p-3">
                <h4 className="font-bold text-gray-900 text-xs mb-1">Need technical assistance?</h4>
                <p className="text-xs text-gray-500">Reach the platform support desk at <span className="font-semibold text-blue-600">support@trackpath.gov.in</span> or call toll-free <span className="font-semibold text-gray-800">1800-SKILL-IN</span>.</p>
              </div>
            </div>

            <button 
              onClick={() => setShowHelpModal(false)}
              className="mt-6 w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
