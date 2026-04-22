import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HelpCenter from '../components/help/HelpCenter';

describe('HelpCenter - back button navigation', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('calls window.history.back() when history exists', async () => {
    const backSpy = vi.spyOn(window.history, 'back').mockImplementation(() => {});
    Object.defineProperty(window.history, 'length', { value: 3, configurable: true });

    render(<HelpCenter />);
    await userEvent.click(screen.getByRole('button', { name: /volver/i }));

    expect(backSpy).toHaveBeenCalledTimes(1);
  });

  it('redirects to /login when no history exists', async () => {
    Object.defineProperty(window.history, 'length', { value: 1, configurable: true });

    const locationSpy = vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      href: '',
    });
    const mockLocation = { href: '' };
    locationSpy.mockReturnValue(mockLocation);

    render(<HelpCenter />);
    await userEvent.click(screen.getByRole('button', { name: /volver/i }));

    expect(mockLocation.href).toBe('/login');
  });
});
