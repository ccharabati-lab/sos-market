'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertCircle } from 'lucide-react';
import { supabaseBrowser } from '../../../lib/supabase-browser';
import type { Role } from '../../../types';

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'supermarket', label: 'Supermarché' },
  { value: 'producer',    label: 'Producteur' },
  { value: 'restaurant',  label: 'Restaurant' },
];

const INPUT_CLS =
  'w-full bg-canvas border border-line rounded-lg px-3 py-2.5 text-[0.88rem] text-ink placeholder:text-muted focus:outline-none focus:border-green-bright focus:bg-paper transition-colors';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('supermarket');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { data, error: signUpError } = await supabaseBrowser.auth.signUp({
      email,
      password,
    });

    if (signUpError || !data.user) {
      setError(signUpError?.message ?? 'Inscription impossible.');
      setSubmitting(false);
      return;
    }

    const { error: profileError } = await supabaseBrowser
      .from('profiles')
      .insert({ id: data.user.id, name, role, address });

    if (profileError) {
      // Most likely cause: Supabase email confirmation is enabled, so
      // signUp didn't return a session and the insert hits RLS without auth.
      setError(
        `Compte créé, mais profil non enregistré : ${profileError.message}. ` +
          `Vérifiez votre email puis reconnectez-vous pour finaliser.`,
      );
      setSubmitting(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="w-full max-w-md bg-paper border border-line rounded-2xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-ink">Créer un compte</h1>
        <p className="text-[0.85rem] text-muted mt-1">
          Rejoignez le réseau SOS-Market.
        </p>
      </div>

      {error && (
        <div className="bg-red-light border border-red-mid rounded-lg p-3 mb-4 flex items-start gap-2">
          <AlertCircle size={16} className="text-red flex-shrink-0 mt-0.5" />
          <p className="text-[0.82rem] text-ink-soft">{error}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field label="Nom de l'organisation">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Intermarché Gif-sur-Yvette"
            className={INPUT_CLS}
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className={INPUT_CLS}
          />
        </Field>

        <Field label="Mot de passe">
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            className={INPUT_CLS}
          />
        </Field>

        <Field label="Type d'organisation">
          <select
            required
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className={INPUT_CLS}
          >
            {ROLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Adresse">
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="3 rue de la Vallée, 91190 Gif-sur-Yvette"
            className={INPUT_CLS}
          />
        </Field>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 w-full flex items-center justify-center gap-2 bg-green text-white border-none rounded-lg py-2.5 text-sm font-bold cursor-pointer hover:bg-green-bright transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Création…
            </>
          ) : (
            'Créer un compte'
          )}
        </button>
      </form>

      <p className="text-[0.82rem] text-muted text-center mt-6">
        Déjà un compte ?{' '}
        <Link href="/auth/signin" className="text-green font-semibold hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[0.78rem] font-semibold text-ink-soft">{label}</span>
      {children}
    </label>
  );
}
