import { cn } from '../lib/cn';
import type { UnitSystem } from '../types/weather';

interface UnitToggleProps {
  system: UnitSystem;
  onChange: (system: UnitSystem) => void;
}

const OPTIONS: { value: UnitSystem; label: string; aria: string }[] = [
  { value: 'metric', label: '°C', aria: 'Celsius' },
  { value: 'imperial', label: '°F', aria: 'Fahrenheit' },
];

/** Segmented °C / °F control. Changing units never re-fetches — it's display only. */
export function UnitToggle({ system, onChange }: UnitToggleProps) {
  return (
    <div
      role="group"
      aria-label="Temperature units"
      className="inline-flex items-center rounded-full border border-white/50 bg-white/60 p-1 backdrop-blur dark:border-white/10 dark:bg-white/[0.07]"
    >
      {OPTIONS.map((opt) => {
        const active = system === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            aria-label={`Show temperatures in ${opt.aria}`}
            className={cn(
              'min-w-[2.75rem] rounded-full px-3 py-1.5 text-sm font-semibold transition-colors',
              active
                ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
