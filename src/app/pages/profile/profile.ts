import { timer } from 'rxjs';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { map, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { EyeIcon } from '../../shared/components/eye-icon/eye-icon';
import { passwordsMatch } from '../../shared/validators/passwords-match.validator';
import { passwordStrength, PasswordCriteria } from '../../shared/validators/password-strength.validator';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, EyeIcon],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  private readonly fb          = inject(FormBuilder);
  private readonly auth        = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly messages    = inject(MessageService);
  private readonly router      = inject(Router);

  readonly currentUser     = this.auth.currentUser;
  readonly pendingProfile  = signal(false);
  readonly pendingPassword = signal(false);

  private readonly destroyRef = inject(DestroyRef);

  readonly showCurrentPwd = signal(false);
  readonly showNewPwd     = signal(false);
  readonly showConfirmPwd = signal(false);
  readonly pwdFocused     = signal(false);

  readonly profileForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName:  ['', [Validators.required, Validators.minLength(2)]],
    email:     ['', [Validators.required, Validators.email]],
    phone:     ['', [Validators.maxLength(20)]],
  });

  readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    plainPassword:   ['', [Validators.required, passwordStrength]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordsMatch });

  readonly pwdCriteria = toSignal(
    this.passwordForm.controls.plainPassword.valueChanges.pipe(
      startWith(''),
      map(() => {
        const errors = this.passwordForm.controls.plainPassword.errors;
        return (errors?.['passwordStrength'] ?? {
          minLength: true, hasUpper: true, hasDigit: true, hasSpecial: true,
        }) as PasswordCriteria;
      }),
    ),
    { initialValue: { minLength: false, hasUpper: false, hasDigit: false, hasSpecial: false } as PasswordCriteria },
  );

  constructor() {
    const u = this.currentUser();
    if (u) {
      this.profileForm.patchValue({
        firstName: u.firstName,
        lastName:  u.lastName,
        email:     u.email,
        phone:     u.phone ?? '',
      });
    }
  }

  submitProfile(): void {
    const user = this.currentUser();
    if (!user || this.profileForm.invalid || this.pendingProfile()) return;

    this.pendingProfile.set(true);
    const previousEmail = user.email;
    const payload = this.profileForm.getRawValue();

    this.userService.updateProfile(user.id, payload).subscribe({
      next: (updated: User) => {
        this.auth.currentUser.set(updated);
        this.pendingProfile.set(false);
        this.messages.add({ severity: 'success', summary: 'Profil', detail: 'Profil mis à jour.' });

        if (updated.email !== previousEmail) {
          this.messages.add({
            severity: 'warn',
            summary: 'Reconnexion requise',
            detail: 'Votre email a changé. Veuillez vous reconnecter.',
          });
          timer(2000).pipe(
            takeUntilDestroyed(this.destroyRef)
          ).subscribe(() => {
            this.auth.currentUser.set(null);
            this.auth.logout();
            void this.router.navigate(['/login']);
          });
        }
      },
      error: (err: HttpErrorResponse) => {
        this.pendingProfile.set(false);
        if (err.status === 409) {
          this.messages.add({ severity: 'error', summary: 'Email', detail: 'Cet email est déjà utilisé.' });
        } else {
          this.messages.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de mettre à jour le profil.' });
        }
      },
    });
  }

  submitPassword(): void {
    const user = this.currentUser();
    if (!user || this.passwordForm.invalid || this.pendingPassword()) return;

    this.pendingPassword.set(true);
    const { currentPassword, plainPassword } = this.passwordForm.getRawValue();

    this.userService.changePassword(user.id, { currentPassword, plainPassword }).subscribe({
      next: () => {
        this.pendingPassword.set(false);
        this.passwordForm.reset();
        this.messages.add({ severity: 'success', summary: 'Mot de passe', detail: 'Mot de passe modifié avec succès.' });
      },
      error: (err: HttpErrorResponse) => {
        this.pendingPassword.set(false);
        if (err.status === 422) {
          this.messages.add({ severity: 'error', summary: 'Mot de passe', detail: 'Mot de passe actuel incorrect.' });
        } else {
          this.messages.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de modifier le mot de passe.' });
        }
      },
    });
  }
}