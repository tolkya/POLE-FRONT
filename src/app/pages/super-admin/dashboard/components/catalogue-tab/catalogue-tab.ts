import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivityTypeService, ActivityType, ActivityTypeCreateDto } from './activity-type.service';

@Component({
  selector: 'app-catalogue-tab',
  imports: [FormsModule],
  templateUrl: './catalogue-tab.html',
  styleUrl: './catalogue-tab.scss',
})
export class CatalogueTab implements OnInit {
  private readonly activityTypeService = inject(ActivityTypeService);

  readonly types = signal<ActivityType[]>([]);
  readonly showForm = signal(false);
  readonly saving = signal(false);
  readonly newName = signal('');
  readonly newDescription = signal('');

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.activityTypeService.getAll().subscribe((t) => this.types.set(t));
  }

  submitCreate(): void {
    if (!this.newName().trim() || this.saving()) return;
    const dto: ActivityTypeCreateDto = {
      name: this.newName().trim(),
      description: this.newDescription().trim() || undefined,
    };
    this.saving.set(true);
    this.activityTypeService.create(dto).subscribe({
      next: (t) => {
        this.types.update((list) => [...list, t]);
        this.resetForm();
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }

  toggleStatus(type: ActivityType): void {
    const next = type.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    this.activityTypeService.toggleStatus(type.id, next).subscribe((updated) => {
      this.types.update((list) =>
        list.map((t) => (t.id === updated.id ? updated : t))
      );
    });
  }

  delete(id: number): void {
    this.activityTypeService.delete(id).subscribe(() => {
      this.types.update((list) => list.filter((t) => t.id !== id));
    });
  }

  resetForm(): void {
    this.newName.set('');
    this.newDescription.set('');
    this.showForm.set(false);
  }
}