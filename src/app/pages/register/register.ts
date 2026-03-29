import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { map, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserRegistrationService } from './user-registration.service';
import { ClubAdminRegistration } from './club-admin-registration.service';
import { Auth } from '../../core/services/auth.service';
import { EyeIcon } from '../../shared/components/eye-icon/eye-icon';
import { passwordsMatch } from '../../shared/validators/passwords-match.validator';
import { passwordStrength, PasswordCriteria } from '../../shared/validators/password-strength.validator';

/** Les 3 modes possibles du formulaire d'inscription */
type RegisterMode = 'simple' | 'join' | 'club-admin';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, EyeIcon],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register implements OnInit {
  private readonly fb          = inject(FormBuilder);
  private readonly userService = inject(UserRegistrationService);
  private readonly clubService = inject(ClubAdminRegistration);
  private readonly route       = inject(ActivatedRoute);
  private readonly auth        = inject(Auth);

  readonly mode           = signal<RegisterMode>('simple');
  readonly showPwd        = signal(false);
  readonly showConfirmPwd = signal(false);
  readonly pending        = signal(false);
  readonly serverError    = signal<string | null>(null);
  /** Passe à true dès le premier clic dans le champ — affiche les critères immédiatement */
  readonly pwdFocused     = signal(false);

  // form déclaré avant pwdCriteria car toSignal s'abonne à valueChanges dès l'init
  readonly form = this.fb.nonNullable.group({
    email:           ['', [Validators.required, Validators.email]],
    firstName:       ['', Validators.required],
    lastName:        ['', Validators.required],
    phone:           [''],
    plainPassword:   ['', [Validators.required, passwordStrength]],
    confirmPassword: ['', Validators.required],
    clubCode:        [''],
    clubName:        [''],
  }, { validators: passwordsMatch });

  /**
   * Critères du mot de passe mis à jour en temps réel.
   * toSignal() convertit l'Observable valueChanges en Signal Angular :
   * à chaque frappe, le validator passwordStrength recalcule les erreurs,
   * et le signal se met à jour automatiquement — le template se rafraîchit.
   * startWith('') déclenche un premier calcul dès le chargement.
   */
  readonly pwdCriteria = toSignal(
    this.form.controls.plainPassword.valueChanges.pipe(
      startWith(''),
      map(() => {
        const errors = this.form.controls.plainPassword.errors;
        return (errors?.['passwordStrength'] ?? {
          minLength: true, hasUpper: true, hasDigit: true, hasSpecial: true,
        }) as PasswordCriteria;
      }),
    ),
    { initialValue: { minLength: false, hasUpper: false, hasDigit: false, hasSpecial: false } as PasswordCriteria },
  );

  ngOnInit(): void {
    const isClubAdmin = this.route.snapshot.url.some(s => s.path === 'club-admin');
    const isJoin      = this.route.snapshot.queryParamMap.get('join') === 'true';

    if (isClubAdmin) {
      this.mode.set('club-admin');
      this.form.controls.clubName.setValidators(Validators.required);
    } else if (isJoin) {
      this.mode.set('join');
      this.form.controls.clubCode.setValidators(Validators.required);
    }

    this.form.controls.clubName.updateValueAndValidity();
    this.form.controls.clubCode.updateValueAndValidity();
  }

  submit(): void {
    if (this.form.invalid || this.pending()) return;

    this.pending.set(true);
    this.serverError.set(null);

    const { email, firstName, lastName, phone, plainPassword, clubCode, clubName } =
      this.form.getRawValue();

    const base = { email, firstName, lastName, phone: phone || undefined, plainPassword };

    const registration$ = this.mode() === 'club-admin'
      ? this.clubService.register({ ...base, clubName })
      : this.userService.register({ ...base, clubCode: clubCode || undefined });

    const successMsg = this.mode() === 'club-admin'
      ? 'Votre demande est en attente de validation par un administrateur.'
      : this.mode() === 'join'
        ? 'Compte cr\u00e9\u00e9 et club rejoint avec succ\u00e8s\u00a0!'
        : 'Compte cr\u00e9\u00e9 avec succ\u00e8s\u00a0!';

    registration$.subscribe({
      next: () => {
        this.auth.loginAfterRegistration(email, plainPassword, successMsg)
          .subscribe({ error: () => this.pending.set(false) });
      },
      error: (err: HttpErrorResponse) => {
        this.pending.set(false);
        if (err.status === 422) {
          this.serverError.set('Donn\u00e9es invalides. V\u00e9rifiez les champs.');
        } else if (err.status === 404) {
          this.serverError.set('Code club invalide.');
        } else if (err.status === 409) {
          this.serverError.set('Cet email est d\u00e9j\u00e0 utilis\u00e9.');
        } else {
          this.serverError.set('Une erreur est survenue. R\u00e9essayez plus tard.');
        }
      },
    });
  }
}
