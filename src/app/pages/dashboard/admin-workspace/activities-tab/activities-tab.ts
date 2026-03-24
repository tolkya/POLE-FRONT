import { Component, input, output, signal, inject, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Activity, ActivityType, ActivitiesService, ActivityCreateDto } from '../activities.service';
import { Select } from 'primeng/select';
import { Accordion, AccordionPanel, AccordionHeader, AccordionContent } from 'primeng/accordion';
import { Badge } from 'primeng/badge';

interface ActivityGroup {
  type: ActivityType;
  items: Activity[];
}

@Component({
  selector: 'app-activities-tab',
  imports: [FormsModule, Select, Accordion, AccordionPanel, AccordionHeader, AccordionContent, Badge],
  templateUrl: './activities-tab.html',
  styleUrl: './activities-tab.scss',
})
export class ActivitiesTab implements OnInit {
  private readonly activitiesService = inject(ActivitiesService);

  readonly clubId = input.required<number>();
  readonly activities = input.required<Activity[]>();

  readonly activityDeleted = output<number>();
  readonly activityCreated = output<Activity>();

  readonly allActivityTypes = signal<ActivityType[]>([]);

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

  ngOnInit(): void {
    this.activitiesService.getAllActivityTypes().subscribe((t) => this.allActivityTypes.set(t));
  }

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
}