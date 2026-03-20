/** Etiquetas para pestañas del panel (i18n futuro: mover a módulo de traducciones). */
export const PANEL_TAB_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  inventario: 'Inventario',
  pedidos: 'Pedidos',
  reportes: 'Reportes',
  ajustes: 'Ajustes',
};

/** Pestañas con UI implementada; el resto se muestra como «próximamente». */
export function isPanelTabAvailable(tabId: string): boolean {
  return tabId === 'ajustes';
}
