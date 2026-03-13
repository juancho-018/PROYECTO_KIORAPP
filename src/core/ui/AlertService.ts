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

/**
 * Concrete implementation of IAlertService using SweetAlert2 (SRP).
 */
export class SweetAlertService implements IAlertService {
  showSuccess(title: string, text = '') {
    Swal.fire({ icon: 'success', title, text, confirmButtonColor: '#ec131e' });
  }

  showError(title: string, text = '') {
    Swal.fire({ icon: 'error', title, text, confirmButtonColor: '#ec131e' });
  }

  showInfo(title: string, text = '') {
    Swal.fire({ icon: 'info', title, text, confirmButtonColor: '#ec131e' });
  }

  showWarning(title: string, text = '') {
    Swal.fire({ icon: 'warning', title, text, confirmButtonColor: '#ec131e' });
  }

  showToast(icon: 'success' | 'error' | 'warning' | 'info', title: string, timer = 3000) {
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
