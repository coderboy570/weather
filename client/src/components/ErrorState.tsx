import { CloudOff, RefreshCw, SearchX } from 'lucide-react';
import { ApiError } from '../services/weatherApi';

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
}

/** Turns any thrown error into a calm, human-readable message — never a raw API error. */
export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const code = error instanceof ApiError ? error.code : 'UNKNOWN';
  const notFound = code === 'LOCATION_NOT_FOUND';

  const message =
    error instanceof ApiError
      ? error.message
      : 'Something went wrong while loading the weather. Please try again.';

  const Icon = notFound ? SearchX : CloudOff;
  const title = notFound ? "We couldn't find that place" : "We couldn't load the weather";

  return (
    <div role="alert" className="glass animate-fade-up p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </div>
      <h2 className="mt-4 font-display text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-600 dark:text-slate-300">{message}</p>
      {onRetry && !notFound && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03] active:scale-95 dark:bg-white dark:text-slate-900"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
      )}
    </div>
  );
}
