import { Component, input, output, signal, inject, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Activity, ActivityType, ActivitiesService, ActivityCreateDto } from '../activities.service';
import { LevelsService, Level, LevelCreateDto, LEVEL_VALUES } from './levels.service';
import { ActivityMembersService, ActivityMember, EnrollMemberDto } from './activity-members.service';
import { ClubMembersService, ClubMember } from '../club-members.service';
import { UserClubsService } from '../../../../core/services/user-clubs.service';
import { Auth } from '../../../../core/services/auth.service';
import { LevelSection } from './level-section/level-section';
import { Select } from 'primeng/select';
import { Accordion, AccordionPanel, AccordionHeader, AccordionContent } from 'primeng/accordion';
import { Badge } from 'primeng/badge';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';

interface ActivityGroup {
  type: ActivityType;
  items: Activity[];
}

@Component({
  selector: 'app-activities-tab',
  imports: [FormsModule, DatePipe, Select, Accordion, AccordionPanel, AccordionHeader, AccordionContent, Badge, Tabs, TabList, Tab, TabPanels, TabPanel, LevelSection],
  templateUrl: './activities-tab.html',
  styleUrl: './activities-tab.scss',
})
export class ActivitiesTab implements OnInit {
  private readonly activitiesService = inject(ActivitiesService);
  private readonly levelsService = inject(LevelsService);
  private readonly activityMembersService = inject(ActivityMembersService);
  private readonly clubMembersService = inject(ClubMembersService);
  private readonly userClubsService = inject(UserClubsService);
  private readonly auth = inject(Auth);

  readonly clubId = input.required<number>();
  readonly activities = input.required<Activity[]>();

  readonly activityDeleted = output<number>();
  readonly activityCreated = output<Activity>();

  readonly allActivityTypes = signal<ActivityType[]>([]);
  readonly levelValues = LEVEL_VALUES;

  readonly groupedActivities = computed<ActivityGroup[]>(() => {
    const map = new Map<number, ActivityGroup>();
    for (const a of this.activities()) {
      if (!map.has(a.activityType.id)) {
        map.set(a.activityType.id, { type: a.activityType, items: [] });
      }
      map.get(a.activityType.id)!.items.push(a);
    }
    return [...map.values()];
  });

  // Formulaire inline (sous-discipline dans un groupe existant)
  readonly openFormForTypeId = signal<number | null>(null);
  readonly inlineNewName = signal('');
  readonly inlineNewDescription = signal('');
  readonly inlineSaving = signal(false);

  // Formulaire "Ajouter une discipline"
  readonly showAddDisciplineForm = signal(false);
  readonly selectedType = signal<ActivityType | null>(null);
  readonly disciplineNewName = signal('');
  readonly disciplineNewDescription = signal('');
  readonly disciplineSaving = signal(false);

  // Panneau niveaux
  readonly selectedActivityId = signal<number | null>(null);
  readonly levels = signal<Level[]>([]);
  readonly levelsLoading = signal(false);

  // Formulaire ajout niveau
  readonly showLevelForm = signal(false);
  readonly newLevelValue = signal<string | null>(null);
  readonly newLevelDescription = signal('');
  readonly levelSaving = signal(false);

  // --- Inscrits (UserActivity) ---
  readonly activityMembers = signal<ActivityMember[]>([]);
  readonly membersLoading = signal(false);
  readonly enrollError = signal<string | null>(null);
  readonly enrollMemberId = signal<number | null>(null);
  readonly enrollRole = signal<string>('STUDENT');
  readonly enrollSaving = signal(false);
  readonly clubMembersForEnroll = signal<ClubMember[]>([]);

  readonly approvedMembers = computed(() =>
    this.activityMembers().filter((m) => m.status === 'APPROVED')
  );
  readonly pendingMembers = computed(() =>
    this.activityMembers().filter((m) => m.status === 'PENDING')
  );
  readonly isAdmin = computed(() =>
    this.userClubsService.currentClub()?.roles.includes('ADMIN') ?? false
  );
  readonly currentUserId = computed(() => this.auth.currentUser()?.id ?? null);

  ngOnInit(): void {
    this.activitiesService.getAllActivityTypes().subscribe((t) => this.allActivityTypes.set(t));
    this.clubMembersService.getMembers(this.clubId()).subscribe((m) => this.clubMembersForEnroll.set(m));
  }

  // --- Activités ---

  openInlineForm(typeId: number): void {
    this.openFormForTypeId.set(typeId);
    this.inlineNewName.set('');
    this.inlineNewDescription.set('');
  }

  cancelInlineForm(): void {
    this.openFormForTypeId.set(null);
  }

  submitInlineCreate(type: ActivityType): void {
    if (!this.inlineNewName().trim() || this.inlineSaving()) return;
    const dto: ActivityCreateDto = {
      name: this.inlineNewName().trim(),
      description: this.inlineNewDescription().trim() || undefined,
      activityType: `/api/activity-types/${type.id}`,
    };
    this.inlineSaving.set(true);
    this.activitiesService.createActivity(this.clubId(), dto).subscribe({
      next: (activity) => {
        this.activityCreated.emit(activity);
        this.cancelInlineForm();
        this.inlineSaving.set(false);
      },
      error: () => this.inlineSaving.set(false),
    });
  }

  submitAddDiscipline(): void {
    const type = this.selectedType();
    if (!type || !this.disciplineNewName().trim() || this.disciplineSaving()) return;
    const dto: ActivityCreateDto = {
      name: this.disciplineNewName().trim(),
      description: this.disciplineNewDescription().trim() || undefined,
      activityType: `/api/activity-types/${type.id}`,
    };
    this.disciplineSaving.set(true);
    this.activitiesService.createActivity(this.clubId(), dto).subscribe({
      next: (activity) => {
        this.activityCreated.emit(activity);
        this.resetDisciplineForm();
        this.disciplineSaving.set(false);
      },
      error: () => this.disciplineSaving.set(false),
    });
  }

  resetDisciplineForm(): void {
    this.selectedType.set(null);
    this.disciplineNewName.set('');
    this.disciplineNewDescription.set('');
    this.showAddDisciplineForm.set(false);
  }

  onDelete(activityId: number): void {
    this.activityDeleted.emit(activityId);
  }

  // --- Niveaux ---

  selectActivity(activityId: number): void {
    if (this.selectedActivityId() === activityId) {
      this.selectedActivityId.set(null);
      this.levels.set([]);
      this.showLevelForm.set(false);
      return;
    }
    this.selectedActivityId.set(activityId);
    this.levels.set([]);
    this.showLevelForm.set(false);
    this.levelsLoading.set(true);
    this.levelsService.getLevels(activityId).subscribe({
      next: (lvls) => {
        this.levels.set(lvls);
        this.levelsLoading.set(false);
        this.loadMembers(activityId);
      },
      error: () => this.levelsLoading.set(false),
    });
  }

  submitAddLevel(): void {
    const activityId = this.selectedActivityId();
    const value = this.newLevelValue();
    if (!activityId || !value || this.levelSaving()) return;
    const dto: LevelCreateDto = {
      value,
      description: this.newLevelDescription().trim() || undefined,
    };
    this.levelSaving.set(true);
    this.levelsService.createLevel(activityId, dto).subscribe({
      next: (lvl) => {
        this.levels.update((l) => [...l, lvl]);
        this.newLevelValue.set(null);
        this.newLevelDescription.set('');
        this.showLevelForm.set(false);
        this.levelSaving.set(false);
      },
      error: () => this.levelSaving.set(false),
    });
  }

  deleteLevel(levelId: number): void {
    this.levels.update((l) => l.filter((x) => x.id !== levelId));
  }

  getLevelLabel(value: string): string {
    return LEVEL_VALUES.find((lv) => lv.value === value)?.label ?? value;
  }

  // --- Inscrits ---

  loadMembers(activityId: number): void {
    this.membersLoading.set(true);
    this.activityMembersService.getMembers(activityId).subscribe({
      next: (members) => {
        this.activityMembers.set(members);
        this.membersLoading.set(false);
      },
      error: () => this.membersLoading.set(false),
    });
  }

  submitEnroll(): void {
    const memberId = this.enrollMemberId();
    const activityId = this.selectedActivityId();
    if (!memberId || !activityId || this.enrollSaving()) return;
    this.enrollError.set(null);
    this.enrollSaving.set(true);
    const dto: EnrollMemberDto = { memberId, role: this.enrollRole() };
    this.activityMembersService.enrollMember(activityId, dto).subscribe({
      next: (m) => {
        this.activityMembers.update((list) => [...list, m]);
        this.enrollMemberId.set(null);
        this.enrollRole.set('STUDENT');
        this.enrollSaving.set(false);
      },
      error: (err) => {
        this.enrollError.set(err?.error?.detail ?? 'Erreur lors de l\'inscription.');
        this.enrollSaving.set(false);
      },
    });
  }

  approveEnrollment(id: number): void {
    this.activityMembersService.patchStatus(id, 'APPROVED').subscribe({
      next: (updated) => {
        this.activityMembers.update((list) =>
          list.map((m) => (m.id === id ? updated : m))
        );
      },
    });
  }

  rejectEnrollment(id: number): void {
    this.activityMembersService.patchStatus(id, 'REJECTED').subscribe({
      next: () => {
        this.activityMembers.update((list) => list.filter((m) => m.id !== id));
      },
    });
  }

  deleteEnrollment(id: number): void {
    this.activityMembersService.deleteMembership(id).subscribe({
      next: () => {
        this.activityMembers.update((list) => list.filter((m) => m.id !== id));
      },
    });
  }
}