import { Clock } from 'lucide-react';
import { placeKey } from '../lib/places';
import { countryCodeToFlag } from '../lib/format';
import { cn } from '../lib/cn';
import type { SavedPlace } from '../types/weather';

interface RecentSearchesProps {
  recents: SavedPlace[];
  activeKey?: string;
  onSelect: (place: SavedPlace) => void;
  onClear: () => void;
}

export function RecentSearches({ recents, activeKey, onSelect, onClear }: RecentSearchesProps) {
  if (recents.length === 0) return null;

  return (
    <section aria-label="Recent searches">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          Recent
        </h2>
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-medium text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-slate-200"
        >
          Clear
        </button>
      </div>
      <ul className="flex flex-wrap gap-2">
        {recents.map((place) => {
          const key = placeKey(place);
          const active = key === activeKey;
          const flag = countryCodeToFlag(place.countryCode);
          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => onSelect(place)}
                className={cn(
                  'chip',
                  active && 'border-sky-400/70 bg-sky-500/15 dark:border-sky-300/40 dark:bg-sky-400/15',
                )}
                aria-label={`Show weather for ${place.name}`}
                aria-current={active ? 'true' : undefined}
              >
                {flag && <span aria-hidden="true">{flag}</span>}
                <span>{place.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
