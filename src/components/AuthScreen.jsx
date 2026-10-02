import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

export default function AuthScreen({ onContinueAsGuest }) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const submit = async (event) => {
    event.preventDefault(); setError(''); setNotice(''); setBusy(true);
    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: name.trim() } } });
        if (signUpError) throw signUpError;
        if (!data.session) setNotice('Check your email to confirm your account, then sign in.');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (signInError) throw signInError;
      }
    } catch (err) { setError(err.message || 'Authentication failed'); }
    finally { setBusy(false); }
  };
  if (!isSupabaseConfigured()) return <div className="min-h-screen grid place-items-center bg-slate-950 p-6 text-center text-white"><div><h1 className="text-2xl font-black">NetZeroCalc</h1><p className="mt-2 text-slate-300">Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.</p></div></div>;
  const googleSignIn = async () => {
    setError('');
    const { error: oauthError } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
    if (oauthError) setError(oauthError.message);
  };

  return <main className="min-h-screen grid place-items-center bg-slate-950 p-6"><form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl space-y-5"><div><p className="text-xs font-black uppercase tracking-widest text-emerald-600">Authenticated carbon intelligence</p><h1 className="mt-2 text-3xl font-black text-slate-900">Welcome to NetZeroCalc</h1><p className="mt-2 text-sm text-slate-500">Your workspaces are private to your account.</p></div>{mode === 'signup' && <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm" />}<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm" /><input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (8+ characters)" className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm" />{notice && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{notice}</p>}{error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}<button disabled={busy} className="w-full rounded-lg bg-emerald-600 py-3 font-bold text-white disabled:opacity-50">{busy ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Sign in'}</button><div className="flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />or<span className="h-px flex-1 bg-slate-200" /></div><button type="button" onClick={googleSignIn} className="w-full rounded-lg border border-slate-300 bg-white py-3 font-bold text-slate-700 hover:bg-slate-50">Continue with Google</button><button type="button" onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')} className="w-full text-sm font-semibold text-emerald-700">{mode === 'signup' ? 'Already have an account? Sign in' : 'Create a new account'}</button>{onContinueAsGuest && <button type="button" onClick={onContinueAsGuest} className="w-full text-sm text-slate-500">Try it without an account (saved in this browser only)</button>}</form></main>;
}
