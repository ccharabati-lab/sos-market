'use client';

import { Package, Plus } from 'lucide-react';
import { useContactModal } from './ContactModalProvider';

const barTone = {
  red:    'bg-red',
  amber:  'bg-amber',
  green:  'bg-green-bright',
  excess: 'bg-blue-bright',
};

const tagTone = {
  ok:     'bg-green-light text-green',
  low:    'bg-red-light text-red',
  excess: 'bg-blue-soft text-blue-deep',
  warn:   'bg-amber-light text-amber',
};

export default function StockStatusCard({ items }) {
  const { open } = useContactModal();
  return (
    <div className="bg-paper border border-line rounded-xl p-5">
      <div className="text-[0.78rem] font-bold uppercase tracking-[0.1em] text-muted mb-[1.1rem] flex items-center gap-2">
        <Package size={14} />
        Mon stock actuel
      </div>
      <div className="flex flex-col gap-[0.55rem]">
        {items.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-[0.85rem] py-[0.7rem] px-[0.85rem] bg-canvas border border-line rounded-lg"
          >
            <div className="flex-1 text-[0.84rem] font-semibold">{item.name}</div>
            <div className="w-20 h-1.5 bg-canvas-soft rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-[width] duration-500 ${barTone[item.tone]}`}
                style={{ width: `${item.percent}%` }}
              />
            </div>
            <span
              className={`text-[0.68rem] font-bold py-[0.15rem] px-2 rounded-full whitespace-nowrap ${tagTone[item.tagTone]}`}
            >
              {item.tag}
            </span>
          </div>
        ))}
      </div>
      <button
        onClick={() => open('Signaler un besoin/surplus')}
        className="mt-[0.9rem] w-full flex items-center justify-center gap-2 bg-canvas text-ink-soft border border-line-strong rounded-lg py-[0.55rem] text-[0.8rem] font-semibold cursor-pointer hover:border-green-bright hover:bg-green-light hover:text-green transition-colors"
      >
        <Plus size={14} />
        Signaler un besoin ou un surplus
      </button>
    </div>
  );
}
