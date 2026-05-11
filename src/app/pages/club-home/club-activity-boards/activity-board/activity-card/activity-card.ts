import { Component, input, output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Activity } from '../../../../../core/models';
import { MyActivity, UserActivityStatus } from '../../../../../core/models/user-activity.model';
import { MyActivitiesService } from '../../../../../core/services/my-activities.service';
import { ToastService } from '../../../../../core/services/toast.service';

@Component({
  selector: 'app-activity-card',
  imports: [CommonModule],
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

  /** True si l'utilisateur est inscrit (APPROVED) → clic navigue vers le détail */
  readonly isEnrolled = computed(() => this.enrollmentStatus() === 'APPROVED');

  readonly myActivityEntry = computed(() => this.myActivities().find(ma => ma.activity.id === this.activity().id) ?? null);

  /** Rôle de l'utilisateur sur cette activité (TEACHER / STUDENT), null si non inscrit */
  readonly activityRole = computed(() => this.myActivityEntry()?.role ?? null);

  /** True si la card est cliquable (inscrit APPROVED ou admin du club) */
  readonly isClickable = computed(() => this.isEnrolled() || this.userRole() === 'ADMIN');

  onCardClick(): void {
    if (!this.isClickable()) return;
    const clubId = this.route.snapshot.paramMap.get('id');
    this.router.navigate(['/club', clubId, 'my-activities', this.activity().id]);
  }

  leave(): void {
    const entry = this.myActivityEntry();
    if (!entry) return;
    if (!confirm(`Quitter l'activité "${this.activity().name}" ?`)) return;
    this.myActivitiesService.leaveActivity(entry.id).subscribe({
      next: () => { this.toast.success('Vous avez quitté cette activité.'); this.joined.emit(); },
      error: () => this.toast.error('Erreur lors de la désinscription.'),
    });
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

  cancelRequest(): void {
    const entry = this.myActivityEntry();
    if (!entry) return;
    this.myActivitiesService.cancelRequest(entry.id).subscribe({
      next: () => { this.toast.success('Demande annulée'); this.joined.emit(); },
      error: () => this.toast.error('Erreur'),
    });
  }

  reRequest(): void {
    const entry = this.myActivityEntry();
    if (!entry) return;
    this.myActivitiesService.reRequestActivity(entry.id).subscribe({
      next: () => { this.toast.success('Demande envoyée'); this.joined.emit(); },
      error: () => this.toast.error('Erreur'),
    });
  }
}