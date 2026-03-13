/**
 * PanelView maneja únicamente la lectura y mutación del DOM del Panel (SRP).
 * No contiene lógica de negocio, ni hace llamadas HTTP.
 */
export class PanelView {
  private userNameEl: HTMLElement | null;
  private manageUsersBtn: HTMLElement | null;
  private logoutBtn: HTMLElement | null;
  private usersModal: HTMLElement | null;
  private closeUsersModalBtn: HTMLElement | null;
  private usersTableBody: HTMLElement | null;
  private usersLoading: HTMLElement | null;

  constructor() {
    this.userNameEl = document.getElementById('userName');
    this.manageUsersBtn = document.getElementById('manageUsersBtn');
    this.logoutBtn = document.getElementById('logoutBtn');
    this.usersModal = document.getElementById('usersModal');
    this.closeUsersModalBtn = document.getElementById('closeUsersModal');
    this.usersTableBody = document.getElementById('usersTableBody');
    this.usersLoading = document.getElementById('usersLoading');
  }

  setUserName(name: string) {
    if (this.userNameEl) this.userNameEl.textContent = name;
  }

  showManageUsersButton() {
    if (this.manageUsersBtn) {
      this.manageUsersBtn.classList.remove('hidden');
      this.manageUsersBtn.classList.add('flex');
    }
  }

  bindLogoutEvent(handler: () => void) {
    this.logoutBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      handler();
    });
  }

  bindManageUsersEvent(handler: () => void) {
    this.manageUsersBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      handler();
      this.openModal();
    });
  }

  bindCloseModalEvent() {
    this.closeUsersModalBtn?.addEventListener('click', () => {
      this.closeModal();
    });
  }

  openModal() {
    if (this.usersModal) {
      this.usersModal.classList.remove('hidden');
      this.usersModal.classList.add('flex');
    }
  }

  closeModal() {
    if (this.usersModal) {
      this.usersModal.classList.add('hidden');
      this.usersModal.classList.remove('flex');
    }
  }

  showUsersLoading() {
    if (!this.usersTableBody) return;
    this.usersTableBody.innerHTML = '';
    
    if (this.usersLoading) {
      this.usersLoading.classList.remove('hidden');
      this.usersLoading.classList.add('flex');
    }
  }

  hideUsersLoading() {
    if (this.usersLoading) {
      this.usersLoading.classList.add('hidden');
      this.usersLoading.classList.remove('flex');
    }
  }

  renderUsersList(users: any[], onUnlock: (id: string) => void) {
    const tbody = this.usersTableBody;
    if (!tbody) return;
    
    tbody.innerHTML = '';

    users.forEach((u: any) => {
      const isBlocked = u.isBlocked; // Presumimos que el presentador inyecta un dto adecuado
      
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-gray-50/50 transition-colors group';

      const statusBadge = isBlocked
        ? `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-600 border border-red-100"><span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>Bloqueado</span>`
        : `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-100"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Activo</span>`;

      const actionBtn = isBlocked
        ? `<button data-id="${u.id_usu}" class="unlock-btn inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#1e293b] hover:bg-[#0f172a] rounded-lg transition-colors focus:ring-2 focus:ring-slate-400 focus:outline-none shadow-sm"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg> Desbloquear</button>`
        : `<span class="text-gray-400 text-xs">-</span>`;

      tr.innerHTML = `
           <td class="py-4 px-4 whitespace-nowrap"><div class="font-medium text-[#334155]">${u.nom_usu || 'Sin Nombre'}</div></td>
           <td class="py-4 px-4 whitespace-nowrap text-gray-500 text-sm">${u.correo_usu}</td>
           <td class="py-4 px-4 whitespace-nowrap">${statusBadge}</td>
           <td class="py-4 px-4 whitespace-nowrap text-right">${actionBtn}</td>
         `;
      tbody.appendChild(tr);
    });

    // Añadir event listeners para botones de desbloqueo generados dinámicamente
    document.querySelectorAll('.unlock-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLButtonElement;
        const userId = target.getAttribute('data-id');
        if (userId) onUnlock(userId);
      });
    });
  }
}
