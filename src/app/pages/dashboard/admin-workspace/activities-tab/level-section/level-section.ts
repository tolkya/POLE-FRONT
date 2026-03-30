import { Component, input, output, signal, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { switchMap } from 'rxjs';
import { LevelsService, LEVEL_VALUES } from '../../../../../core/services/levels.service';
import { SkillsService } from '../../../../../core/services/skills.service';
import { Level, Skill, SkillCreateDto } from '../../../../../core/models';
import { SkillMediaTutosService } from '../../../../../core/services/skill-media-tutos.service';
import { SkillCard } from './skill-card/skill-card';

@Component({
  selector: 'app-level-section',
  imports: [FormsModule, SkillCard],
  templateUrl: './level-section.html',
  styleUrl: './level-section.scss',
})
export class LevelSection implements OnInit {
  private readonly levelsService = inject(LevelsService);
  private readonly skillsService = inject(SkillsService);
  private readonly skillMediaTutosService = inject(SkillMediaTutosService);

  readonly level = input.required<Level>();
  readonly canManage = input<boolean>(false);
  readonly currentUserId = input<number | null>(null);

  readonly levelDeleted = output<number>();

  readonly skills = signal<Skill[]>([]);
  readonly skillsLoading = signal(false);
  readonly showSkillForm = signal(false);
  readonly newSkillName = signal('');
  readonly newSkillDescription = signal('');
  readonly newSkillFile = signal<File | null>(null);
  readonly skillSaving = signal(false);

  getLevelLabel(): string {
    return LEVEL_VALUES.find((lv) => lv.value === this.level().value)?.label ?? this.level().value;
  }

  ngOnInit(): void {
    this.skillsLoading.set(true);
    this.skillsService.getSkills(this.level().id).subscribe({
      next: (skills) => {
        this.skills.set(skills);
        this.skillsLoading.set(false);
      },
      error: () => this.skillsLoading.set(false),
    });
  }

  onDeleteLevel(): void {
    this.levelsService.deleteLevel(this.level().id).subscribe({
      next: () => this.levelDeleted.emit(this.level().id),
    });
  }

  openSkillForm(): void {
    this.showSkillForm.set(true);
    this.newSkillName.set('');
    this.newSkillDescription.set('');
    this.newSkillFile.set(null);
  }

  cancelSkillForm(): void {
    this.showSkillForm.set(false);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.newSkillFile.set(input.files?.[0] ?? null);
  }

  submitAddSkill(): void {
    if (!this.newSkillName().trim() || this.skillSaving()) return;
    const dto: SkillCreateDto = {
      name: this.newSkillName().trim(),
      description: this.newSkillDescription().trim() || undefined,
    };
    const file = this.newSkillFile();
    this.skillSaving.set(true);

    if (file) {
      // Créer le skill puis uploader le fichier
      this.skillsService.createSkill(this.level().id, dto).pipe(
        switchMap((skill) =>
          this.skillMediaTutosService.upload(skill.id, file).pipe(
            switchMap(() => this.skillsService.getSkills(this.level().id))
          )
        )
      ).subscribe({
        next: (skills) => {
          this.skills.set(skills);
          this.resetForm();
        },
        error: () => this.skillSaving.set(false),
      });
    } else {
      // Créer le skill sans fichier
      this.skillsService.createSkill(this.level().id, dto).subscribe({
        next: (skill) => {
          this.skills.update((s) => [...s, skill]);
          this.resetForm();
        },
        error: () => this.skillSaving.set(false),
      });
    }
  }

  private resetForm(): void {
    this.showSkillForm.set(false);
    this.newSkillName.set('');
    this.newSkillDescription.set('');
    this.newSkillFile.set(null);
    this.skillSaving.set(false);
  }

  onSkillDeleted(skillId: number): void {
    this.skills.update((s) => s.filter((x) => x.id !== skillId));
  }

  onSkillUpdated(updated: Skill): void {
    this.skills.update((s) => s.map((x) => (x.id === updated.id ? updated : x)));
  }
}
