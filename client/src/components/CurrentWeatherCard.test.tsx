import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CurrentWeatherCard } from './CurrentWeatherCard';
import { makeWeatherResponse } from '../test/fixtures';

describe('CurrentWeatherCard', () => {
  it('renders real API values in metric', () => {
    render(
      <CurrentWeatherCard data={makeWeatherResponse()} system="metric" isFavorite={false} onToggleFavorite={() => {}} />,
    );

    expect(screen.getByRole('heading', { name: /Kolkata/i })).toBeInTheDocument();
    expect(screen.getByText('30°')).toBeInTheDocument(); // 30.4°C -> 30°
    expect(screen.getByText('Partly cloudy')).toBeInTheDocument();
    expect(screen.getByText(/Feels like 36°C/)).toBeInTheDocument(); // 36.1 -> 36
    // Today's high/low from daily[0] (27.2 / 32.6).
    expect(screen.getByText(/H: 33°/)).toBeInTheDocument();
    expect(screen.getByText(/L: 27°/)).toBeInTheDocument();
  });

  it('converts to imperial without re-fetching (display-only)', () => {
    render(
      <CurrentWeatherCard data={makeWeatherResponse()} system="imperial" isFavorite={false} onToggleFavorite={() => {}} />,
    );
    expect(screen.getByText('87°')).toBeInTheDocument(); // 30.4°C -> 86.72 -> 87
    expect(screen.getByText(/Feels like 97°F/)).toBeInTheDocument(); // 36.1°C -> 96.98 -> 97
  });

  it('shows the provider timestamp as the location wall-clock, not the viewer timezone', () => {
    // current.time is "2026-08-25T13:00" local -> always "1:00 PM" regardless of TZ.
    render(
      <CurrentWeatherCard data={makeWeatherResponse()} system="metric" isFavorite={false} onToggleFavorite={() => {}} />,
    );
    expect(screen.getByText(/Updated 1:00 PM local time/)).toBeInTheDocument();
  });

  it('reflects favorite state and toggles it', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const { rerender } = render(
      <CurrentWeatherCard data={makeWeatherResponse()} system="metric" isFavorite={false} onToggleFavorite={onToggle} />,
    );

    const btn = screen.getByRole('button', { name: /add to favorites/i });
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    await user.click(btn);
    expect(onToggle).toHaveBeenCalledTimes(1);

    rerender(
      <CurrentWeatherCard data={makeWeatherResponse()} system="metric" isFavorite onToggleFavorite={onToggle} />,
    );
    expect(screen.getByRole('button', { name: /remove from favorites/i })).toHaveAttribute('aria-pressed', 'true');
  });
});
