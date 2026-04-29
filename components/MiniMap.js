'use client';

import { Factory, Droplets, Package, Wheat, Leaf, ShoppingBag } from 'lucide-react';

const supplierIconMap = {
  factory: Factory,
  droplets: Droplets,
  package: Package,
  wheat: Wheat,
  leaf: Leaf,
  'shopping-bag': ShoppingBag,
};

export default function MiniMap({ suppliers, mapHints, selectedId, onSelect }) {
  return (
    <div className="bg-paper border border-line-strong rounded-[10px] aspect-[16/11] relative overflow-hidden map-grid">
      <div
        className="absolute"
        style={{ top: '48%', left: 0, right: 0, height: 4, background: 'rgba(0,0,0,.07)' }}
      />
      <div
        className="absolute"
        style={{ top: 0, bottom: 0, left: '40%', width: 3, background: 'rgba(0,0,0,.07)' }}
      />

      {(mapHints?.labels || []).map((l, i) => (
        <div
          key={i}
          className="absolute text-[0.58rem] text-muted font-semibold tracking-[0.05em] uppercase pointer-events-none"
          style={l.style}
        >
          {l.text}
        </div>
      ))}

      <svg
        className="absolute inset-0 w-full h-full z-[1] pointer-events-none"
        viewBox="0 0 300 200"
        preserveAspectRatio="none"
      >
        {(mapHints?.lines || []).map((line, i) => (
          <line
            key={i}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={line.stroke}
            strokeWidth="1.5"
            strokeDasharray="5,3"
            opacity={line.opacity}
          />
        ))}
      </svg>

      <div
        className="absolute z-[3]"
        style={{
          top: '50%',
          left: '40%',
          transform: 'translate(-50%, -50%)',
          width: 13,
          height: 13,
          borderRadius: 3,
          background: '#c0312b',
          border: '2px solid rgba(192,49,43,.4)',
        }}
      >
        <span className="absolute left-1/2 -translate-x-1/2 -top-[17px] text-[0.58rem] text-red font-bold whitespace-nowrap">
          Vous
        </span>
      </div>

      {suppliers.map((s) => {
        const Icon = supplierIconMap[s.icon] || Package;
        const partial = s.availability_tone === 'warn';
        return (
          <div
            key={s.id}
            className="absolute z-[2]"
            style={{ top: s.pin?.top, left: s.pin?.left, transform: 'translate(-50%, -50%)' }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(s.id);
              }}
              className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-125 ${
                partial
                  ? 'bg-amber-light border-[1.5px] border-amber text-amber'
                  : 'bg-green-light border-[1.5px] border-green-bright text-green'
              }`}
            >
              <Icon size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
