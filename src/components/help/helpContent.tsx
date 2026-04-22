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
    title: 'Gestión de productos y stock',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 2L3 7v11h14V7l-7-5zm0 2.236L15 8v9H5V8l5-3.764z" />
      </svg>
    ),
  },
  {
    title: 'Ventas y facturación',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    title: 'Usuarios y roles (Admin)',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
      </svg>
    ),
  },
  {
    title: 'Inventario y proveedores',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
      </svg>
    ),
  },
  {
    title: 'Reportes y mantenimiento',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
      </svg>
    ),
  },
];

export const HELP_FAQS = [
  // ── Inicio de sesión ──
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
  // ── Roles ──
  {
    question: '¿Qué diferencia hay entre Admin y Vendedor?',
    answer:
      'Los Administradores tienen acceso total a la gestión de usuarios, auditoría de salud del sistema y facturación histórica. Los Vendedores solo pueden gestionar el stock y realizar pedidos.',
  },
  // ── Mantenimiento ──
  {
    question: '¿Cómo descargo una factura?',
    answer:
      'En la sección de «Pedidos», ve a la pestaña de «Facturación Histórica» y haz clic en el botón «Descargar PDF» de la factura deseada.',
  },
  // ── Configuración ──
  {
    question: '¿Para qué sirve el monitor de Salud?',
    answer:
      'Permite verificar en tiempo real si todos los microservicios (Usuarios, Productos, Inventario, Órdenes) están en línea y respondiendo correctamente.',
  },
];
