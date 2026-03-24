/** Etiquetas para pestañas del panel (i18n futuro: mover a módulo de traducciones). */
export const PANEL_TAB_LABELS: Record<string, string> = {
  dashboard: 'Inicio',
  inventario: 'Stock',
  pedidos: 'Pedidos',
  usuarios: 'Usuarios',
  ajustes: 'Ajustes',
};

/** Pestañas con UI implementada; el resto se muestra como «próximamente». */
export function isPanelTabAvailable(tabId: string): boolean {
  const implemented = ['dashboard', 'inventario', 'pedidos', 'usuarios', 'ajustes'];
  return implemented.includes(tabId);
}
