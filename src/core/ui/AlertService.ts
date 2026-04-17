/**
 * Interface that abstracts the UI alert mechanism (DIP).
 */
export interface IAlertService {
  showSuccess(title: string, text?: string): void;
  showError(title: string, text?: string): void;
  showInfo(title: string, text?: string): void;
  showWarning(title: string, text?: string): void;
  showToast(icon: 'success'|'error'|'warning'|'info', title: string, timer?: number): void;
  showConfirm(title: string, text: string, confirmText: string, cancelText: string): Promise<boolean>;
  showExpiringSession(title: string, text: string): Promise<void>;
}

import Swal from 'sweetalert2';
import type { NotificationService } from '../../services/NotificationService';

/**
 * Concrete implementation of IAlertService using SweetAlert2 (SRP).
 */
export class SweetAlertService implements IAlertService {
  constructor(private notificationService?: NotificationService) {}

  private logNotification(type: 'success' | 'info' | 'warning' | 'error', title: string) {
    if (this.notificationService) {
      this.notificationService.addNotification({
        title,
        description: `Se recibió una alerta de tipo ${type}`,
        type
      });
    }
  }

  showSuccess(title: string, text = '') {
    this.logNotification('success', title);
    Swal.fire({ icon: 'success', title, text, confirmButtonColor: '#ec131e' });
  }

  showError(title: string, text = '') {
    this.logNotification('error', title);
    Swal.fire({ icon: 'error', title, text, confirmButtonColor: '#ec131e' });
  }

  showInfo(title: string, text = '') {
    this.logNotification('info', title);
    Swal.fire({ icon: 'info', title, text, confirmButtonColor: '#ec131e' });
  }

  showWarning(title: string, text = '') {
    this.logNotification('warning', title);
    Swal.fire({ icon: 'warning', title, text, confirmButtonColor: '#ec131e' });
  }

  showToast(icon: 'success' | 'error' | 'warning' | 'info', title: string, timer = 3000) {
    this.logNotification(icon, title);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon,
      title,
      showConfirmButton: false,
      timer,
      timerProgressBar: true,
    });
  }

  async showConfirm(title: string, text: string, confirmText: string, cancelText: string): Promise<boolean> {
    const result = await Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ec131e',
      cancelButtonColor: '#64748b',
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
    });
    return result.isConfirmed;
  }

  async showExpiringSession(title: string, text: string): Promise<void> {
    await Swal.fire({
      icon: 'warning',
      title,
      text,
      confirmButtonColor: '#ec131e',
      allowOutsideClick: false,
    });
  }
}
