import { useEffect, useId, useRef, useState } from 'react';
import { Clock, Loader2, MapPin, Search, X } from 'lucide-react';
import { useLocationSearch } from '../hooks/useLocationSearch';
import { suggestionToPlace } from '../lib/places';
import { countryCodeToFlag } from '../lib/format';
import { cn } from '../lib/cn';
import type { LocationSuggestion, SavedPlace } from '../types/weather';

interface SearchBarProps {
  onSelectPlace: (place: SavedPlace) => void;
  onSubmitCity: (city: string) => void;
  recents?: SavedPlace[];
  autoFocus?: boolean;
}

interface Item {
  place: SavedPlace;
  primary: string;
  secondary: string;
  flag: string;
  isRecent: boolean;
}

function suggestionSecondary(s: LocationSuggestion): string {
  return [s.admin1, s.country].filter(Boolean).join(', ');
}

function placeSecondary(p: SavedPlace): string {
  return [p.admin1, p.country].filter(Boolean).join(', ');
}

export function SearchBar({ onSelectPlace, onSubmitCity, recents = [], autoFocus }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const { results, loading, error, hasQuery } = useLocationSearch(query);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);
  const listboxId = useId();

  const items: Item[] = hasQuery
    ? results.map((s) => ({
        place: suggestionToPlace(s),
        primary: s.name,
        secondary: suggestionSecondary(s),
        flag: countryCodeToFlag(s.countryCode),
        isRecent: false,
      }))
    : recents.map((p) => ({
        place: p,
        primary: p.name,
        secondary: placeSecondary(p),
        flag: countryCodeToFlag(p.countryCode),
        isRecent: true,
      }));

  const showList = open && (hasQuery || items.length > 0);

  // Reset the highlighted option whenever the query changes.
  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  // Keep the active option scrolled into view.
  useEffect(() => {
    if (activeIndex >= 0) optionRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  function choose(item: Item) {
    setQuery('');
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
    onSelectPlace(item.place);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setActiveIndex((i) => (items.length === 0 ? -1 : Math.min(i + 1, items.length - 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && items[activeIndex]) {
        choose(items[activeIndex]);
      } else if (hasQuery && items.length > 0) {
        choose(items[0]);
      } else if (query.trim().length > 0) {
        setOpen(false);
        onSubmitCity(query.trim());
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLDivElement>) {
    if (!rootRef.current?.contains(e.relatedTarget as Node | null)) {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div ref={rootRef} className="relative w-full" onFocus={() => setOpen(true)} onBlur={handleBlur}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined}
          aria-label="Search for a city"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          autoFocus={autoFocus}
          value={query}
          placeholder="Search for a city…"
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-14 w-full rounded-2xl border border-white/50 bg-white/70 pl-12 pr-24 text-base text-slate-900 shadow-glass backdrop-blur-xl outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-2 focus:ring-sky-400/60 dark:border-white/10 dark:bg-white/[0.08] dark:text-white dark:placeholder:text-slate-500"
        />
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {loading && <Loader2 className="h-5 w-5 animate-spin text-slate-400" aria-hidden="true" />}
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setActiveIndex(-1);
                inputRef.current?.focus();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-black/5 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-200"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {showList && (
        <div className="glass absolute z-30 mt-2 w-full overflow-hidden p-1.5 animate-fade-in">
          {!hasQuery && items.length > 0 && (
            <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Recent
            </p>
          )}

          <ul id={listboxId} role="listbox" aria-label="Location suggestions" className="max-h-80 overflow-y-auto">
            {items.map((item, index) => (
              <li
                key={`${item.place.latitude},${item.place.longitude},${index}`}
                id={`${listboxId}-opt-${index}`}
                ref={(el) => (optionRefs.current[index] = el)}
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(item)}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors',
                  index === activeIndex ? 'bg-sky-500/15 dark:bg-sky-400/15' : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.06]',
                )}
              >
                {item.isRecent ? (
                  <Clock className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                ) : (
                  <MapPin className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-slate-900 dark:text-white">
                    {item.primary}
                  </span>
                  {item.secondary && (
                    <span className="block truncate text-sm text-slate-500 dark:text-slate-400">
                      {item.secondary}
                    </span>
                  )}
                </span>
                {item.flag && (
                  <span className="text-lg leading-none" aria-hidden="true">
                    {item.flag}
                  </span>
                )}
              </li>
            ))}
          </ul>

          {hasQuery && !loading && !error && items.length === 0 && (
            <p className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400">
              No matches. Try a different spelling or add a country, e.g. “Paris, US”.
            </p>
          )}
          {hasQuery && error && (
            <p className="px-3 py-3 text-sm text-rose-600 dark:text-rose-400" role="alert">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
