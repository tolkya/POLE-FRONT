import { Component, input, output, OnChanges, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { Activity, ActivityType, ActivityCreateDto, ActivityUpdateDto } from '../../../../../core/models';
import { ActivitiesService } from '../../../../../core/services/activities.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { signal } from '@angular/core';

@Component({
  selector: 'app-activity-form-dialog',
  imports: [DialogModule, ButtonModule, SelectModule, InputTextModule, TextareaModule, ReactiveFormsModule],
  templateUrl: './activity-form-dialog.html',
  styleUrl: './activity-form-dialog.scss',
})
export class ActivityFormDialog implements OnChanges {
  readonly visible          = input<boolean>(false);
  readonly activity         = input<Activity | null>(null);
  readonly allActivityTypes = input<ActivityType[]>([]);

  readonly visibleChange    = output<boolean>();
  readonly create           = output<ActivityCreateDto>();
  readonly update           = output<{ id: number } & ActivityUpdateDto>();
  readonly typeCreated      = output<ActivityType>(); // notifie le parent qu'un type a été créé

  private readonly activitiesService = inject(ActivitiesService);
  private readonly toast             = inject(ToastService);

  readonly form: FormGroup;
  readonly newTypeForm: FormGroup;

  showNewTypeForm = signal(false);
  creatingType    = signal(false);

  get typeOptions(): { label: string; value: number }[] {
    return this.allActivityTypes().map(t => ({ label: t.name, value: t.id }));
  }

  get isEditMode(): boolean { return this.activity() !== null; }
  get title(): string { return this.isEditMode ? "Modifier l'activité" : 'Ajouter une activité'; }

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      activityTypeId: [null, Validators.required],
      name:           ['', [Validators.required, Validators.maxLength(100)]],
      description:    [''],
    });
    this.newTypeForm = this.fb.group({
      name:        ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
    });
  }

  ngOnChanges(): void {
    const a = this.activity();
    if (a) {
      this.form.patchValue({
        activityTypeId: a.activityType.id,
        name:           a.name,
        description:    a.description ?? '',
      });
      this.form.get('activityTypeId')?.disable();
    } else {
      this.form.reset();
      this.form.get('activityTypeId')?.enable();
      this.showNewTypeForm.set(false);
      this.newTypeForm.reset();
    }
  }

  toggleNewTypeForm(): void {
    this.showNewTypeForm.update(v => !v);
    if (!this.showNewTypeForm()) this.newTypeForm.reset();
  }

  submitNewType(): void {
    if (this.newTypeForm.invalid) return;
    this.creatingType.set(true);
    const val = this.newTypeForm.value;
    this.activitiesService.createActivityType({ name: val.name, description: val.description || undefined }).subscribe({
      next: (type) => {
        this.toast.success(`Discipline "${type.name}" créée`);
        this.typeCreated.emit(type);
        // Sélectionner automatiquement la discipline fraîchement créée
        this.form.get('activityTypeId')?.setValue(type.id);
        this.showNewTypeForm.set(false);
        this.newTypeForm.reset();
        this.creatingType.set(false);
      },
      error: () => {
        this.toast.error('Erreur lors de la création de la discipline');
        this.creatingType.set(false);
      },
    });
  }

  onSave(): void {
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    const a = this.activity();
    if (a) {
      this.update.emit({ id: a.id, name: val.name, description: val.description || undefined });
    } else {
      this.create.emit({
        activityType: `/api/activity-types/${val.activityTypeId}`,
        name:         val.name,
        description:  val.description || undefined,
      });
    }
    this.visibleChange.emit(false);
  }

  onHide(): void { this.visibleChange.emit(false); }
}