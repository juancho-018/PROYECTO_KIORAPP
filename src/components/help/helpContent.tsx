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
    question: '¿Qué puede hacer un administrador frente a un operario?',
    answer:
      'El Administrador tiene acceso completo: gestionar productos, inventario, ventas, usuarios, proveedores, reportes y configuración. El Operario puede ver el catálogo de productos, registrar ventas, ver movimientos de inventario y generar reportes básicos. No puede crear usuarios ni modificar configuraciones del sistema.',
  },
  // ── Productos ──
  {
    question: '¿Cómo agrego un nuevo producto?',
    answer:
      'Ve al módulo de Productos y haz clic en "Nuevo Producto". Completa el nombre, precio, stock actual, stock mínimo, selecciona una categoría y opcionalmente sube una imagen. Luego haz clic en "Crear".',
  },
  {
    question: '¿Cómo ajusto el stock de un producto?',
    answer:
      'En la tarjeta del producto, haz clic en "Gestionar Stock". Se abrirá un modal donde puedes elegir entre "Entrada" (agregar stock) o "Salida" (disminuir stock). Ingresa la cantidad y confirma. El sistema mostrará el stock resultante antes de aplicar el cambio.',
  },
  {
    question: '¿Cómo busco productos? ¿Funciona si escribo mal?',
    answer:
      'La barra de búsqueda soporta búsqueda parcial (escribe parte del nombre), es insensible a mayúsculas y acentos, y tolera hasta 1 error de escritura por palabra. Además puedes usar los filtros avanzados para buscar por tipo de producto (Comida, Bebida, Dulce, Snack), subtipo y rango de precios.',
  },
  // ── Ventas ──
  {
    question: '¿Cómo registro una nueva venta?',
    answer:
      'Ve al módulo de Ventas y haz clic en "Nueva Venta". Se abrirá el carrito de compras. Busca los productos, haz clic para agregarlos al carrito, ajusta las cantidades, selecciona el método de pago y haz clic en "Realizar Cobro".',
  },
  {
    question: '¿Cómo veo el detalle de una venta?',
    answer:
      'En la tabla de ventas, haz clic sobre cualquier fila para ver el detalle completo: productos vendidos, cantidades, precio unitario, subtotal, total final, método de pago, estado y quién procesó la venta.',
  },
  {
    question: '¿Cómo exporto mis ventas?',
    answer:
      'En el módulo de Ventas, usa los botones "Excel" o "PDF" en la parte superior para descargar un reporte con todas las ventas registradas en el formato que prefieras.',
  },
  // ── Inventario ──
  {
    question: '¿Cómo agrego un proveedor?',
    answer:
      'Ve al módulo de Stock > Proveedores y haz clic en "Nuevo Proveedor". Completa el nombre (obligatorio), teléfono, correo y dirección. Luego haz clic en "Crear".',
  },
  {
    question: '¿Qué son las alertas de stock bajo?',
    answer:
      'Cuando un producto tiene un stock actual menor o igual a su stock mínimo configurado, aparecerá en la pestaña de "Alertas" del módulo de Stock con un indicador rojo. Puedes hacer clic en la alerta para ir directamente al producto y ajustar su stock.',
  },
  {
    question: '¿Dónde veo los movimientos de inventario?',
    answer:
      'Los movimientos de inventario (entradas y salidas) se encuentran en el módulo de Ventas, en la pestaña "Movimientos". Allí puedes ver el historial completo con el tipo de movimiento, el producto afectado, la cantidad y la fecha.',
  },
  // ── Mantenimiento ──
  {
    question: '¿Cómo creo un reporte de mantenimiento?',
    answer:
      'Ve al módulo de Mantenimiento y haz clic en "Nuevo Reporte". Describe el problema o la tarea de mantenimiento, asigna una prioridad y un estado. El reporte quedará registrado para su seguimiento.',
  },
  // ── Configuración ──
  {
    question: '¿Dónde encuentro los Términos y Condiciones?',
    answer:
      'En Ajustes > Legales encontrarás los Términos y Condiciones de uso y la Política de Privacidad de Kiora.',
  },
];
