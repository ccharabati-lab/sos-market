'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Loader2 } from 'lucide-react';
import { supabaseBrowser } from '../lib/supabase-browser';

export default function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    await supabaseBrowser.auth.signOut();
    router.replace('/auth/signin');
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-label="Se déconnecter"
      className="inline-flex items-center gap-1.5 text-[0.74rem] font-semibold text-muted hover:text-ink-soft cursor-pointer disabled:opacity-60 transition-colors"
    >
      {pending ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <LogOut size={14} />
      )}
      Se déconnecter
    </button>
  );
}
