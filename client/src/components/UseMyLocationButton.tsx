import { Loader2, LocateFixed } from 'lucide-react';

interface UseMyLocationButtonProps {
  onLocate: () => void;
  loading?: boolean;
  className?: string;
}

export function UseMyLocationButton({ onLocate, loading = false, className }: UseMyLocationButtonProps) {
  return (
    <button
      type="button"
      onClick={onLocate}
      disabled={loading}
      className={
        'inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/60 px-4 py-2.5 text-sm font-semibold text-slate-700 backdrop-blur transition-colors hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/10 dark:bg-white/[0.07] dark:text-slate-200 dark:hover:bg-white/[0.14] ' +
        (className ?? '')
      }
      aria-label="Use my current location"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <LocateFixed className="h-4 w-4" aria-hidden="true" />
      )}
      <span>{loading ? 'Locating…' : 'Use my location'}</span>
    </button>
  );
}
