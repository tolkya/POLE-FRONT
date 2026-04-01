import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { UserClubsService } from '../../core/services/user-clubs.service';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  private readonly fb     = inject(FormBuilder);
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);
  private readonly userClubsService = inject(UserClubsService);

  readonly form = this.fb.nonNullable.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  readonly pending     = signal(false);
  readonly serverError = signal<string | null>(null);

  ngOnInit(): void {
    // Déjà connecté (getMe fait par app.ts au démarrage) ? Rediriger directement
    const user = this.auth.currentUser();
    if (user) {
      this.redirect(user.roles);
    }
  }

  submit(): void {
    if (this.form.invalid || this.pending()) return;

    this.pending.set(true);
    this.serverError.set(null);

    const { email, password } = this.form.getRawValue();

    this.auth.login(email, password).subscribe({
      next: () => {
        this.auth.getMe().subscribe({
          next:  (user) => this.redirect(user.roles),
          error: ()     => void this.router.navigate(['/login']),
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

  private redirect(roles: string[]): void {
    if (roles.includes('ROLE_SUPER_ADMIN')) {
      void this.router.navigate(['/dashboard/super-admin']);
      return;
    }
    // Charge les clubs de l'utilisateur et redirige vers le premier
    this.userClubsService.fetchUserClubs().subscribe({
      next: () => {
        const clubs = this.userClubsService.userClubs();
        if (clubs.length > 0) {
          void this.router.navigate(['/club', clubs[0].club.id]);
        } else {
          void this.router.navigate(['/']);
        }
      },
      error: () => void this.router.navigate(['/']),
    });
  }
}
