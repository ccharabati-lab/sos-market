'use client';

import { useEffect } from 'react';
import { Phone, Mail, MessageCircle, Send, Check, X } from 'lucide-react';
import { useContactModal } from './ContactModalProvider';

const channelOptions = [
  { Icon: Phone,         label: 'Appeler' },
  { Icon: Mail,          label: 'Email' },
  { Icon: MessageCircle, label: 'Message' },
];

export default function ContactModal() {
  const { isOpen, supplier, stage, close, confirm } = useContactModal();

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event) {
      if (event.key === 'Escape') close();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [close, isOpen]);

  if (!isOpen) return null;

  const sent = stage === 'sent';

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-[4px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="bg-paper border border-line rounded-[14px] p-7 w-[90%] max-w-[380px] shadow-[0_20px_60px_rgba(0,0,0,0.12)] animate-pop">
        <div className="flex items-start justify-between mb-[0.3rem]">
          <h3 className="text-base font-extrabold">
            {sent ? 'Demande envoyée' : supplier}
          </h3>
          <button
            onClick={close}
            className="cursor-pointer text-muted flex items-center justify-center w-[26px] h-[26px] rounded-md hover:bg-canvas-soft transition-colors"
          >
            <X size={15} />
          </button>
        </div>
        <p className="text-[0.82rem] text-muted mb-[1.2rem]">
          {sent
            ? `${supplier} a été notifié. Vous recevrez une réponse sous 2h.`
            : 'Choisissez comment entrer en contact :'}
        </p>

        {!sent && (
          <div className="flex gap-[0.6rem] mb-[0.8rem]">
            {channelOptions.map(({ Icon, label }) => (
              <button
                key={label}
                className="group flex-1 bg-canvas border border-line rounded-lg py-[0.7rem] px-[0.6rem] text-[0.78rem] text-center cursor-pointer flex flex-col items-center gap-[0.35rem] text-ink-soft font-semibold hover:border-green-bright hover:text-green transition-colors"
              >
                <Icon size={16} className="text-muted group-hover:text-green" />
                {label}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={sent ? close : confirm}
          className="w-full flex items-center justify-center gap-2 bg-green text-white border-none rounded-lg py-[0.65rem] text-[0.86rem] font-bold cursor-pointer hover:bg-green-bright transition-colors"
        >
          {sent ? (
            <>
              <Check size={14} />
              Fermer
            </>
          ) : (
            <>
              <Send size={14} />
              Envoyer une demande
            </>
          )}
        </button>
      </div>
    </div>
  );
}
