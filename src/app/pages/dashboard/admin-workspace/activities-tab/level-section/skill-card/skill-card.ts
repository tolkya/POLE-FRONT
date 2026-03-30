import { Component, input, output, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SkillsService } from '../../../../../../core/services/skills.service';
import { Skill } from '../../../../../../core/models';
import { SkillMediaTutosService } from '../../../../../../core/services/skill-media-tutos.service';
import { SkillMediaTuto } from '../../../../../../core/models';
import { environment } from '../../../../../../../environments/environment';

@Component({
  selector: 'app-skill-card',
  imports: [FormsModule],
  templateUrl: './skill-card.html',
  styleUrl: './skill-card.scss',
})
export class SkillCard {
  private readonly skillMediaTutosService = inject(SkillMediaTutosService);
  private readonly skillsService = inject(SkillsService);

  /** URL du serveur back (sans /api) pour préfixer les chemins médias */
  private readonly backendUrl = environment.api.baseUrl.replace(/\/api$/, '');

  readonly skill = input.required<Skill>();
  readonly canManage = input<boolean>(false);
  readonly currentUserId = input<number | null>(null);

  readonly skillDeleted = output<number>();
  readonly skillUpdated = output<Skill>();

  readonly uploading = signal(false);
  readonly editing = signal(false);
  readonly editName = signal('');
  readonly editDescription = signal('');
  readonly editSaving = signal(false);
  readonly previewTuto = signal<SkillMediaTuto | null>(null);

  readonly isCreator = computed(() =>
    this.skill().createdBy?.id === this.currentUserId()
  );

  readonly canEdit = computed(() => this.canManage() || this.isCreator());

  isImage(mimetype: string | null): boolean {
    return mimetype?.startsWith('image/') ?? false;
  }

  isVideo(mimetype: string | null): boolean {
    return mimetype?.startsWith('video/') ?? false;
  }

  getMediaUrl(tuto: SkillMediaTuto): string {
    if (!tuto.mediaUrl) return '';
    if (tuto.mediaUrl.startsWith('http')) return tuto.mediaUrl;
    return this.backendUrl + tuto.mediaUrl;
  }

  openPreview(tuto: SkillMediaTuto): void {
    this.previewTuto.set(tuto);
  }

  closePreview(): void {
    this.previewTuto.set(null);
  }

  canDeleteTuto(_tuto: SkillMediaTuto): boolean {
    return this.canManage() || this.isCreator();
  }

  startEdit(): void {
    this.editName.set(this.skill().name);
    this.editDescription.set(this.skill().description ?? '');
    this.editing.set(true);
  }

  cancelEdit(): void {
    this.editing.set(false);
  }

  submitEdit(): void {
    if (!this.editName().trim() || this.editSaving()) return;
    this.editSaving.set(true);
    this.skillsService.updateSkill(this.skill().id, {
      name: this.editName().trim(),
      description: this.editDescription().trim() || undefined,
    }).subscribe({
      next: (updated) => {
        this.skillUpdated.emit(updated);
        this.editing.set(false);
        this.editSaving.set(false);
      },
      error: () => this.editSaving.set(false),
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || this.uploading()) return;
    this.uploading.set(true);
    this.skillMediaTutosService.upload(this.skill().id, file).subscribe({
      next: (tuto) => {
        const updated: Skill = {
          ...this.skill(),
          skillMediaTutos: [...this.skill().skillMediaTutos, tuto],
        };
        this.skillUpdated.emit(updated);
        this.uploading.set(false);
        input.value = '';
      },
      error: () => this.uploading.set(false),
    });
  }

  deleteTuto(tutoId: number): void {
    this.skillMediaTutosService.delete(tutoId).subscribe({
      next: () => {
        const updated: Skill = {
          ...this.skill(),
          skillMediaTutos: this.skill().skillMediaTutos.filter((t) => t.id !== tutoId),
        };
        this.skillUpdated.emit(updated);
      },
    });
  }

  onDeleteSkill(): void {
    if (!this.canManage()) return;
    this.skillsService.deleteSkill(this.skill().id).subscribe({
      next: () => this.skillDeleted.emit(this.skill().id),
    });
  }
}
