import { stockStatus, networkSignals } from '../../data/demo';
import StockStatusCard from '../../components/StockStatusCard';
import NetworkFeed from '../../components/NetworkFeed';
import NetworkMap from '../../components/NetworkMap';

export default function DailyPage() {
  return (
    <>
      <div className="mb-7">
        <h1 className="text-[1.3rem] font-extrabold text-ink">
          Gestion des stocks quotidienne
        </h1>
        <p className="text-[0.83rem] text-muted mt-1">
          5 opportunités d&apos;échange identifiées dans votre réseau · Mis à jour il y a 12 min
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-8">
        <StockStatusCard items={stockStatus} />
        <NetworkFeed signals={networkSignals} />
      </div>

      <NetworkMap signals={networkSignals} />
    </>
  );
}
