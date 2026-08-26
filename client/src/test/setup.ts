import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Ensure the DOM is torn down between tests.
afterEach(() => {
  cleanup();
});

// jsdom doesn't implement matchMedia; provide a minimal stub so components that
// read the theme preference (and any reduced-motion checks) don't crash.
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

// jsdom doesn't implement scrollTo/scrollBy used by the hourly scroller, nor
// scrollIntoView used to keep the active search suggestion visible.
if (!Element.prototype.scrollBy) {
  Element.prototype.scrollBy = vi.fn();
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn();
}
