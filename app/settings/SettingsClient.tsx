'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle2, LogOut } from 'lucide-react';
import { supabaseBrowser } from '../../lib/supabase-browser';
import type { Profile, Role } from '../../types';

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`,
      { headers: { 'User-Agent': 'sos-market/1.0' } },
    );
    const json = await res.json();
    if (!Array.isArray(json) || !json[0]) return null;
    return { lat: parseFloat(json[0].lat), lng: parseFloat(json[0].lon) };
  } catch {
    return null;
  }
}

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'supermarket', label: 'Supermarché' },
  { value: 'producer', label: 'Producteur' },
  { value: 'restaurant', label: 'Restaurant' },
];

const INPUT_CLS =
  'w-full bg-canvas border border-line rounded-lg px-3 py-2.5 text-[0.88rem] text-ink placeholder:text-muted focus:outline-none focus:border-green-bright focus:bg-paper transition-colors';

interface SettingsClientProps {
  profile: Profile | null;
  email: string | null;
}

export default function SettingsClient({ profile, email }: SettingsClientProps) {
  const router = useRouter();
  const [name, setName] = useState(profile?.name ?? '');
  const [role, setRole] = useState<Role>((profile?.role as Role) ?? 'supermarket');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [address, setAddress] = useState(profile?.address ?? '');
  const initialAddress = profile?.address ?? '';

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    const update: Partial<Profile> = { name, role, phone: phone || null, address: address || null };

    if (address && address !== initialAddress) {
      const coords = await geocodeAddress(address);
      if (coords) {
        update.lat = coords.lat;
        update.lng = coords.lng;
      }
    }

    const { error: updateError } = await supabaseBrowser
      .from('profiles')
      .update(update)
      .eq('id', profile.id);

    if (updateError) {
      setError(updateError.message);
      setSubmitting(false);
      return;
    }

    setSuccess('Profil mis à jour.');
    setSubmitting(false);
    router.refresh();
  }

  async function onSignOut() {
    await supabaseBrowser.auth.signOut();
    router.push('/auth/signin');
    router.refresh();
  }

  if (!profile) {
    return (
      <div className="bg-paper border border-line rounded-xl p-8">
        <p className="text-[0.85rem] text-muted">Profil introuvable.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-7">
        <h1 className="text-[1.3rem] font-extrabold text-ink">Paramètres</h1>
        <p className="text-[0.83rem] text-muted mt-1">
          Modifiez les informations de votre organisation. Une nouvelle adresse est
          re-géolocalisée automatiquement.
        </p>
      </div>

      <div className="grid grid-cols-[1fr_minmax(280px,340px)] gap-5">
        <form
          onSubmit={onSubmit}
          className="bg-paper border border-line rounded-xl p-6 flex flex-col gap-4"
        >
          {error && (
            <div className="bg-red-light border border-red-mid rounded-lg p-3 flex items-start gap-2">
              <AlertCircle size={16} className="text-red flex-shrink-0 mt-0.5" />
              <p className="text-[0.82rem] text-ink-soft">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-light border border-green-mid rounded-lg p-3 flex items-start gap-2">
              <CheckCircle2 size={16} className="text-green flex-shrink-0 mt-0.5" />
              <p className="text-[0.82rem] text-ink-soft">{success}</p>
            </div>
          )}

          <Field label="Nom de l'organisation">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
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

          <Field label="Téléphone">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+33 1 23 45 67 89"
              className={INPUT_CLS}
            />
          </Field>

          <Field label="Adresse">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="3 rue de la Vallée, 91190 Gif-sur-Yvette"
              className={INPUT_CLS}
            />
            {address !== initialAddress && (
              <span className="text-[0.7rem] text-amber font-semibold">
                L&apos;adresse sera re-géolocalisée à l&apos;enregistrement.
              </span>
            )}
          </Field>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 self-start flex items-center justify-center gap-2 bg-green text-white border-none rounded-lg py-2.5 px-5 text-sm font-bold cursor-pointer hover:bg-green-bright transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Enregistrement…
              </>
            ) : (
              'Enregistrer'
            )}
          </button>
        </form>

        <div className="flex flex-col gap-4">
          <div className="bg-paper border border-line rounded-xl p-5">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.06em] text-muted mb-2">
              Compte
            </p>
            <p className="text-[0.85rem] font-semibold text-ink truncate">{email ?? '—'}</p>
            <p className="text-[0.72rem] text-muted mt-1">
              Membre depuis{' '}
              {profile.created_at
                ? new Date(profile.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })
                : '—'}
            </p>
          </div>

          <div className="bg-paper border border-line rounded-xl p-5">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.06em] text-muted mb-2">
              Géolocalisation
            </p>
            {profile.lat != null && profile.lng != null ? (
              <p className="text-[0.78rem] text-ink-soft font-mono">
                {profile.lat.toFixed(4)}, {profile.lng.toFixed(4)}
              </p>
            ) : (
              <p className="text-[0.78rem] text-amber">
                Aucune coordonnée — saisissez une adresse pour activer la carte.
              </p>
            )}
          </div>

          <button
            onClick={onSignOut}
            className="bg-paper border border-line rounded-xl p-4 flex items-center gap-2.5 text-[0.85rem] font-semibold text-ink-soft hover:bg-canvas-soft hover:border-line-strong transition-colors cursor-pointer"
          >
            <LogOut size={15} className="text-muted" />
            Se déconnecter
          </button>
        </div>
      </div>
    </>
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
