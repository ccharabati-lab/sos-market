'use client';

import { useState } from 'react';
import { TriangleAlert, X, Store, Clock } from 'lucide-react';
import { alerts, suppliersByAlert } from '../../data/demo';
import CrisisCard from '../../components/CrisisCard';

function StatCard({ Icon, tone, label, value }) {
  const iconTone = {
    red:   'bg-red-light text-red',
    green: 'bg-green-light text-green',
    amber: 'bg-amber-light text-amber',
  }[tone];
  const valueTone = {
    red:   'text-red',
    green: 'text-green',
    amber: 'text-amber',
  }[tone];
  return (
    <div className="bg-paper border border-line rounded-xl py-[1.1rem] px-[1.3rem] flex items-center gap-4">
      <div className={`w-10 h-10 rounded-[10px] flex-shrink-0 flex items-center justify-center ${iconTone}`}>
        <Icon size={18} />
      </div>
      <div>
        <div className="text-[0.72rem] text-muted font-semibold uppercase tracking-[0.06em]">
          {label}
        </div>
        <div className={`text-[1.55rem] font-extrabold leading-[1.1] mt-[0.1rem] ${valueTone}`}>
          {value}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [bannerOpen, setBannerOpen] = useState(true);

  return (
    <>
      <div className="mb-7">
        <h1 className="text-[1.3rem] font-extrabold text-ink">
          Bonjour Pierre, voici votre bilan du jour
        </h1>
        <p className="text-[0.83rem] text-muted mt-1">
          2 alertes détectées dans les 48 prochaines heures · Dernière mise à jour il y a 4 min
        </p>
      </div>

      {bannerOpen && (
        <div className="bg-red-light border border-red-mid rounded-[10px] py-[0.9rem] px-[1.15rem] flex items-center gap-[0.9rem] mb-7">
          <TriangleAlert size={16} className="text-red flex-shrink-0" />
          <div className="flex-1 text-[0.84rem] text-ink-soft">
            <strong className="text-red font-bold">Alerte critique :</strong>{' '}
            Vague de chaleur prévue dès demain — pic à 38 °C. Ruptures anticipées sur boissons et produits frais. Consultez les recommandations ci-dessous.
          </div>
          <button
            onClick={() => setBannerOpen(false)}
            className="text-muted cursor-pointer flex-shrink-0 w-[26px] h-[26px] flex items-center justify-center rounded-md hover:bg-red-mid transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard Icon={TriangleAlert} tone="red"   label="Alertes actives"          value="2" />
        <StatCard Icon={Store}         tone="green" label="Fournisseurs disponibles" value="7" />
        <StatCard Icon={Clock}         tone="amber" label="Délai moyen livraison"    value="J+1" />
      </div>

      <p className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-muted mb-4">
        Alertes en cours — cliquez pour trouver du stock
      </p>

      <div className="flex flex-col gap-[0.85rem]">
        {alerts.map((alert, i) => (
          <CrisisCard
            key={alert.id}
            alert={alert}
            suppliers={suppliersByAlert[alert.id]}
            defaultExpanded={i === 0}
          />
        ))}
      </div>
    </>
  );
}
