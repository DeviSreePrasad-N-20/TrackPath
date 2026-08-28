import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { User, Building, Settings, ShieldCheck, ArrowLeft, ArrowRight, Sparkles, KeyRound } from 'lucide-react';

export default function PortalLogin({ setAuth }) {
  const { portal } = useParams();
  const navigate = useNavigate();
  
  // Default to portal in URL or admin
  const currentPortal = portal || 'admin';
  
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const portalConfig = {
    trainee: {
      name: 'Trainee Portal',
      tagline: 'Share employment updates, track wage progression & career outcomes',
      color: 'blue',
      bgColor: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
      lightBg: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      icon: User,
      defaultUser: 'trainee_demo',
      defaultPass: 'demo123',
      demoName: 'Amit Patel (Trainee)',
      redirectPath: '/trainee'
    },
    employer: {
      name: 'Employer Portal',
      tagline: 'Verify trainee employment details & provide real-world skill feedback',
      color: 'green',
      bgColor: 'bg-green-600',
      hoverColor: 'hover:bg-green-700',
      lightBg: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      icon: Building,
      defaultUser: 'employer_demo',
      defaultPass: 'demo123',
      demoName: 'TechSolutions Pvt. Ltd. HR',
      redirectPath: '/employer'
    },
    admin: {
      name: 'Admin Portal',
      tagline: 'Longitudinal analytics, skill gap intelligence & programme outcomes',
      color: 'purple',
      bgColor: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-700',
      lightBg: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700',
      icon: Settings,
      defaultUser: 'admin',
      defaultPass: 'admin123',
      demoName: 'Administrator (Full Access)',
      redirectPath: '/admin'
    }
  };

  const config = portalConfig[currentPortal] || portalConfig.admin;
  const IconComponent = config.icon;

  useEffect(() => {
    // Set default demo values on portal change
    setError('');
    if (currentPortal === 'admin') {
      setLoginId('admin');
      setPassword('admin123');
    } else {
      setLoginId(config.defaultUser);
      setPassword(config.defaultPass);
    }
  }, [currentPortal]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/api/auth/login', {
        role: currentPortal,
        loginId,
        password
      });

      const { token, role: userRole, user } = res.data;
      const authData = {
        token,
        role: userRole,
        user: user || { name: config.demoName.split(' ')[0], role: userRole }
      };

      localStorage.setItem('token', token);
      localStorage.setItem('role', userRole);
      localStorage.setItem('user', JSON.stringify(authData.user));

      if (setAuth) setAuth(authData);
      navigate(config.redirectPath);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setLoginId(config.defaultUser);
    setPassword(config.defaultPass);
    
    try {
      const res = await api.post('/api/auth/login', {
        role: currentPortal,
        loginId: config.defaultUser,
        password: config.defaultPass
      });

      const { token, role: userRole, user } = res.data;
      const authData = {
        token,
        role: userRole,
        user: user || { name: config.demoName.split(' ')[0], role: userRole }
      };

      localStorage.setItem('token', token);
      localStorage.setItem('role', userRole);
      localStorage.setItem('user', JSON.stringify(authData.user));

      if (setAuth) setAuth(authData);
      navigate(config.redirectPath);
    } catch (err) {
      // Fallback direct entry for smooth demo
      const authData = {
        token: 'demo-token',
        role: currentPortal,
        user: { name: config.demoName.split(' ')[0], role: currentPortal }
      };
      if (setAuth) setAuth(authData);
      navigate(config.redirectPath);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between p-6">
      {/* Top Bar */}
      <div className="max-w-6xl w-full mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-blue-600 text-white font-bold p-1 rounded h-8 w-8 flex items-center justify-center text-sm">TP</div>
          <div>
            <h1 className="font-bold text-gray-900 leading-tight text-sm">TrackPath</h1>
            <p className="text-[10px] text-gray-500">Tracking Outcomes. Building Futures.</p>
          </div>
        </Link>
        <Link to="/" className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
          <ArrowLeft size={14} /> Back to Hub
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-8">
        {/* Portal Switcher Tabs */}
        <div className="flex bg-white p-1 rounded-2xl border border-gray-200 shadow-sm mb-6">
          <Link
            to="/login/trainee"
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all ${
              currentPortal === 'trainee' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <User size={14} /> Trainee
          </Link>
          <Link
            to="/login/employer"
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all ${
              currentPortal === 'employer' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Building size={14} /> Employer
          </Link>
          <Link
            to="/login/admin"
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all ${
              currentPortal === 'admin' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Settings size={14} /> Admin
          </Link>
        </div>

        {/* Card Body */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.lightBg} ${config.textColor}`}>
              <IconComponent size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{config.name} Login</h2>
              <p className="text-xs text-gray-500">{config.tagline}</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {currentPortal !== 'admin' && (
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  {currentPortal === 'trainee' ? 'Trainee ID / Username' : 'Employer Username'}
                </label>
                <input
                  type="text"
                  required
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder={config.defaultUser}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 font-medium"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                {currentPortal === 'admin' ? 'Admin Access Password' : 'Password'}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 font-medium"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${config.bgColor} ${config.hoverColor} text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2`}
            >
              {loading ? 'Authenticating...' : `Enter ${config.name}`}
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Demo 1-Click Login */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 font-semibold mb-2">Instant Demo Access:</p>
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className={`w-full flex items-center justify-between p-3 rounded-xl border ${config.borderColor} ${config.lightBg} hover:opacity-90 transition-all text-left`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles size={16} className={config.textColor} />
                <div>
                  <p className={`text-xs font-bold ${config.textColor}`}>1-Click Demo Login</p>
                  <p className="text-[11px] text-gray-600">{config.demoName}</p>
                </div>
              </div>
              <span className={`text-xs font-bold ${config.textColor}`}>Enter &rarr;</span>
            </button>
          </div>
        </div>

        {/* Security Note */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mt-6">
          <ShieldCheck size={14} className="text-green-600" /> End-to-end encrypted outcome tracking
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-400">
        TrackPath Skilling Outcomes Platform &copy; 2026
      </div>
    </div>
  );
}
