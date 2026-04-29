'use client';

import { useState } from 'react';
import { Map, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { useContactModal } from './ContactModalProvider';
import { networkMapHints } from '../data/demo';

const FILTERS = [
  { id: 'all',      label: 'Tous les signaux',    dot: 'bg-muted' },
  { id: 'surplus',  label: 'Surplus disponibles', dot: 'bg-blue-bright' },
  { id: 'shortage', label: 'Besoins signalés',    dot: 'bg-red' },
];

export default function NetworkMap({ signals }) {
  const [filter, setFilter] = useState('all');
  const { open } = useContactModal();

  const counts = {
    all:      signals.length,
    surplus:  signals.filter((s) => s.signal_type === 'surplus').length,
    shortage: signals.filter((s) => s.signal_type === 'shortage').length,
  };

  const visible = filter === 'all' ? signals : signals.filter((s) => s.signal_type === filter);

  return (
    <div className="bg-paper border border-line rounded-xl p-5">
      <div className="text-[0.78rem] font-bold uppercase tracking-[0.1em] text-muted mb-[1.1rem] flex items-center gap-2">
        <Map size={14} />
        Carte du réseau local
      </div>

      <div className="grid grid-cols-[1fr_2fr] gap-6">
        <div className="flex flex-col gap-[0.55rem]">
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex items-center gap-[0.7rem] py-[0.7rem] px-[0.85rem] border rounded-lg cursor-pointer text-[0.82rem] font-semibold transition-colors ${
                  active
                    ? 'border-green-bright bg-green-light text-green'
                    : 'border-line bg-canvas text-ink-soft hover:border-line-strong hover:bg-canvas-soft'
                }`}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${f.dot}`} />
                {f.label}
                <span
                  className={`ml-auto text-[0.72rem] font-bold py-[0.1rem] px-[0.45rem] rounded-full ${
                    active ? 'bg-green-mid text-green' : 'bg-canvas-soft text-muted'
                  }`}
                >
                  {counts[f.id]}
                </span>
              </button>
            );
          })}
          <button
            onClick={() => open('Signaler un besoin/surplus')}
            className="mt-2 w-full flex items-center justify-center gap-2 bg-canvas text-ink-soft border border-line-strong rounded-lg py-[0.55rem] text-[0.8rem] font-semibold cursor-pointer hover:border-green-bright hover:bg-green-light hover:text-green transition-colors"
          >
            <Plus size={14} />
            Ajouter un signal
          </button>
        </div>

        <div className="bg-canvas-soft border border-line rounded-[10px] aspect-[16/8] relative overflow-hidden network-grid">
          <div
            className="absolute"
            style={{ top: '47%', left: 0, right: 0, height: 5, background: 'rgba(0,0,0,.07)' }}
          />
          <div
            className="absolute"
            style={{ top: 0, bottom: 0, left: '44%', width: 3, background: 'rgba(0,0,0,.07)' }}
          />
          <div
            className="absolute"
            style={{
              top: '68%',
              left: '30%',
              right: 0,
              height: 2,
              background: 'rgba(0,0,0,.07)',
              transform: 'rotate(-4deg)',
            }}
          />

          {networkMapHints.labels.map((l, i) => (
            <div
              key={i}
              className="absolute text-[0.62rem] text-muted font-semibold tracking-[0.05em] uppercase"
              style={l.style}
            >
              {l.text}
            </div>
          ))}

          <svg
            className="absolute inset-0 w-full h-full z-[1] pointer-events-none"
            viewBox="0 0 600 300"
            preserveAspectRatio="none"
          >
            {networkMapHints.lines.map((line, i) => (
              <line
                key={i}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke={line.stroke}
                strokeWidth="1.5"
                strokeDasharray="6,3"
                opacity={line.opacity}
              />
            ))}
          </svg>

          <div
            className="absolute z-[3]"
            style={{
              top: '50%',
              left: '45%',
              transform: 'translate(-50%, -50%)',
              width: 14,
              height: 14,
              borderRadius: 3,
              background: '#1a1f18',
              border: '2px solid #3d4439',
            }}
          >
            <span className="absolute left-1/2 -translate-x-1/2 -top-[17px] text-[0.6rem] text-ink font-bold whitespace-nowrap">
              Vous
            </span>
          </div>

          {visible.map((s) => {
            const surplus = s.signal_type === 'surplus';
            const Icon = surplus ? TrendingUp : TrendingDown;
            return (
              <div
                key={s.id}
                className="absolute z-[2]"
                style={{ top: s.pin?.top, left: s.pin?.left, transform: 'translate(-50%, -50%)' }}
              >
                <button
                  title={s.store_name}
                  onClick={() => open(s.store_name)}
                  className={`w-[30px] h-[30px] rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-125 ${
                    surplus
                      ? 'bg-blue-soft border-2 border-blue-bright text-blue-deep'
                      : 'bg-red-light border-2 border-red text-red'
                  }`}
                >
                  <Icon size={13} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
