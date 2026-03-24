import { Component, input, output, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { Activity, ActivityType, ActivitiesService, ActivityCreateDto } from '../activities.service';

@Component({
  selector: 'app-activities-tab',
  imports: [FormsModule],
  templateUrl: './activities-tab.html',
  styleUrl: './activities-tab.scss',
})
export class ActivitiesTab {
  private readonly activitiesService = inject(ActivitiesService);

  readonly clubId = input.required<number>();
  readonly activities = input.required<Activity[]>();

  readonly activityDeleted = output<number>();
  readonly activityCreated = output<Activity>();

  readonly showForm = signal(false);
  readonly saving = signal(false);
  readonly newName = signal('');
  readonly newDescription = signal('');
  readonly typeSearch = signal('');
  readonly selectedType = signal<ActivityType | null>(null);
  readonly typeSuggestions = signal<ActivityType[]>([]);

  private readonly typeSearch$ = new Subject<string>();

  constructor() {
    this.typeSearch$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((q) =>
          q.length >= 2
            ? this.activitiesService.searchActivityTypes(q)
            : [[]]
        )
      )
      .subscribe((types) => this.typeSuggestions.set(types as ActivityType[]));
  }

  onTypeInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.typeSearch.set(val);
    this.selectedType.set(null);
    this.typeSearch$.next(val);
  }

  selectType(type: ActivityType): void {
    this.selectedType.set(type);
    this.typeSearch.set(type.name);
    this.typeSuggestions.set([]);
  }

  submitCreate(): void {
    const type = this.selectedType();
    if (!type || !this.newName().trim() || this.saving()) return;

    const dto: ActivityCreateDto = {
      name: this.newName().trim(),
      description: this.newDescription().trim() || undefined,
      activityType: `/api/activity-types/${type.id}`,
    };

    this.saving.set(true);
    this.activitiesService.createActivity(this.clubId(), dto).subscribe({
      next: (activity) => {
        this.activityCreated.emit(activity);
        this.resetForm();
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }

  onDelete(activityId: number): void {
    this.activityDeleted.emit(activityId);
  }

  resetForm(): void {
    this.newName.set('');
    this.newDescription.set('');
    this.typeSearch.set('');
    this.selectedType.set(null);
    this.typeSuggestions.set([]);
    this.showForm.set(false);
  }
}