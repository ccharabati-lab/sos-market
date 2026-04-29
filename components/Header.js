export default function Header() {
  return (
    <header className="bg-paper border-b border-line px-8 h-[60px] flex items-center justify-between sticky top-0 z-40">
      <div className="flex flex-col gap-[0.1rem]">
        <div className="font-bold text-[0.95rem] text-ink">
          Intermarché — Gif-sur-Yvette
        </div>
        <div className="text-[0.74rem] text-muted">
          Gérant : Pierre Martin · 3 rue de la Vallée, 91190
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="inline-flex items-center gap-[0.4rem] bg-green-light text-green text-[0.72rem] font-bold py-1 px-[0.7rem] rounded-full border border-green-mid">
          <span className="w-1.5 h-1.5 rounded-full bg-green-bright animate-blink" />
          Surveillance active
        </span>
        <span className="text-[0.78rem] text-muted font-medium">
          Mercredi 16 avril 2025
        </span>
      </div>
    </header>
  );
}
