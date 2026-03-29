import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Validator de groupe : vérifie que plainPassword === confirmPassword.
 * S'applique sur le FormGroup, pas sur un FormControl individuel.
 *
 * Usage :
 *   fb.group({ ... }, { validators: passwordsMatch })
 */
export function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const pwd     = control.get('plainPassword')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return pwd && confirm && pwd !== confirm ? { passwordsMismatch: true } : null;
}
