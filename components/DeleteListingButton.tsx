'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2 } from 'lucide-react';
import { supabaseBrowser } from '../lib/supabase-browser';

interface DeleteListingButtonProps {
  listingId: string;
  productName: string;
}

export default function DeleteListingButton({
  listingId,
  productName,
}: DeleteListingButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deleting, setDeleting] = useState(false);

  async function onClick() {
    if (deleting || pending) return;
    const confirmed = window.confirm(
      `Retirer « ${productName} » du réseau ? Cette action est définitive.`,
    );
    if (!confirmed) return;

    setDeleting(true);
    const { error } = await supabaseBrowser.from('listings').delete().eq('id', listingId);
    setDeleting(false);

    if (error) {
      window.alert(`Suppression impossible : ${error.message}`);
      return;
    }

    startTransition(() => router.refresh());
  }

  const busy = deleting || pending;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      title="Retirer ce signal"
      className="inline-flex items-center justify-center w-7 h-7 rounded-md text-muted hover:text-red hover:bg-red-light border border-transparent hover:border-red-mid disabled:opacity-60 transition-colors"
    >
      {busy ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
    </button>
  );
}
