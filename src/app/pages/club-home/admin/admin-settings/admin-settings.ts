import { Component, input } from '@angular/core';

@Component({
  selector: 'app-admin-settings',
  imports: [],
  templateUrl: './admin-settings.html',
  styleUrl: './admin-settings.scss',
})
export class AdminSettings {
  readonly clubId = input.required<number>();
}
