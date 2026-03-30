import { Component, inject, signal, Output, EventEmitter } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Dialog } from 'primeng/dialog';
import { ClubService } from '../../../core/services/club.service';
import { UserClubsService } from '../../../core/services/user-clubs.service';
import { ToastService } from '../../../core/services/toast.service';
import { Auth } from '../../../core/services/auth.service';

@Component({
  selector: 'app-create-club-dialog',
  imports: [ReactiveFormsModule, Dialog],
  templateUrl: './create-club-dialog.html',
  styleUrl: './create-club-dialog.scss',
})
export class CreateClubDialog {
  private readonly fb               = inject(FormBuilder);
  private readonly clubService      = inject(ClubService);
  private readonly userClubsService = inject(UserClubsService);
  private readonly toast            = inject(ToastService);
  private readonly auth             = inject(Auth);
  private readonly router           = inject(Router);

  @Output() created = new EventEmitter<void>();

  readonly visible = signal(false);
  readonly pending = signal(false);
  readonly error   = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name:  ['', Validators.required],
    email: [''],
    phone: [''],
  });

  open(): void {
    // Seul un utilisateur connecté peut créer un club
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/register/club-admin']);
      return;
    }
    this.form.reset();
    this.error.set(null);
    this.visible.set(true);
  }

  submit(): void {
    if (this.form.invalid || this.pending()) return;
    this.pending.set(true);
    this.error.set(null);
    this.clubService.createClub(this.form.getRawValue()).subscribe({
      next: () => {
        this.userClubsService.fetchUserClubs().subscribe();
        this.toast.success('Club créé avec succès.');
        this.visible.set(false);
        this.pending.set(false);
        this.created.emit();
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.pending.set(false);
        this.error.set('Erreur lors de la création du club.');
      },
    });
  }
}
