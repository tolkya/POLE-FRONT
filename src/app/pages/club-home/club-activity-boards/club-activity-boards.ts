import { Component, input, inject, signal, computed, OnInit, output } from '@angular/core';
import { ActivitiesService } from '../../../core/services/activities.service';
import { MyActivitiesService } from '../../../core/services/my-activities.service';
import { Activity, ActivityType } from '../../../core/models';
import { MyActivity } from '../../../core/models/user-activity.model';
import { ActivityBoard } from './activity-board/activity-board';

interface ActivityGroup {
  type: ActivityType;
  items: Activity[];
}

@Component({
  selector: 'app-club-activity-boards',
  imports: [ActivityBoard],
  templateUrl: './club-activity-boards.html',
  styleUrl: './club-activity-boards.scss',
})
export class ClubActivityBoards implements OnInit {
  private readonly activitiesService    = inject(ActivitiesService);
  private readonly myActivitiesService  = inject(MyActivitiesService);

  readonly clubId   = input.required<number>();
  readonly userRole = input<string | null>(null);
  readonly activitiesCountChange = output<number>();

  readonly activities   = signal<Activity[]>([]);
  readonly myActivities = signal<MyActivity[]>([]);
  readonly loading      = signal(true);

  readonly grouped = computed<ActivityGroup[]>(() => {
    const map = new Map<number, ActivityGroup>();
    for (const a of this.activities()) {
      if (!map.has(a.activityType.id)) {
        map.set(a.activityType.id, { type: a.activityType, items: [] });
      }
      map.get(a.activityType.id)!.items.push(a);
    }
    return [...map.values()];
  });

  ngOnInit(): void {
    this.activitiesService.getActivities(this.clubId()).subscribe({
      next: (a) => {
        this.activities.set(a);
        this.loading.set(false);
        this.activitiesCountChange.emit(a.length);
      },
      error: () => this.loading.set(false),
    });

    // Charge les inscriptions du membre si connecté (pour les badges)
    if (this.userRole() !== null) {
      this.myActivitiesService.fetchMyActivities(this.clubId()).subscribe({
        next: (res) => this.myActivities.set(res),
      });
    }
  }

    refreshMyActivities(): void {
    this.myActivitiesService.fetchMyActivities(this.clubId()).subscribe({
      next: (res) => this.myActivities.set(res),
    });
  }
}