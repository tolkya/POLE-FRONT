import { Component, input } from '@angular/core';

@Component({
  selector: 'app-admin-activities',
  imports: [],
  templateUrl: './admin-activities.html',
  styleUrl: './admin-activities.scss',
})
export class AdminActivities {
  readonly clubId = input.required<number>();
}
