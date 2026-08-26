import { MapPin, Search } from 'lucide-react';

const EXAMPLES = ['London', 'New York', 'Tokyo', 'Paris', 'Sydney', 'Cape Town'];

interface EmptyStateProps {
  onExample: (city: string) => void;
  onUseLocation: () => void;
  geoAvailable: boolean;
}

/** Inviting first-run screen shown before any place is selected. */
export function EmptyState({ onExample, onUseLocation, geoAvailable }: EmptyStateProps) {
  return (
    <div className="glass animate-fade-up p-8 text-center sm:p-12">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-600 dark:bg-sky-400/15 dark:text-sky-300">
        <Search className="h-8 w-8" aria-hidden="true" strokeWidth={1.75} />
      </div>
      <h2 className="mt-5 font-display text-2xl font-semibold text-slate-900 dark:text-white">
        Search for any place on Earth
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-slate-300">
        Get current conditions, an hourly outlook, and a 7-day forecast — with times shown in each
        location&rsquo;s own time zone.
      </p>

      {geoAvailable && (
        <button
          type="button"
          onClick={onUseLocation}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03] active:scale-95 dark:bg-white dark:text-slate-900"
        >
          <MapPin className="h-4 w-4" aria-hidden="true" />
          Use my location
        </button>
      )}

      <div className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Try one of these
        </p>
        <ul className="mt-3 flex flex-wrap justify-center gap-2">
          {EXAMPLES.map((city) => (
            <li key={city}>
              <button type="button" onClick={() => onExample(city)} className="chip">
                {city}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
