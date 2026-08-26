import { hasSunGlow, sceneGradient } from '../lib/scenes';
import type { WeatherIconKey } from '../types/weather';

interface AppBackgroundProps {
  icon?: WeatherIconKey;
  isDay?: boolean;
  isDark: boolean;
}

/**
 * Full-viewport atmospheric layer behind all content. The gradient is tinted by
 * the current weather and theme; a single soft accent glow is the one flourish
 * (shown only for clear skies), keeping the effect subtle and legible.
 */
export function AppBackground({ icon = 'clear', isDay = true, isDark }: AppBackgroundProps) {
  const gradient = sceneGradient(icon, isDay, isDark);
  const showGlow = hasSunGlow(icon, isDay);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden transition-[background-image] duration-700"
      style={{ backgroundImage: gradient }}
    >
      {showGlow && (
        <div
          className={
            isDark
              ? 'absolute -right-32 -top-40 h-[28rem] w-[28rem] rounded-full bg-sky-500/20 blur-3xl'
              : 'absolute -right-32 -top-40 h-[28rem] w-[28rem] rounded-full bg-amber-200/60 blur-3xl'
          }
        />
      )}
      <div
        className={
          isDark
            ? 'absolute -bottom-40 -left-32 h-[26rem] w-[26rem] rounded-full bg-indigo-500/10 blur-3xl'
            : 'absolute -bottom-40 -left-32 h-[26rem] w-[26rem] rounded-full bg-sky-200/50 blur-3xl'
        }
      />
    </div>
  );
}
