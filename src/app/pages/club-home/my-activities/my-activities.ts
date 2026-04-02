import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MyActivitiesService } from '../../../core/services/my-activities.service';
import { MyActivity } from '../../../core/models/user-activity.model';

@Component({
  selector: 'app-my-activities',
  imports: [RouterLink],
  templateUrl: './my-activities.html',
  styleUrl: './my-activities.scss',
})
export class MyActivities implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly myActivitiesService = inject(MyActivitiesService);

  readonly loading = signal(true);

  readonly clubId = computed(() => Number(this.route.snapshot.paramMap.get('id')));

  readonly activities = this.myActivitiesService.myActivities;

  readonly groupedByType = computed(() => {
    const map = new Map<string, { typeName: string; items: MyActivity[] }>();
    for (const item of this.activities()) {
      const typeName = item.activity.activityType.name;
      if (!map.has(typeName)) {
        map.set(typeName, { typeName, items: [] });
      }
      map.get(typeName)!.items.push(item);
    }
    return Array.from(map.values());
  });

  ngOnInit(): void {
    this.myActivitiesService.fetchMyActivities(this.clubId()).subscribe({
      complete: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }
}