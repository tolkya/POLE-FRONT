import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialog {
  @Input({ required: true }) message!: string;
  @Input() confirmLabel = 'Confirmer';
  @Input() cancelLabel = 'Annuler';

  /** Émet quand l'utilisateur clique Confirmer */
  @Output() confirmed = new EventEmitter<void>();
  /** Émet quand l'utilisateur clique Annuler */
  @Output() cancelled = new EventEmitter<void>();

  readonly visible = signal(false);

  open(): void {
    this.visible.set(true);
  }

  confirm(): void {
    this.visible.set(false);
    this.confirmed.emit();
  }

  cancel(): void {
    this.visible.set(false);
    this.cancelled.emit();
  }
}
