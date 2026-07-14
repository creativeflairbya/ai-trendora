import React, { useState } from 'react';
import { KeyRound, Mail, Phone, ShieldCheck, UserPlus } from 'lucide-react';
import { UserProfile } from '../types';
import { ACCOUNT_PRESETS } from '../data/serverConfig';

interface AuthPageProps {
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  setCurrentTab: (tab: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ setUser, setCurrentTab }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset' | 'change'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');

  const login = () => {
    const normalized = email.toLowerCase().trim();
    const account = Object.values(ACCOUNT_PRESETS).find((item) => item.email.toLowerCase() === normalized);
    if (account) {
      setUser(account);
      setCurrentTab('home');
      return;
    }
    setMessage('Account not found in demo mode. Use signup to create a test user.');
  };

  const signup = () => {
    if (!email || !phone || code !== '123456') {
      setMessage('Enter email, phone, and verification code 123456 for demo signup.');
      return;
    }
    setUser({ ...ACCOUNT_PRESETS.free, email, name: email.split('@')[0] || 'New User' });
    setCurrentTab('home');
  };

  const reset = () => {
    if (email.toLowerCase().trim() === 'creativeflairbya@gmail.com') {
      setMessage('Master reset link simulated. Check secure owner inbox in production.');
    } else {
      setMessage('Password reset instructions sent if this email exists.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] px-4 py-12 text-slate-100 flex items-center justify-center">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-[#0f1420] p-6 shadow-2xl space-y-5">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-black">
            {mode === 'signup' ? <UserPlus className="h-6 w-6" /> : <KeyRound className="h-6 w-6" />}
          </div>
          <h1 className="text-2xl font-extrabold text-white">ChartSignal AI</h1>
          <p className="mt-1 text-xs text-slate-400">Secure access for chart analysis and signal history.</p>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-900 p-1 text-xs font-bold">
          <button onClick={() => setMode('login')} className={`rounded-lg py-2 ${mode === 'login' ? 'bg-emerald-500 text-black' : 'text-slate-400'}`}>Login</button>
          <button onClick={() => setMode('signup')} className={`rounded-lg py-2 ${mode === 'signup' ? 'bg-emerald-500 text-black' : 'text-slate-400'}`}>Signup</button>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-400">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-3 text-sm text-white outline-none focus:border-emerald-500" placeholder="you@example.com" />
          </div>

          {mode !== 'reset' && (
            <>
              <label className="block text-xs font-bold text-slate-400">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-emerald-500" placeholder="Enter password" />
            </>
          )}

          {mode === 'signup' && (
            <>
              <label className="block text-xs font-bold text-slate-400">Phone number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-3 text-sm text-white outline-none focus:border-emerald-500" placeholder="+92 300 0000000" />
              </div>
              <div className="flex gap-2">
                <input value={code} onChange={(e) => setCode(e.target.value)} className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-emerald-500" placeholder="SMS code" />
                <button onClick={() => setMessage('Demo SMS code is 123456.')} className="rounded-xl bg-slate-800 px-3 text-xs font-bold text-white">Send code</button>
              </div>
            </>
          )}
        </div>

        <button
          onClick={mode === 'login' ? login : mode === 'signup' ? signup : reset}
          className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-extrabold text-black hover:bg-emerald-400"
        >
          {mode === 'login' ? 'Login' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
        </button>

        <div className="flex flex-wrap justify-center gap-3 text-xs text-slate-400">
          <button onClick={() => setMode('reset')} className="hover:text-emerald-400">Forgot password?</button>
          <button onClick={() => setMode('change')} className="hover:text-emerald-400">Change password</button>
          {mode === 'change' && <span className="text-emerald-400">Enter email + new password then use reset flow in production.</span>}
        </div>

        {message && <div className="rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs text-slate-200">{message}</div>}

        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-[11px] text-emerald-100">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Master password is not displayed here. Owner reset email: creativeflairbya@gmail.com</span>
        </div>
      </div>
    </div>
  );
};