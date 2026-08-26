import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchBar } from './SearchBar';
import { makePlace, makeSuggestion } from '../test/fixtures';

// Mock only the network function; keep the real ApiError class.
vi.mock('../services/weatherApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/weatherApi')>();
  return { ...actual, searchLocations: vi.fn() };
});

import { searchLocations } from '../services/weatherApi';
const mockedSearch = vi.mocked(searchLocations);

beforeEach(() => mockedSearch.mockReset());
afterEach(() => vi.clearAllMocks());

describe('SearchBar', () => {
  it('renders an accessible combobox', () => {
    render(<SearchBar onSelectPlace={() => {}} onSubmitCity={() => {}} />);
    expect(screen.getByRole('combobox', { name: /search for a city/i })).toBeInTheDocument();
  });

  it('debounces input and queries once with the typed value', async () => {
    const user = userEvent.setup();
    mockedSearch.mockResolvedValue([makeSuggestion()]);
    render(<SearchBar onSelectPlace={() => {}} onSubmitCity={() => {}} />);

    await user.type(screen.getByRole('combobox'), 'Ko');

    await waitFor(() => expect(mockedSearch).toHaveBeenCalledTimes(1));
    expect(mockedSearch).toHaveBeenCalledWith('Ko', 6, expect.any(AbortSignal));
  });

  it('shows suggestions and selects one on click', async () => {
    const user = userEvent.setup();
    const onSelectPlace = vi.fn();
    mockedSearch.mockResolvedValue([makeSuggestion()]);
    render(<SearchBar onSelectPlace={onSelectPlace} onSubmitCity={() => {}} />);

    await user.type(screen.getByRole('combobox'), 'Kol');
    const option = await screen.findByRole('option');
    expect(option).toHaveTextContent('Kolkata');

    await user.click(option);
    expect(onSelectPlace).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1275004, name: 'Kolkata', latitude: 22.5626 }),
    );
  });

  it('supports keyboard selection (ArrowDown + Enter)', async () => {
    const user = userEvent.setup();
    const onSelectPlace = vi.fn();
    mockedSearch.mockResolvedValue([makeSuggestion(), makeSuggestion({ id: 2, name: 'Kolar', latitude: 13.1, longitude: 78.1 })]);
    render(<SearchBar onSelectPlace={onSelectPlace} onSubmitCity={() => {}} />);

    await user.type(screen.getByRole('combobox'), 'Kol');
    await screen.findByRole('option', { name: /Kolkata/i });

    await user.keyboard('{ArrowDown}{Enter}');
    expect(onSelectPlace).toHaveBeenCalledWith(expect.objectContaining({ name: 'Kolkata' }));
  });

  it('falls back to a city-name submit when there are no matches', async () => {
    const user = userEvent.setup();
    const onSubmitCity = vi.fn();
    mockedSearch.mockResolvedValue([]);
    render(<SearchBar onSelectPlace={() => {}} onSubmitCity={onSubmitCity} />);

    await user.type(screen.getByRole('combobox'), 'zz');
    await screen.findByText(/no matches/i);

    await user.keyboard('{Enter}');
    expect(onSubmitCity).toHaveBeenCalledWith('zz');
  });

  it('shows recent searches on focus when the query is empty', async () => {
    const user = userEvent.setup();
    const onSelectPlace = vi.fn();
    render(
      <SearchBar
        onSelectPlace={onSelectPlace}
        onSubmitCity={() => {}}
        recents={[makePlace({ name: 'Lisbon', id: 999 })]}
      />,
    );

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByText('Recent')).toBeInTheDocument();
    const list = screen.getByRole('listbox');
    await user.click(within(list).getByRole('option', { name: /Lisbon/i }));
    expect(onSelectPlace).toHaveBeenCalledWith(expect.objectContaining({ name: 'Lisbon' }));
    expect(mockedSearch).not.toHaveBeenCalled();
  });
});
