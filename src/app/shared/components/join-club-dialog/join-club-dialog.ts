import { Component, inject, signal, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { ClubService } from '../../../core/services/club.service';
import { UserClubsService } from '../../../core/services/user-clubs.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-join-club-dialog',
  imports: [ReactiveFormsModule, Dialog],
  templateUrl: './join-club-dialog.html',
  styleUrl: './join-club-dialog.scss',
})
export class JoinClubDialog {
  private readonly fb                = inject(FormBuilder);
  private readonly clubService       = inject(ClubService);
  private readonly userClubsService  = inject(UserClubsService);
  private readonly toast             = inject(ToastService);

  @Output() joined = new EventEmitter<void>();
  @Output() visibleChange = new EventEmitter<boolean>();

  @Input() set visible(v: boolean) {
    if (v) {
      this.form.reset();
      this.error.set(null);
    }
    this.visible$.set(v);
  }

  readonly visible$ = signal(false);
  readonly pending = signal(false);
  readonly error   = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    clubCode: ['', Validators.required],
  });

  open(): void {
    this.form.reset();
    this.error.set(null);
    this.visible$.set(true);
    this.visibleChange.emit(true);
  }

  submit(): void {
    if (this.form.invalid || this.pending()) return;
    this.pending.set(true);
    this.error.set(null);
    const { clubCode } = this.form.getRawValue();
    this.clubService.joinClub(clubCode).subscribe({
      next: () => {
        this.userClubsService.fetchUserClubs().subscribe();
        this.toast.success('Vous avez rejoint le club.');
        this.visible$.set(false);
        this.visibleChange.emit(false);
        this.pending.set(false);
        this.joined.emit();
      },
      error: (err) => {
        this.pending.set(false);
        this.error.set(
          err.status === 409 ? 'Vous êtes déjà membre de ce club.' : 'Code de club invalide.'
        );
      },
    });
  }
}
