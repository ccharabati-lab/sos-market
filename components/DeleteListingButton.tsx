'use client';

import { useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { supabaseBrowser } from '../lib/supabase-browser';

interface DeleteListingButtonProps {
  listingId: string;
  productName: string;
  onDeleted?: () => void;
}

export default function DeleteListingButton({
  listingId,
  productName,
  onDeleted,
}: DeleteListingButtonProps) {
  const [deleting, setDeleting] = useState(false);

  async function onClick() {
    if (deleting) return;
    const confirmed = window.confirm(
      `Retirer « ${productName} » du réseau ? Cette action est définitive.`,
    );
    if (!confirmed) return;

    setDeleting(true);
    const { error } = await supabaseBrowser.from('listings').delete().eq('id', listingId);

    if (error) {
      setDeleting(false);
      window.alert(`Suppression impossible : ${error.message}`);
      return;
    }

    onDeleted?.();
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={deleting}
      title="Retirer ce signal"
      className="inline-flex items-center justify-center w-7 h-7 rounded-md text-muted hover:text-red hover:bg-red-light border border-transparent hover:border-red-mid disabled:opacity-60 transition-colors"
    >
      {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
    </button>
  );
}
