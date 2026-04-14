import React from 'react';

export const HELP_TOPICS: { title: string; icon: React.ReactNode }[] = [
  {
    title: 'Inicio de sesión y cuenta',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    title: 'Usuarios y roles (administrador)',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
      </svg>
    ),
  },
  {
    title: 'Panel y sesión',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
      </svg>
    ),
  },
  {
    title: 'Próximos módulos (roadmap)',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 3.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM2 10a8 8 0 1116 0 8 8 0 01-16 0z" />
      </svg>
    ),
  },
];

export const HELP_FAQS = [
  {
    question: '¿Cómo inicio sesión en Kiora?',
    answer:
      'Usa el correo y la contraseña que te asignó un administrador. Si no tienes cuenta, pide a un administrador que cree un usuario con tu correo.',
  },
  {
    question: '¿Qué hago si olvidé mi contraseña?',
    answer:
      'En la pantalla de inicio de sesión elige «¿Olvidaste tu contraseña?», ingresa tu correo y revisa tu bandeja (y spam) para el enlace de restablecimiento.',
  },
  {
    question: '¿Qué diferencia hay entre Admin y Vendedor?',
    answer:
      'Los Administradores tienen acceso total a la gestión de usuarios, auditoría de salud del sistema y facturación histórica. Los Vendedores solo pueden gestionar el stock y realizar pedidos.',
  },
  {
    question: '¿Cómo descargo una factura?',
    answer:
      'En la sección de «Pedidos», ve a la pestaña de «Facturación Histórica» y haz clic en el botón «Descargar PDF» de la factura deseada.',
  },
  {
    question: '¿Para qué sirve el monitor de Salud?',
    answer:
      'Permite verificar en tiempo real si todos los microservicios (Usuarios, Productos, Inventario, Órdenes) están en línea y respondiendo correctamente.',
  },
];
