import { Star, X } from 'lucide-react';
import { placeKey } from '../lib/places';
import { countryCodeToFlag } from '../lib/format';
import { cn } from '../lib/cn';
import type { SavedPlace } from '../types/weather';

interface FavoritesBarProps {
  favorites: SavedPlace[];
  activeKey?: string;
  onSelect: (place: SavedPlace) => void;
  onRemove: (place: SavedPlace) => void;
}

export function FavoritesBar({ favorites, activeKey, onSelect, onRemove }: FavoritesBarProps) {
  if (favorites.length === 0) return null;

  return (
    <section aria-label="Favorite places">
      <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
        Favorites
      </h2>
      <ul className="flex flex-wrap gap-2">
        {favorites.map((place) => {
          const key = placeKey(place);
          const active = key === activeKey;
          const flag = countryCodeToFlag(place.countryCode);
          return (
            <li key={key}>
              <span
                className={cn(
                  'chip group pr-1.5',
                  active && 'border-sky-400/70 bg-sky-500/15 dark:border-sky-300/40 dark:bg-sky-400/15',
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelect(place)}
                  className="flex items-center gap-1.5"
                  aria-label={`Show weather for ${place.name}`}
                  aria-current={active ? 'true' : undefined}
                >
                  {flag && <span aria-hidden="true">{flag}</span>}
                  <span>{place.name}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(place)}
                  className="ml-1 flex h-5 w-5 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-black/10 hover:text-slate-700 dark:hover:bg-white/15 dark:hover:text-slate-100"
                  aria-label={`Remove ${place.name} from favorites`}
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
