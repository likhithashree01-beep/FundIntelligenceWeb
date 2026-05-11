import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../api/client';
import { LoginPage } from './LoginPage';

const mockLogin = vi.fn();

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );

describe('LoginPage', () => {
  beforeEach(() => {
    mockLogin.mockReset();
  });

  it('pre-fills demo email and password', () => {
    renderPage();
    expect(screen.getByLabelText('Email')).toHaveValue('demo@nordic.io');
    expect(screen.getByLabelText('Password')).toHaveValue('demo123');
  });

  it('calls login with the entered credentials on submit', async () => {
    mockLogin.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('demo@nordic.io', 'demo123');
    });
  });

  it('shows a friendly message on 401 error', async () => {
    mockLogin.mockRejectedValue(new ApiError(401, 'Unauthorized'));
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password.');
    });
  });

  it('shows a network error message when the API is unreachable', async () => {
    mockLogin.mockRejectedValue(new Error('Failed to fetch'));
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Network error');
    });
  });

  it('disables the submit button while signing in', async () => {
    mockLogin.mockImplementation(() => new Promise(() => {})); // never resolves
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
  });
});
