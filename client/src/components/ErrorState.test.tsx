import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ErrorState } from './ErrorState';
import { ApiError } from '../services/weatherApi';

describe('ErrorState', () => {
  it('shows the friendly message and a retry button for a network error', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorState error={new ApiError('NETWORK', "Can't reach the weather service.", 0)} onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent("Can't reach the weather service.");
    const retry = screen.getByRole('button', { name: /try again/i });
    await user.click(retry);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('special-cases "location not found" and hides retry', () => {
    render(
      <ErrorState
        error={new ApiError('LOCATION_NOT_FOUND', 'No matching location.', 404)}
        onRetry={() => {}}
      />,
    );
    expect(screen.getByText(/couldn.t find that place/i)).toBeInTheDocument();
    expect(screen.getByText('No matching location.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
  });

  it('shows a generic message for a non-API error', () => {
    render(<ErrorState error={new Error('boom')} />);
    expect(screen.getByRole('alert')).toHaveTextContent(/something went wrong/i);
  });
});
