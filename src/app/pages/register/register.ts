import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { UserRegistrationService, UserRegistrationResponse } from './user-registration.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(UserRegistrationService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: [''],
    plainPassword: ['', [Validators.required, Validators.minLength(8)]],
    clubCode: ['', Validators.required],
  });

  readonly pending = signal(false);
  readonly serverError = signal<string | null>(null);
  readonly success = signal<UserRegistrationResponse | null>(null);

  submit(): void {
    if (this.form.invalid || this.pending()) return;

    this.pending.set(true);
    this.serverError.set(null);

    const { email, firstName, lastName, phone, plainPassword, clubCode } = this.form.getRawValue();

    this.service.register({ email, firstName, lastName, phone: phone || undefined, plainPassword, clubCode }).subscribe({
      next: (res) => {
        this.pending.set(false);
        this.success.set(res);
      },
      error: (err: HttpErrorResponse) => {
        this.pending.set(false);
        if (err.status === 422) {
          this.serverError.set('Données invalides. Vérifiez les champs.');
        } else if (err.status === 404) {
          this.serverError.set('Code club invalide.');
        } else {
          this.serverError.set('Une erreur est survenue. Réessayez plus tard.');
        }
      },
    });
  }
}