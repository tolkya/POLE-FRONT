import { Component, input, signal, computed, inject, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Activity, ActivityType, ActivityCreateDto, ActivityUpdateDto, UserActivity } from '../../../../core/models';
import { ActivitiesService } from '../../../../core/services/activities.service';
import { ActivityMembersService } from '../../../../core/services/activity-members.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ActivityFormDialog } from './activity-form-dialog/activity-form-dialog';
import { environment } from '../../../../../environments/environment';

interface ActivityGroup {
  type: ActivityType;
  activities: Activity[];
}

@Component({
  selector: 'app-admin-activities',
  imports: [ActivityFormDialog, ConfirmDialogModule],
  templateUrl: './admin-activities.html',
  styleUrl: './admin-activities.scss',
  providers: [ConfirmationService],
})
export class AdminActivities implements OnInit {
  readonly clubId = input.required<number>();

  private readonly activitiesService = inject(ActivitiesService);
  private readonly membersService    = inject(ActivityMembersService);
  private readonly toast             = inject(ToastService);
  private readonly confirm           = inject(ConfirmationService);

  private readonly mediaBase = environment.api.mediaBaseUrl;

  activities       = signal<Activity[]>([]);
  allActivityTypes = signal<ActivityType[]>([]);
  loading          = signal(true);
  error            = signal(false);

  // Dialog
  showDialog      = signal(false);
  editingActivity = signal<Activity | null>(null);

  // Demandes PENDING par activité : Map<activityId, UserActivity[]>
  pendingMap = signal<Map<number, UserActivity[]>>(new Map());
  expandedId = signal<number | null>(null);

  // Activités regroupées par discipline
  groupedActivities = computed<ActivityGroup[]>(() => {
    const map = new Map<number, ActivityGroup>();
    for (const a of this.activities()) {
      const t = a.activityType;
      if (!map.has(t.id)) map.set(t.id, { type: t, activities: [] });
      map.get(t.id)!.activities.push(a);
    }
    return Array.from(map.values());
  });

  ngOnInit(): void {
    // Chargement parallèle : activités du club ET catalogue global des disciplines
    this.load();
    this.activitiesService.getAllActivityTypes().subscribe({
      next: (types) => this.allActivityTypes.set(types),
    });
  }

  load(): void {
    this.loading.set(true);
    this.activitiesService.getActivities(this.clubId()).subscribe({
      next: (list) => {
        this.activities.set(list);
        this.loading.set(false);
        for (const a of list) this.loadPending(a.id);
      },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
  }

  openCreate(): void {
    this.editingActivity.set(null);
    this.showDialog.set(true);
  }

  openEdit(activity: Activity): void {
    this.editingActivity.set(activity);
    this.showDialog.set(true);
  }

  onDialogCreate(dto: ActivityCreateDto): void {
    this.activitiesService.createActivity(this.clubId(), dto).subscribe({
      next: () => { this.toast.success('Activité créée'); this.load(); },
      error: () => this.toast.error('Erreur lors de la création'),
    });
  }

  onDialogUpdate(dto: { id: number } & ActivityUpdateDto): void {
    const { id, ...data } = dto;
    this.activitiesService.updateActivity(id, data).subscribe({
      next: () => { this.toast.success('Activité modifiée'); this.load(); },
      error: () => this.toast.error('Erreur lors de la modification'),
    });
  }

  confirmDelete(activity: Activity): void {
    this.confirm.confirm({
      message: `Supprimer "${activity.name}" ? Les inscriptions associées seront également supprimées.`,
      header: 'Confirmer la suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.activitiesService.deleteActivity(activity.id).subscribe({
        next: () => { this.toast.success('Activité supprimée'); this.load(); },
        error: () => this.toast.error('Erreur lors de la suppression'),
      }),
    });
  }

  // Ouvre/ferme la section "Demandes en attente" pour une activité
  togglePending(activityId: number): void {
    if (this.expandedId() === activityId) {
      this.expandedId.set(null);
      return;
    }
    this.expandedId.set(activityId);
    // Chargement lazy : on ne charge que si pas déjà fait
    if (!this.pendingMap().has(activityId)) {
      this.loadPending(activityId);
    }
  }

  approveMember(userActivityId: number, activityId: number): void {
    this.membersService.patchStatus(userActivityId, 'APPROVED').subscribe({
      next: () => { this.toast.success('Inscription approuvée'); this.loadPending(activityId); },
      error: () => this.toast.error('Erreur'),
    });
  }

  rejectMember(userActivityId: number, activityId: number): void {
    this.membersService.patchStatus(userActivityId, 'REJECTED').subscribe({
      next: () => { this.toast.success('Inscription refusée'); this.loadPending(activityId); },
      error: () => this.toast.error('Erreur'),
    });
  }

  private loadPending(activityId: number): void {
    this.membersService.getMembers(activityId).subscribe({
      next: (members) => {
        const pending = members.filter(m => m.status === 'PENDING');
        this.pendingMap.update(map => new Map(map).set(activityId, pending));
      },
    });
  }

  getPending(activityId: number): UserActivity[] {
    return this.pendingMap().get(activityId) ?? [];
  }

  // Option A : image Activity en priorité, fallback sur ActivityType
  activityImageUrl(activity: Activity): string | null {
    const path = activity.medias?.[0]?.mediaUrl ?? activity.activityType.medias?.[0]?.mediaUrl ?? null;
    if (!path) return null;
    return path.startsWith('http') ? path : this.mediaBase + path;
  }

  onTypeCreated(type: ActivityType): void {
    // Ajoute la nouvelle discipline au signal sans rechargement HTTP
    this.allActivityTypes.update(types => [...types, type]);
  }
}