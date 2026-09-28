export function Stat({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string | number;
  className?: string;
}): React.ReactElement {
  return (
    <div className="rounded-md border border-zinc-200 bg-white py-1 sm:py-2">
      <div className={`text-base sm:text-lg ${className}`}>{value}</div>
      <div className="text-[10px] text-zinc-400 sm:text-xs">{label}</div>
    </div>
  );
}
