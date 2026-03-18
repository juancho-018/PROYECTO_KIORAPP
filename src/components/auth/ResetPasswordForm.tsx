import { useState, useEffect } from 'react';
import { httpClient, alertService } from '../../config/setup';
import Loading from '../cargando';

export default function ResetPasswordForm() {
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Extraer el token de la URL: ?token=XYZ
    const searchParams = new URLSearchParams(window.location.search);
    const urlToken = searchParams.get('token');
    
    if (urlToken) {
      setToken(urlToken);
    } else {
      alertService.showError(
        'Token inválido',
        'No hay un token de recuperación válido en la URL.'
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      alertService.showError('Error', 'Token ausente en la URL');
      return;
    }

    if (newPassword !== confirmPassword) {
      alertService.showError('Error', 'Las contraseñas no coinciden, por favor verifica.');
      return;
    }

    if (newPassword.length < 6) {
      alertService.showError('Error', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await httpClient.post<{ message?: string }>('/auth/reset-password', {
        token,
        new_password: newPassword,
      });

      if (!response.ok) {
        throw new Error(response.error || 'Error al restablecer contraseña');
      }

      await alertService.showSuccess(
        '¡Éxito!',
        response.data?.message || 'Tu contraseña ha sido restablecida exitosamente.'
      );

      // Redirigir al inicio de sesión luego del éxito
      window.location.href = '/login';
    } catch (error: unknown) {
      const err = error as Error;
      alertService.showError('Error', err.message || 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-105 p-8 rounded-xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)]"
      >
        <div className="mb-5">
          <label
            htmlFor="newPassword"
            className="block font-semibold text-[0.85rem] text-[#374151] mb-2"
          >
            Nueva contraseña
          </label>
          <div className="relative flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden transition-all duration-200 focus-within:border-[#9ca3af] focus-within:ring-[3px] focus-within:ring-gray-400/10">
            <div className="pl-3.5 pr-2 text-gray-400 flex items-center">
              <svg fill="none" className="w-5 h-5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <input
              type="password"
              id="newPassword"
              className="flex-1 border-none bg-transparent py-2.5 text-[0.95rem] text-[#334155] outline-none w-full placeholder-gray-400"
              placeholder="Escribe tu nueva contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={!token || isLoading}
            />
          </div>
        </div>

        <div className="mb-6">
          <label
            htmlFor="confirmPassword"
            className="block font-semibold text-[0.85rem] text-[#374151] mb-2"
          >
            Confirmar contraseña
          </label>
          <div className="relative flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden transition-all duration-200 focus-within:border-[#9ca3af] focus-within:ring-[3px] focus-within:ring-gray-400/10">
            <div className="pl-3.5 pr-2 text-gray-400 flex items-center">
              <svg fill="none" className="w-5 h-5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <input
              type="password"
              id="confirmPassword"
              className="flex-1 border-none bg-transparent py-2.5 text-[0.95rem] text-[#334155] outline-none w-full placeholder-gray-400"
              placeholder="Vuelve a escribir la contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={!token || isLoading}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!token || isLoading}
          className="w-full bg-[#ec131e] hover:bg-[#d0111a] text-white border-none rounded-lg py-2.5 text-[1rem] font-semibold cursor-pointer transition-colors duration-200 shadow-[0_2px_4px_rgba(237,19,30,0.15)] disabled:opacity-70 disabled:cursor-not-allowed mb-4"
        >
          {isLoading ? 'Guardando...' : 'Restablecer contraseña'}
        </button>

        <div className="text-center">
          <a
            href="/login"
            className="text-[0.85rem] text-[#64748b] hover:text-[#ec131e] font-medium transition-colors"
          >
            Volver a iniciar sesión
          </a>
        </div>
      </form>

      {/* Loading Overlay */}
      {isLoading && (
        <div>
          <Loading message="Procesando..." />
        </div>
      )}
    </>
  );
}
