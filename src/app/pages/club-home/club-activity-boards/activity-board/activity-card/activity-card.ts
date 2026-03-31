import { Component, input, computed } from '@angular/core';
import { Activity } from '../../../../../core/models';

@Component({
  selector: 'app-activity-card',
  imports: [],
  templateUrl: './activity-card.html',
  styleUrl: './activity-card.scss',
})
export class ActivityCard {
  readonly activity = input.required<Activity>();
  readonly userRole = input<string | null>(null);

  readonly isNew = computed(() => {
    const created = new Date(this.activity().createdAt);
    const now = new Date();
    return (now.getTime() - created.getTime()) < 7 * 24 * 60 * 60 * 1000;
  });
}
