import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Auth } from '../../core/services/auth.service';
import { UserClubsService } from '../../core/services/user-clubs.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly userClubsService = inject(UserClubsService);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  readonly pending = signal(false);
  readonly serverError = signal<string | null>(null);

  submit(): void {
    if (this.form.invalid || this.pending()) return;

    this.pending.set(true);
    this.serverError.set(null);

    const { email, password } = this.form.getRawValue();

    this.auth.login(email, password).subscribe({
      next: () => {
        this.auth.getMe().subscribe({
          next: (user) => {
            // Super Admin → dashboard super admin
            if (user.roles.includes('ROLE_SUPER_ADMIN')) {
              void this.router.navigate(['/dashboard/super-admin']);
              return;
            }

            // Autres utilisateurs → récupérer leurs clubs
            this.userClubsService.fetchUserClubs().subscribe({
              next: () => {
                if (this.userClubsService.isAdminOfAnyClub()) {
                  void this.router.navigate(['/dashboard/club-admin']);
                } else {
                  void this.router.navigate(['/dashboard']);
                }
              },
              error: () => void this.router.navigate(['/dashboard'])
            });
          },
          error: () => void this.router.navigate(['/'])
        });
      },
      error: (err: HttpErrorResponse) => {
        this.pending.set(false);
        if (err.status === 401) {
          this.serverError.set('Email ou mot de passe incorrect.');
        } else {
          this.serverError.set('Une erreur est survenue. Réessayez plus tard.');
        }
      },
      complete: () => this.pending.set(false),
    });
  }
}