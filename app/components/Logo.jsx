export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-7 w-7 rounded-full border-2 border-neutral-800 bg-white">
        <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-warm" />
        <div className="absolute left-1/2 top-[4px] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-emerald-400" />
      </div>
      <span className="text-lg font-semibold tracking-tight">Polymath Mini</span>
    </div>
  );
}
