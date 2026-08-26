import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('invites a search and offers example cities', async () => {
    const user = userEvent.setup();
    const onExample = vi.fn();
    render(<EmptyState onExample={onExample} onUseLocation={() => {}} geoAvailable={false} />);

    expect(screen.getByRole('heading', { name: /search for any place/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'London' }));
    expect(onExample).toHaveBeenCalledWith('London');
  });

  it('shows the "use my location" button only when geolocation is available', async () => {
    const user = userEvent.setup();
    const onUseLocation = vi.fn();
    const { rerender } = render(
      <EmptyState onExample={() => {}} onUseLocation={onUseLocation} geoAvailable={false} />,
    );
    expect(screen.queryByRole('button', { name: /use my location/i })).not.toBeInTheDocument();

    rerender(<EmptyState onExample={() => {}} onUseLocation={onUseLocation} geoAvailable={true} />);
    const btn = screen.getByRole('button', { name: /use my location/i });
    await user.click(btn);
    expect(onUseLocation).toHaveBeenCalledTimes(1);
  });
});
