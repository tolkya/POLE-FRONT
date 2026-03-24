import { Component, input, output, signal, inject, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Activity, ActivityType, ActivitiesService, ActivityCreateDto } from '../activities.service';
import { LevelsService, Level, LevelCreateDto } from './levels.service';
import { SkillsService, Skill, SkillCreateDto } from './skills.service';
import { Select } from 'primeng/select';
import { Accordion, AccordionPanel, AccordionHeader, AccordionContent } from 'primeng/accordion';
import { Badge } from 'primeng/badge';

interface ActivityGroup {
  type: ActivityType;
  items: Activity[];
}

// Toutes les valeurs possibles de l'enum LevelValue (côté back)
const LEVEL_VALUES = [
  { label: 'Novice',        value: 'NOVICE' },
  { label: 'Initiation',    value: 'INITIATION' },
  { label: 'Débutant',      value: 'DEBUTANT' },
  { label: 'Intermédiaire', value: 'INTERMEDIAIRE' },
  { label: 'Confirmé',      value: 'CONFIRME' },
  { label: 'Avancé',        value: 'AVANCE' },
  { label: 'Master',        value: 'MASTER' },
];

@Component({
  selector: 'app-activities-tab',
  imports: [FormsModule, Select, Accordion, AccordionPanel, AccordionHeader, AccordionContent, Badge],
  templateUrl: './activities-tab.html',
  styleUrl: './activities-tab.scss',
})
export class ActivitiesTab implements OnInit {
  private readonly activitiesService = inject(ActivitiesService);
  private readonly levelsService = inject(LevelsService);
  private readonly skillsService = inject(SkillsService);

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

  // Skills par niveau : Map<levelId, Skill[]>
  readonly skillsByLevel = signal<Map<number, Skill[]>>(new Map());
  readonly skillsLoadingFor = signal<number | null>(null);

  // Formulaire ajout skill
  readonly openSkillFormForLevelId = signal<number | null>(null);
  readonly newSkillName = signal('');
  readonly newSkillDescription = signal('');
  readonly skillSaving = signal(false);

  ngOnInit(): void {
    this.activitiesService.getAllActivityTypes().subscribe((t) => this.allActivityTypes.set(t));
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
      // Ferme le panneau si on reclique sur la même activité
      this.selectedActivityId.set(null);
      this.levels.set([]);
      this.skillsByLevel.set(new Map());
      this.showLevelForm.set(false);
      return;
    }
    this.selectedActivityId.set(activityId);
    this.levels.set([]);
    this.skillsByLevel.set(new Map());
    this.showLevelForm.set(false);
    this.levelsLoading.set(true);
    this.levelsService.getLevels(activityId).subscribe({
      next: (lvls) => {
        this.levels.set(lvls);
        this.levelsLoading.set(false);
        // Charger les skills de chaque niveau
        lvls.forEach((lvl) => this.loadSkills(lvl.id));
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
        this.skillsByLevel.update((m) => { m.set(lvl.id, []); return new Map(m); });
        this.newLevelValue.set(null);
        this.newLevelDescription.set('');
        this.showLevelForm.set(false);
        this.levelSaving.set(false);
      },
      error: () => this.levelSaving.set(false),
    });
  }

  deleteLevel(levelId: number): void {
    this.levelsService.deleteLevel(levelId).subscribe({
      next: () => {
        this.levels.update((l) => l.filter((x) => x.id !== levelId));
        this.skillsByLevel.update((m) => { m.delete(levelId); return new Map(m); });
      },
    });
  }

  getLevelLabel(value: string): string {
    return LEVEL_VALUES.find((lv) => lv.value === value)?.label ?? value;
  }

  // --- Skills ---

  loadSkills(levelId: number): void {
    this.skillsService.getSkills(levelId).subscribe({
      next: (skills) => {
        this.skillsByLevel.update((m) => { m.set(levelId, skills); return new Map(m); });
      },
    });
  }

  openSkillForm(levelId: number): void {
    this.openSkillFormForLevelId.set(levelId);
    this.newSkillName.set('');
    this.newSkillDescription.set('');
  }

  cancelSkillForm(): void {
    this.openSkillFormForLevelId.set(null);
  }

  submitAddSkill(levelId: number): void {
    if (!this.newSkillName().trim() || this.skillSaving()) return;
    const dto: SkillCreateDto = {
      name: this.newSkillName().trim(),
      description: this.newSkillDescription().trim() || undefined,
    };
    this.skillSaving.set(true);
    this.skillsService.createSkill(levelId, dto).subscribe({
      next: (skill) => {
        this.skillsByLevel.update((m) => {
          const current = m.get(levelId) ?? [];
          m.set(levelId, [...current, skill]);
          return new Map(m);
        });
        this.cancelSkillForm();
        this.skillSaving.set(false);
      },
      error: () => this.skillSaving.set(false),
    });
  }

  deleteSkill(levelId: number, skillId: number): void {
    this.skillsService.deleteSkill(skillId).subscribe({
      next: () => {
        this.skillsByLevel.update((m) => {
          m.set(levelId, (m.get(levelId) ?? []).filter((s) => s.id !== skillId));
          return new Map(m);
        });
      },
    });
  }

  getSkills(levelId: number): Skill[] {
    return this.skillsByLevel().get(levelId) ?? [];
  }
}