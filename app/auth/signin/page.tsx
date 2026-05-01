'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertCircle } from 'lucide-react';
import { supabaseBrowser } from '../../../lib/supabase-browser';

const INPUT_CLS =
  'w-full bg-canvas border border-line rounded-lg px-3 py-2.5 text-[0.88rem] text-ink placeholder:text-muted focus:outline-none focus:border-green-bright focus:bg-paper transition-colors';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error: signInError } = await supabaseBrowser.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setError(signInError.message);
      setSubmitting(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="w-full max-w-md bg-paper border border-line rounded-2xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-ink">Se connecter</h1>
        <p className="text-[0.85rem] text-muted mt-1">
          Accédez à votre tableau de bord.
        </p>
      </div>

      {error && (
        <div className="bg-red-light border border-red-mid rounded-lg p-3 mb-4 flex items-start gap-2">
          <AlertCircle size={16} className="text-red flex-shrink-0 mt-0.5" />
          <p className="text-[0.82rem] text-ink-soft">{error}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-[0.78rem] font-semibold text-ink-soft">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className={INPUT_CLS}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[0.78rem] font-semibold text-ink-soft">Mot de passe</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className={INPUT_CLS}
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 w-full flex items-center justify-center gap-2 bg-green text-white border-none rounded-lg py-2.5 text-sm font-bold cursor-pointer hover:bg-green-bright transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Connexion…
            </>
          ) : (
            'Se connecter'
          )}
        </button>
      </form>

      <p className="text-[0.82rem] text-muted text-center mt-6">
        Pas encore de compte ?{' '}
        <Link href="/auth/signup" className="text-green font-semibold hover:underline">
          S&apos;inscrire
        </Link>
      </p>
    </div>
  );
}
