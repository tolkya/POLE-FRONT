import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../core/services/auth';
import { HttpErrorResponse } from '@angular/common/http';

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
      next: () => void this.router.navigate(['/']),
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