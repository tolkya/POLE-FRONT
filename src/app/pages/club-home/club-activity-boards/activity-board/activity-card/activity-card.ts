import { Component, input, output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Activity } from '../../../../../core/models';
import { MyActivity, UserActivityStatus } from '../../../../../core/models/user-activity.model';
import { MyActivitiesService } from '../../../../../core/services/my-activities.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { LevelLabelPipe } from '../../../../../shared/pipes/level-label.pipe';

@Component({
  selector: 'app-activity-card',
  imports: [CommonModule, LevelLabelPipe],
  templateUrl: './activity-card.html',
  styleUrl: './activity-card.scss',
})
export class ActivityCard {
  private readonly myActivitiesService = inject(MyActivitiesService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly activity     = input.required<Activity>();
  readonly userRole     = input<string | null>(null);
  readonly myActivities = input<MyActivity[]>([]);

  readonly isNew = computed(() => {
    const created = new Date(this.activity().createdAt);
    const now = new Date();
    return (now.getTime() - created.getTime()) < 7 * 24 * 60 * 60 * 1000;
  });

  /** Statut d'inscription de l'utilisateur sur cette activité (null = pas inscrit) */
  readonly enrollmentStatus = computed<UserActivityStatus | null>(() => {
    const found = this.myActivities().find(
      ma => ma.activity.id === this.activity().id
    );
    return found?.status ?? null;
  });

  readonly joined = output<void>();

  readonly canJoin = computed(() =>
    this.userRole() !== null &&
    this.userRole() !== 'ADMIN' &&
    this.enrollmentStatus() === null
  );

  /** True si l'utilisateur est inscrit (APPROVED ou PENDING) → clic navigue vers Mes activités */
  readonly isEnrolled = computed(() => this.enrollmentStatus() !== null);

  onCardClick(): void {
    if (!this.isEnrolled()) return;
    const clubId = this.route.snapshot.paramMap.get('id');
    this.router.navigate(
      ['/club', clubId, 'my-activities'],
      { fragment: `activity-${this.activity().id}` }
    );
  }

  join(): void {
    this.myActivitiesService.joinActivity(this.activity().id).subscribe({
      next: () => {
        this.toast.success('Demande d\'inscription envoyée.');
        this.joined.emit();
      },
      error: (err) => {
        if (err.status === 409) {
          this.toast.error('Vous êtes déjà inscrit à cette activité.');
        } else {
          this.toast.error('Erreur lors de l\'inscription.');
        }
      },
    });
  }
}