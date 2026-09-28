'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? 'Something went wrong');
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <Sparkles className="text-arcane-400" size={22} />
          <span className="font-display font-semibold text-lg">DSA Quest</span>
        </Link>
        <div className="rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-6">
          <h1 className="font-display text-xl text-parchment mb-1">Begin your quest</h1>
          <p className="text-sm text-mist mb-6">Free forever. No credit card, just curiosity.</p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-mist mb-1.5">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                maxLength={20}
                className="w-full rounded-lg bg-obsidian-800 border border-obsidian-600 px-3 py-2 text-sm focus:border-arcane-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-mist mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg bg-obsidian-800 border border-obsidian-600 px-3 py-2 text-sm focus:border-arcane-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-mist mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-lg bg-obsidian-800 border border-obsidian-600 px-3 py-2 text-sm focus:border-arcane-500 outline-none"
              />
            </div>
            {error && <p className="text-sm text-ember_red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-arcane-500 hover:bg-arcane-400 disabled:opacity-60 text-obsidian-950 font-medium py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-mist mt-4">
          Already adventuring?{' '}
          <Link href="/login" className="text-arcane-400 hover:text-arcane-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
