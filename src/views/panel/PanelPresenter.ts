import { type PanelView } from './PanelView';
import { type AuthService } from '../../services/AuthService';
import { type UserService } from '../../services/UserService';
import { type SessionManager } from '../../services/SessionManager';
import { type IAlertService } from '../../core/ui/AlertService';

/**
 * PanelPresenter actúa como el coordinador entre la Vista (DOM) y el Dominio (Services) cumpliendo SRP.
 */
export class PanelPresenter {
  constructor(
    private view: PanelView,
    private authService: AuthService,
    private userService: UserService,
    private sessionManager: SessionManager,
    private alertService: IAlertService
  ) {}

  initialize() {
    if (!this.authService.isAuthenticated()) {
      window.location.href = '/login';
      return;
    }

    this.sessionManager.startMonitoring();
    this.loadUserInfo();
    this.bindEvents();
  }

  private loadUserInfo() {
    const user = this.authService.getUser();
    if (user) {
      this.view.setUserName(user.nom_usu || user.correo_usu);
      if (user.rol_usu === 'admin') {
        this.view.showManageUsersButton();
      }
    }
  }

  private bindEvents() {
    this.view.bindLogoutEvent(() => this.handleLogout());
    this.view.bindManageUsersEvent(() => this.handleManageUsersClick());
    this.view.bindCloseModalEvent();
  }

  private async handleLogout() {
    const confirmed = await this.alertService.showConfirm(
      '¿Estás seguro?',
      '¿Deseas cerrar tu sesión actual?',
      'Sí, cerrar sesión',
      'Cancelar'
    );

    if (confirmed) {
      this.sessionManager.stopMonitoring();
      this.authService.logout();
    }
  }

  private async handleManageUsersClick() {
    await this.fetchAndRenderUsers();
  }

  private async fetchAndRenderUsers() {
    this.view.showUsersLoading();

    try {
      const rawUsers = await this.userService.fetchUsers();
      
      // Transform data for view
      const displayUsers = rawUsers.map(u => ({
        ...u,
        isBlocked: this.userService.isUserBlocked(u)
      }));

      this.view.hideUsersLoading();
      this.view.renderUsersList(displayUsers, (id) => this.handleUnlockUser(id));
      
    } catch (error) {
      this.view.hideUsersLoading();
      this.alertService.showToast('error', 'Error al cargar usuarios');
    }
  }

  private async handleUnlockUser(id: string) {
    try {
      await this.userService.unlockUser(id);
      this.alertService.showToast('success', 'Cuenta desbloqueada');
      await this.fetchAndRenderUsers(); // Refresh list automatically
    } catch (e) {
      this.alertService.showToast('error', 'Restringido: Sólo Admins');
    }
  }
}
