import { Component, input, signal, computed, inject, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Activity, ActivityType, ActivityCreateDto, ActivityUpdateDto, UserActivity } from '../../../../core/models';
import { ActivitiesService } from '../../../../core/services/activities.service';
import { ActivityMembersService } from '../../../../core/services/activity-members.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ActivityFormDialog } from './activity-form-dialog/activity-form-dialog';
import { environment } from '../../../../../environments/environment';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ClubMembersService } from '../../../../core/services/club-members.service';
import { ClubMember } from '../../../../core/models';
import { FormsModule } from '@angular/forms';


interface ActivityGroup {
  type: ActivityType;
  activities: Activity[];
}

@Component({
  selector: 'app-admin-activities',
  imports: [ActivityFormDialog, ConfirmDialogModule, PanelModule, ButtonModule, AutoCompleteModule, FormsModule],
  templateUrl: './admin-activities.html',
  styleUrl: './admin-activities.scss',
  providers: [ConfirmationService],
})
export class AdminActivities implements OnInit {
  readonly clubId = input.required<number>();

  private readonly clubMembersService = inject(ClubMembersService);
  private readonly activitiesService = inject(ActivitiesService);
  private readonly membersService    = inject(ActivityMembersService);
  private readonly toast             = inject(ToastService);
  private readonly confirm           = inject(ConfirmationService);

  private readonly mediaBase = environment.api.mediaBaseUrl;

  activities       = signal<Activity[]>([]);
  allActivityTypes = signal<ActivityType[]>([]);
  loading          = signal(true);
  error            = signal(false);

  // Inscrits par activité (lazy — chargé au premier clic sur p-panel)
  enrolledMap   = signal<Map<number, UserActivity[]>>(new Map());
  private loadedPanels = new Set<number>();

  // Membres du club pour l'autocomplete
  clubMembersList   = signal<(ClubMember & { displayName: string })[]>([]);
  memberSuggestions = signal<(ClubMember & { displayName: string })[]>([]);

  // Formulaire inline d'ajout
  addFormState  = signal<{ activityId: number; role: 'TEACHER' | 'STUDENT' } | null>(null);
  selectedMember = signal<(ClubMember & { displayName: string }) | null>(null);

  // Dialog
  showDialog      = signal(false);
  editingActivity = signal<Activity | null>(null);

  // Demandes PENDING par activité : Map<activityId, UserActivity[]>
  pendingMap = signal<Map<number, UserActivity[]>>(new Map());

  openPanels = signal<Set<number>>(new Set());

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
    this.clubMembersService.getMembers(this.clubId()).subscribe({
      next: (res) => this.clubMembersList.set(
        res.members.map(m => ({ ...m, displayName: `${m.member.firstName} ${m.member.lastName}` }))
      ),
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

  approveMember(userActivityId: number, activityId: number): void {
    this.membersService.patchStatus(userActivityId, 'APPROVED').subscribe({
      next: () => { this.toast.success('Inscription approuvée'); this.reloadEnrolled(activityId); },
      error: () => this.toast.error('Erreur'),
    });
  }

  rejectMember(userActivityId: number, activityId: number): void {
    this.membersService.patchStatus(userActivityId, 'REJECTED').subscribe({
      next: () => { this.toast.success('Inscription refusée'); this.reloadEnrolled(activityId); },
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

  getTeachers(activityId: number): UserActivity[] {
    return (this.enrolledMap().get(activityId) ?? [])
      .filter(ua => ua.role === 'TEACHER' && ua.status === 'APPROVED');
  }

  getStudents(activityId: number): UserActivity[] {
    return (this.enrolledMap().get(activityId) ?? [])
      .filter(ua => ua.role === 'STUDENT' && ua.status === 'APPROVED');
  }

  getPendingEnrolled(activityId: number): UserActivity[] {
    return (this.enrolledMap().get(activityId) ?? [])
      .filter(ua => ua.status === 'PENDING');
  }

  // Autocomplete — filtre les membres du club
  searchMember(query: string): void {
    const q = query.toLowerCase();
    this.memberSuggestions.set(
      this.clubMembersList().filter(m =>
        `${m.member.firstName} ${m.member.lastName} ${m.member.email}`
          .toLowerCase().includes(q)
      )
    );
  }

  openAddForm(activityId: number, role: 'TEACHER' | 'STUDENT'): void {
    this.addFormState.set({ activityId, role });
    this.selectedMember.set(null);
  }

  cancelAddForm(): void {
    this.addFormState.set(null);
    this.selectedMember.set(null);
  }

  enroll(): void {
    const state  = this.addFormState();
    const member = this.selectedMember();
    if (!state || !member) return;
    this.membersService.enrollMember(state.activityId, {
      memberId: member.member.id,
      role: state.role,
    }).subscribe({
      next: () => {
        this.toast.success('Membre inscrit avec succès');
        this.addFormState.set(null);
        this.selectedMember.set(null);
        this.reloadEnrolled(state.activityId);
      },
      error: () => this.toast.error('Erreur lors de l\'inscription'),
    });
  }

  removeEnrolled(userActivityId: number, activityId: number): void {
    this.confirm.confirm({
      message: 'Retirer ce membre de l\'activité ?',
      accept: () => {
        this.membersService.deleteMembership(userActivityId).subscribe({
          next: () => {
            this.toast.success('Membre retiré');
            this.reloadEnrolled(activityId);
          },
          error: () => this.toast.error('Erreur lors de la suppression'),
        });
      },
    });
  }

  private reloadEnrolled(activityId: number): void {
    this.loadedPanels.delete(activityId);
    this.membersService.getMembers(activityId).subscribe({
      next: (list) => {
        const map = new Map(this.enrolledMap());
        map.set(activityId, list);
        this.enrolledMap.set(map);
        this.loadedPanels.add(activityId);
        // Mettre à jour le badge (pendingMap)
        const pending = list.filter(m => m.status === 'PENDING');
        this.pendingMap.update(m => new Map(m).set(activityId, pending));
      },
    });
  }

  isOpen(activityId: number): boolean {
    return this.openPanels().has(activityId);
  }

  toggle(activityId: number): void {
    const set = new Set(this.openPanels());
    if (set.has(activityId)) {
      set.delete(activityId);
    } else {
      set.add(activityId);
      if (!this.loadedPanels.has(activityId)) {
        this.loadedPanels.add(activityId);
        this.membersService.getMembers(activityId).subscribe({
          next: (list) => {
            const map = new Map(this.enrolledMap());
            map.set(activityId, list);
            this.enrolledMap.set(map);
          },
        });
      }
    }
    this.openPanels.set(set);
  }
}