import { Component, input } from '@angular/core';

@Component({
  selector: 'app-eye-icon',
  imports: [],
  templateUrl: './eye-icon.html',
  styleUrl: './eye-icon.scss',
})
export class EyeIcon {
  /** true = mot de passe visible (œil ouvert), false = masqué (œil barré) */
  readonly visible = input.required<boolean>();
}
