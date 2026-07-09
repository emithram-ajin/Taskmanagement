import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

const ANIMATION_STYLES = `
@keyframes login-blob-float-1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(30px, -20px) scale(1.08); }
}
@keyframes login-blob-float-2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(-25px, 25px) scale(1.05); }
}
@keyframes login-card-in {
    from { opacity: 0; transform: translateY(18px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes login-field-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
}
@keyframes login-shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-6px); }
    40% { transform: translateX(6px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
}
@keyframes login-error-in {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
}
.login-blob-1 {
    animation: login-blob-float-1 9s ease-in-out infinite;
}
.login-blob-2 {
    animation: login-blob-float-2 11s ease-in-out infinite;
}
.login-card-in {
    animation: login-card-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.login-field-in {
    animation: login-field-in 0.45s ease-out both;
}
.login-shake {
    animation: login-shake 0.4s ease-in-out;
}
.login-error-in {
    animation: login-error-in 0.25s ease-out both;
}
`;

const SOCIAL_PROVIDERS = [
  { key: 'google', label: 'G', textColor: 'text-[#4285F4]' },
  { key: 'facebook', label: 'f', textColor: 'text-[#1877F2]' },
  { key: 'apple', label: '', textColor: 'text-slate-900' },
];
import apiServices from '../../services/apiServices';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const triggerError = (message) => {
    setError(message);
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setIsLoading(true);
      const user = await apiServices.loginUser({ email, password });
      onLogin(user); // Pass the real user object back to App.jsx
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 py-12 px-4">
      <style>{ANIMATION_STYLES}</style>

      {/* Decorative floating blobs */}
      <div className="login-blob-1 pointer-events-none absolute -top-24 -left-20 w-80 h-80 rounded-full bg-blue-300/30 blur-3xl" />
      <div className="login-blob-2 pointer-events-none absolute -bottom-24 -right-16 w-96 h-96 rounded-full bg-cyan-300/30 blur-3xl" />

      <div className="login-card-in relative w-full max-w-sm bg-white rounded-3xl shadow-xl shadow-blue-200/50 p-8">
        {/* Heading */}
        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold text-slate-900">Sign in with email</h1>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">
            Log in to manage your team's tasks and keep every project on track.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
          {/* Email */}
          <div className={`login-field-in ${shake ? 'login-shake' : ''}`} style={{ animationDelay: '80ms' }}>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full bg-slate-100 border border-transparent rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
              />
            </div>
          </div>

          {/* Password */}
          <div className={`login-field-in ${shake ? 'login-shake' : ''}`} style={{ animationDelay: '120ms' }}>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-slate-100 border border-transparent rounded-xl pl-11 pr-11 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <div className="login-error-in flex items-center gap-1.5 mt-2 text-rose-600 text-sm">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Forgot password */}
          <div className="text-right">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default Login;