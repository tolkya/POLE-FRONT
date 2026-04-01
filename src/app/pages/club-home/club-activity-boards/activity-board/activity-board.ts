import { Component, input, output } from '@angular/core';
import { Activity, ActivityType } from '../../../../core/models';
import { MyActivity } from '../../../../core/models/user-activity.model';
import { ActivityCard } from './activity-card/activity-card';

@Component({
  selector: 'app-activity-board',
  imports: [ActivityCard],
  templateUrl: './activity-board.html',
  styleUrl: './activity-board.scss',
})
export class ActivityBoard {
  readonly activityType  = input.required<ActivityType>();
  readonly activities    = input.required<Activity[]>();
  readonly userRole      = input<string | null>(null);
  readonly myActivities  = input<MyActivity[]>([]);
  readonly joined        = output<void>();

  onJoined(): void {
    this.joined.emit();
  }
}