import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ClubAdminRegistration, ClubAdminRegistrationResponse } from './club-admin-registration.service';

@Component({
  selector: 'app-register-club-admin',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register-club-admin.html',
  styleUrl: './register-club-admin.scss',
})
export class RegisterClubAdmin {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ClubAdminRegistration);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: [''],
    plainPassword: ['', [Validators.required, Validators.minLength(8)]],
    clubName: ['', Validators.required],
  });

  readonly pending = signal(false);
  readonly serverError = signal<string | null>(null);
  readonly success = signal<ClubAdminRegistrationResponse | null>(null);

  submit(): void {
    if (this.form.invalid || this.pending()) return;

    this.pending.set(true);
    this.serverError.set(null);

    const { email, firstName, lastName, phone, plainPassword, clubName } = this.form.getRawValue();

    this.service.register({ email, firstName, lastName, phone: phone || undefined, plainPassword, clubName }).subscribe({
      next: (res) => {
        this.pending.set(false);
        this.success.set(res);
      },
      error: (err: HttpErrorResponse) => {
        this.pending.set(false);
        if (err.status === 422) {
          this.serverError.set('Données invalides. Vérifiez les champs.');
        } else if (err.status === 409) {
          this.serverError.set('Cet email est déjà utilisé.');
        } else {
          this.serverError.set('Une erreur est survenue. Réessayez plus tard.');
        }
      },
    });
  }
}