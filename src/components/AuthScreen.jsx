import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../lib/firebase.js';

export default function AuthScreen() {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setError(''); setBusy(true);
    try {
      if (mode === 'signup') { const result = await createUserWithEmailAndPassword(auth, email.trim(), password); if (name.trim()) await updateProfile(result.user, { displayName: name.trim() }); }
      else await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) { setError(err.code?.replace('auth/', '').replaceAll('-', ' ') || 'Authentication failed'); }
    finally { setBusy(false); }
  };
  if (!isFirebaseConfigured()) return <div className="min-h-screen grid place-items-center bg-slate-950 p-6 text-center text-white"><div><h1 className="text-2xl font-black">NetZeroCalc</h1><p className="mt-2 text-slate-300">Firebase is not configured. Add the VITE_FIREBASE_* values from the deployment guide.</p></div></div>;
  return <main className="min-h-screen grid place-items-center bg-slate-950 p-6"><form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl space-y-5"><div><p className="text-xs font-black uppercase tracking-widest text-emerald-600">Authenticated carbon intelligence</p><h1 className="mt-2 text-3xl font-black text-slate-900">Welcome to NetZeroCalc</h1><p className="mt-2 text-sm text-slate-500">Your workspaces are private to your Firebase account.</p></div>{mode === 'signup' && <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm" />}<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm" /><input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (6+ characters)" className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm" />{error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}<button disabled={busy} className="w-full rounded-lg bg-emerald-600 py-3 font-bold text-white disabled:opacity-50">{busy ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Sign in'}</button><button type="button" onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')} className="w-full text-sm font-semibold text-emerald-700">{mode === 'signup' ? 'Already have an account? Sign in' : 'Create a new account'}</button></form></main>;
}
