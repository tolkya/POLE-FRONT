import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

/**
 * Wrapper du MessageService PrimeNG.
 * Règle d'usage :
 *  - Erreurs serveur / confirmations d'actions → toast (ce service)
 *  - Erreurs de validation de champ → inline Angular (dans le template)
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly messageService = inject(MessageService);

  success(message: string, title = 'Succès'): void {
    this.messageService.add({
      severity: 'success',
      summary: title,
      detail: message,
      life: 3000,
    });
  }

  error(message: string, title = 'Erreur'): void {
    this.messageService.add({
      severity: 'error',
      summary: title,
      detail: message,
      life: 5000,
    });
  }

  info(message: string, title = 'Info'): void {
    this.messageService.add({
      severity: 'info',
      summary: title,
      detail: message,
      life: 3000,
    });
  }

  warning(message: string, title = 'Attention'): void {
    this.messageService.add({
      severity: 'warn',
      summary: title,
      detail: message,
      life: 4000,
    });
  }
}
