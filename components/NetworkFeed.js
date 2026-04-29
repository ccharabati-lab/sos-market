'use client';

import { Radio, TrendingUp, TrendingDown } from 'lucide-react';
import { useContactModal } from './ContactModalProvider';

export default function NetworkFeed({ signals }) {
  const { open } = useContactModal();
  const visible = signals.filter((s) => !s.feed_hidden);

  return (
    <div className="bg-paper border border-line rounded-xl p-5">
      <div className="text-[0.78rem] font-bold uppercase tracking-[0.1em] text-muted mb-[1.1rem] flex items-center gap-2">
        <Radio size={14} />
        Réseau — Signaux en cours
      </div>
      <div className="flex flex-col gap-[0.6rem]">
        {visible.map((s) => {
          const surplus = s.signal_type === 'surplus';
          const Icon = surplus ? TrendingUp : TrendingDown;
          return (
            <div
              key={s.id}
              onClick={() => open(s.store_name)}
              className="flex items-start gap-[0.85rem] py-[0.85rem] px-[0.85rem] border border-line rounded-[9px] cursor-pointer hover:border-line-strong hover:bg-canvas transition-colors"
            >
              <div
                className={`w-[34px] h-[34px] rounded-lg flex-shrink-0 flex items-center justify-center ${
                  surplus ? 'bg-blue-soft text-blue-deep' : 'bg-red-light text-red'
                }`}
              >
                <Icon size={15} />
              </div>
              <div className="flex-1">
                <div className="text-[0.82rem] font-bold">{s.store_name}</div>
                <div className="text-[0.74rem] text-muted mt-[0.1rem]">{s.detail}</div>
                <span
                  className={`text-[0.68rem] font-bold py-[0.15rem] px-2 rounded-full mt-[0.35rem] inline-block ${
                    surplus ? 'bg-blue-soft text-blue-deep' : 'bg-red-light text-red'
                  }`}
                >
                  {surplus ? 'Surplus disponible' : 'Besoin signalé'}
                </span>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="text-[0.75rem] font-bold text-green">{s.distance_km} km</div>
                <div className="text-[0.69rem] text-muted mt-[0.15rem]">{s.time_label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
