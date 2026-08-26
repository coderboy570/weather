import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { UnitToggle } from './UnitToggle';

describe('UnitToggle', () => {
  it('marks the active system with aria-pressed', () => {
    render(<UnitToggle system="metric" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /celsius/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /fahrenheit/i })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onChange with the chosen system', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<UnitToggle system="metric" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: /fahrenheit/i }));
    expect(onChange).toHaveBeenCalledWith('imperial');
  });

  it('exposes a labelled group', () => {
    render(<UnitToggle system="imperial" onChange={() => {}} />);
    expect(screen.getByRole('group', { name: /temperature units/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /fahrenheit/i })).toHaveAttribute('aria-pressed', 'true');
  });
});
