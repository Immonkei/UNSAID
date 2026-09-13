'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { api, setAdminToken } from '../../../lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await api.adminLogin(email.trim(), password);
      setAdminToken(data.token);
      router.push('/admin');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 mx-auto rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300">
          <Lock className="w-5 h-5" />
        </div>
        <h1 className="text-2xl font-serif text-neutral-100">Moderator Access</h1>
        <p className="text-xs text-neutral-400">
          Sign in to review submissions and moderate content.
        </p>
      </div>

      <form onSubmit={handleLogin} className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 sm:p-8 space-y-5">
        {error && (
          <div className="flex items-center space-x-2 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-xs uppercase tracking-wider text-neutral-400 font-medium">
            Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@unsaid.me"
              className="w-full rounded-xl bg-neutral-950/80 border border-neutral-800 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-neutral-600 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs uppercase tracking-wider text-neutral-400 font-medium">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-xl bg-neutral-950/80 border border-neutral-800 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-neutral-600 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-neutral-100 text-neutral-950 text-xs sm:text-sm font-semibold hover:bg-neutral-200 transition-all disabled:opacity-50"
        >
          <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
