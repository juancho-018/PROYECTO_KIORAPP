import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from '../../components/auth/LoginForm';
import { authService, alertService } from '../../config/setup';
import { axe } from 'vitest-axe';

// Mock the services
vi.mock('../../config/setup', () => ({
  authService: {
    login: vi.fn(),
  },
  alertService: {
    showError: vi.fn(),
    showSuccess: vi.fn(),
  },
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the login form with basic fields', () => {
    render(<LoginForm />);
    expect(screen.getByPlaceholderText(/kiora@gmail.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/escribe tu contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('should show error when fields are empty', async () => {
    render(<LoginForm />);
    const submitBtn = screen.getByRole('button', { name: /iniciar sesión/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(alertService.showError).toHaveBeenCalledWith(expect.stringContaining('Por favor'));
    });
  });

  it('should call authService.login on valid submission', async () => {
    (authService.login as any).mockResolvedValue({ token: 'abc', usuario: { id: 1 } });
    
    render(<LoginForm />);
    
    fireEvent.change(screen.getByPlaceholderText(/kiora@gmail.com/i), { target: { value: 'test@kiora.com' } });
    fireEvent.change(screen.getByPlaceholderText(/escribe tu contraseña/i), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        correo_usu: 'test@kiora.com',
        password: 'password123'
      });
    });
  });

  it('should pass accessibility audit', async () => {
    const { container } = render(<LoginForm />);
    const results = await axe(container);
    expect(results.violations.length).toBe(0);
  });
});
