import { AbstractControl, ValidationErrors } from '@angular/forms';

export interface PasswordCriteria {
  minLength:   boolean; // 8 caractères minimum
  hasUpper:    boolean; // au moins 1 majuscule
  hasDigit:    boolean; // au moins 1 chiffre
  hasSpecial:  boolean; // au moins 1 symbole parmi !@#$%^&*...
}

/**
 * Validator de champ : évalue la force du mot de passe.
 * Retourne null si tous les critères sont remplis.
 * Retourne un objet { passwordStrength: PasswordCriteria } avec chaque critère
 * à true (ok) ou false (manquant) — utilisé pour le feedback visuel dans le template.
 *
 * Usage :
 *   fb.nonNullable.group({ plainPassword: ['', [Validators.required, passwordStrength]] })
 */
export function passwordStrength(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value ?? '';

  const criteria: PasswordCriteria = {
    minLength:  value.length >= 8,
    hasUpper:   /[A-Z]/.test(value),
    hasDigit:   /\d/.test(value),
    hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(value),
  };

  const allMet = Object.values(criteria).every(Boolean);
  return allMet ? null : { passwordStrength: criteria };
}
