import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MyActivitiesService } from '../../../core/services/my-activities.service';
import { MyActivity } from '../../../core/models/user-activity.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-my-activities',
  imports: [RouterLink],
  templateUrl: './my-activities.html',
  styleUrl: './my-activities.scss',
})
export class MyActivities implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly myActivitiesService = inject(MyActivitiesService);

  private readonly toast = inject(ToastService);

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
      complete: () => {
        this.loading.set(false);
        this.scrollToFragment();
      },
      error: () => this.loading.set(false),
    });
  }

  private scrollToFragment(): void {
    const fragment = this.route.snapshot.fragment;
    if (!fragment) return;
    setTimeout(() => {
      document.getElementById(fragment)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }
  
  onCancel(item: MyActivity): void {
    this.myActivitiesService.cancelRequest(item.id).subscribe({
      next: () => {
        this.toast.success('Demande annulée');
        this.myActivitiesService.fetchMyActivities(this.clubId()).subscribe();
      },
      error: () => this.toast.error('Erreur'),
    });
  }

  onLeave(event: Event, item: MyActivity): void {
    event.preventDefault();
    event.stopPropagation();
    this.myActivitiesService.leaveActivity(item.id).subscribe({
      next: () => {
        this.toast.success('Vous avez quitté l\'activité');
        this.myActivitiesService.fetchMyActivities(this.clubId()).subscribe();
      },
      error: () => this.toast.error('Erreur'),
    });
  }

  onReRequest(item: MyActivity): void {
    this.myActivitiesService.reRequestActivity(item.id).subscribe({
      next: () => {
        this.toast.success('Demande renvoyée');
        this.myActivitiesService.fetchMyActivities(this.clubId()).subscribe();
      },
      error: () => this.toast.error('Erreur'),
    });
  }
}