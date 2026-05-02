import { BarChart2 } from 'lucide-react';

export default function ReportsPage() {
  return (
    <>
      <div className="mb-7">
        <h1 className="text-[1.3rem] font-extrabold text-ink">Rapports</h1>
        <p className="text-[0.83rem] text-muted mt-1">
          Synthèses hebdomadaires et indicateurs de performance de votre réseau.
        </p>
      </div>

      <div className="bg-paper border border-line rounded-xl p-10 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-xl bg-amber-light text-amber flex items-center justify-center mb-4">
          <BarChart2 size={22} />
        </div>
        <h2 className="text-[1rem] font-bold text-ink mb-1">Bientôt disponible</h2>
        <p className="text-[0.84rem] text-muted max-w-md">
          Les rapports d&apos;activité seront générés à partir de vos échanges réseau dès que
          suffisamment de données auront été collectées.
        </p>
      </div>
    </>
  );
}
