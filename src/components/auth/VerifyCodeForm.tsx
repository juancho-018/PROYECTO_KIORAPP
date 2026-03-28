import { useState, useEffect } from 'react';
import { httpClient, alertService } from '../../config/setup';
import Loading from '../cargando';

export default function VerifyCodeForm() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlEmail = searchParams.get('email');
    if (urlEmail) {
      setEmail(urlEmail);
    } else {
      alertService.showError('Error', 'Falta el correo electrónico para la verificación.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !code) return;

    setIsLoading(true);

    try {
      const response = await httpClient.post<{ message?: string }>('/auth/verify-reset-code', {
        correo_usu: email,
        code: code,
      });

      if (!response.ok) {
        throw new Error(response.error || 'Código inválido o expirado');
      }

      // Redirigir a la página de restablecimiento final
      window.location.href = `/reset-password?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`;
    } catch (error: unknown) {
      const err = error as Error;
      alertService.showError('Error', err.message || 'Error al verificar el código');
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
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-[#1e293b] mb-2">Verificación de Código</h2>
          <p className="text-[0.95rem] text-[#64748b]">Ingresa el código de 6 dígitos enviado a <strong>{email}</strong></p>
        </div>

        <div className="mb-7">
          <label
            htmlFor="code"
            className="block font-semibold text-[0.85rem] text-[#374151] mb-2"
          >
            Código de verificación
          </label>
          <div className="relative flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden transition-all duration-200 focus-within:border-[#9ca3af] focus-within:ring-[3px] focus-within:ring-gray-400/10">
            <div className="pl-3.5 pr-2 text-gray-400 flex items-center">
              <svg fill="none" className="w-5 h-5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <input
              type="text"
              id="code"
              className="flex-1 border-none bg-transparent py-2.5 text-[0.95rem] text-[#334155] outline-none w-full placeholder-gray-400 text-center tracking-[0.5em] font-bold"
              placeholder="000000"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#ec131e] hover:bg-[#d0111a] text-white border-none rounded-lg py-2.5 text-[1rem] font-semibold cursor-pointer transition-colors duration-200 shadow-[0_2px_4px_rgba(237,19,30,0.15)] disabled:opacity-70 disabled:cursor-not-allowed mb-4"
        >
          {isLoading ? 'Verificando...' : 'Verificar Código'}
        </button>

        <div className="text-center">
          <a href="/recuperar-contrasena" className="inline-flex items-center gap-1 text-[#64748b] hover:text-[#334155] font-medium text-[0.9rem] no-underline transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a intentar
          </a>
        </div>
      </form>

      {isLoading && (
        <div>
          <Loading message="Verificando código..." />
        </div>
      )}
    </>
  );
}
