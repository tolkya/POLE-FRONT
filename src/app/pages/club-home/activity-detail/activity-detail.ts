import { Component, inject, OnInit, signal, computed, HostListener } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MyActivitiesService } from '../../../core/services/my-activities.service';
import { LevelsService } from '../../../core/services/levels.service';
import { SkillsService } from '../../../core/services/skills.service';
import { SkillMediaTutosService } from '../../../core/services/skill-media-tutos.service';
import { UserClubsService } from '../../../core/services/user-clubs.service';
import { AuthService } from '../../../core/services/auth.service';
import { Level } from '../../../core/models/level.model';
import { Skill, SkillMediaTuto } from '../../../core/models/skill.model';
import { MyActivity } from '../../../core/models/user-activity.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { LevelFormDialog } from './level-form-dialog/level-form-dialog';
import { SkillFormDialog } from './skill-form-dialog/skill-form-dialog';
import { EnrollmentsDialog } from './enrollments-dialog/enrollments-dialog';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-activity-detail',
  imports: [RouterLink, AccordionModule, ButtonModule, DialogModule, LevelFormDialog, SkillFormDialog, EnrollmentsDialog],
  templateUrl: './activity-detail.html',
  styleUrl: './activity-detail.scss',
})
export class ActivityDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly myActivitiesService = inject(MyActivitiesService);
  private readonly levelsService = inject(LevelsService);
  private readonly skillsService = inject(SkillsService);
  private readonly skillMediaTutosService = inject(SkillMediaTutosService);
  private readonly userClubsService = inject(UserClubsService);
  private readonly authService = inject(AuthService);

  readonly clubId = computed(() => Number(this.route.snapshot.paramMap.get('id')));
  readonly activityId = computed(() => Number(this.route.snapshot.paramMap.get('activityId')));

  readonly loading = signal(true);
  readonly levels = signal<Level[]>([]);
  readonly skillsByLevel = signal<Map<number, Skill[]>>(new Map());
  readonly loadingSkills = signal<Set<number>>(new Set());

  // ── Lightbox ──────────────────────────────────────────────────────────────
  readonly lightboxVisible = signal(false);
  readonly lightboxMedias = signal<SkillMediaTuto[]>([]);
  readonly lightboxIndex = signal(0);
  readonly lightboxSkill = signal<Skill | null>(null); // skill affiché dans la lightbox

  readonly lightboxCurrent = computed(() =>
    this.lightboxMedias()[this.lightboxIndex()] ?? null
  );

  // ── Level form dialog ─────────────────────────────────────────────────────
  readonly levelFormVisible = signal(false);
  readonly levelFormSaving  = signal(false);
  readonly levelFormTarget  = signal<Level | null>(null); // null = création

  openLevelCreate(): void {
    this.levelFormTarget.set(null);
    this.levelFormVisible.set(true);
  }

  openLevelEdit(level: Level, event: Event): void {
    event.stopPropagation(); // empêche l'accordéon de se fermer
    this.levelFormTarget.set(level);
    this.levelFormVisible.set(true);
  }

  onLevelFormSave(data: { name: string; description: string | null }): void {
    this.levelFormSaving.set(true);
    const target = this.levelFormTarget();

    if (target) {
      this.levelsService.updateLevel(target.id, { name: data.name, description: data.description }).subscribe({
        next: (updated) => {
          this.levels.update(list => list.map(l => l.id === updated.id ? updated : l));
          this.levelFormVisible.set(false);
        },
        complete: () => this.levelFormSaving.set(false),
        error:    () => this.levelFormSaving.set(false),
      });
    } else {
      this.levelsService.createLevel(this.activityId(), { name: data.name, description: data.description ?? undefined }).subscribe({
        next: (created) => {
          this.levels.update(list => [...list, created]);
          this.levelFormVisible.set(false);
        },
        complete: () => this.levelFormSaving.set(false),
        error:    () => this.levelFormSaving.set(false),
      });
    }
  }

  deleteLevel(level: Level, event: Event): void {
    event.stopPropagation();
    if (!confirm(`Supprimer le niveau "${level.name}" ? Cette action est irréversible.`)) return;
    this.levelsService.deleteLevel(level.id).subscribe({
      next: () => {
        this.levels.update(list => list.filter(l => l.id !== level.id));
        // Nettoie les skills chargés pour ce level
        this.skillsByLevel.update(map => { map.delete(level.id); return new Map(map); });
      },
    });
  }

  reorderLevel(level: Level, direction: 'up' | 'down', event: Event): void {
    event.stopPropagation();
    const list = [...this.levels()];
    const idx  = list.findIndex(l => l.id === level.id);

    if (direction === 'up'   && idx === 0)               return;
    if (direction === 'down' && idx === list.length - 1) return;

    const swapIdx          = direction === 'up' ? idx - 1 : idx + 1;
    [list[idx], list[swapIdx]] = [list[swapIdx], list[idx]];

    this.levels.set(list);
    this.levelsService.reorder(this.activityId(), list.map(l => l.id)).subscribe();
  }

  // ── Skill form dialog ─────────────────────────────────────────────────────
  readonly skillFormVisible = signal(false);
  readonly skillFormSaving  = signal(false);
  readonly skillFormTarget  = signal<Skill | null>(null);  // null = création
  readonly skillFormLevelId = signal<number | null>(null); // level cible pour la création

  openSkillCreate(levelId: number): void {
    this.skillFormLevelId.set(levelId);
    this.skillFormTarget.set(null);
    this.skillFormVisible.set(true);
  }

  openSkillEdit(skill: Skill): void {
    this.skillFormTarget.set(skill);
    this.skillFormVisible.set(true);
  }

  onSkillFormSave(data: { name: string; description: string | null }): void {
    this.skillFormSaving.set(true);
    const target = this.skillFormTarget();
    const dto = { name: data.name, description: data.description ?? undefined };

    if (target) {
      // Édition : PATCH
      this.skillsService.updateSkill(target.id, dto).subscribe({
        next: (updated) => {
          this.skillsByLevel.update(map => {
            // Trouve le level qui contient ce skill et met à jour
            for (const [levelId, skills] of map) {
              const idx = skills.findIndex(s => s.id === updated.id);
              if (idx !== -1) {
                const newSkills = [...skills];
                newSkills[idx] = updated;
                map.set(levelId, newSkills);
                break;
              }
            }
            return new Map(map);
          });
          this.skillFormVisible.set(false);
        },
        complete: () => this.skillFormSaving.set(false),
        error:    () => this.skillFormSaving.set(false),
      });
    } else {
      // Création : POST
      const levelId = this.skillFormLevelId()!;
      this.skillsService.createSkill(levelId, dto).subscribe({
        next: (created) => {
          this.skillsByLevel.update(map => {
            const existing = map.get(levelId) ?? [];
            map.set(levelId, [...existing, created]);
            return new Map(map);
          });
          this.skillFormVisible.set(false);
        },
        complete: () => this.skillFormSaving.set(false),
        error:    () => this.skillFormSaving.set(false),
      });
    }
  }

  deleteSkill(skill: Skill, levelId: number): void {
    if (!confirm(`Supprimer la compétence "${skill.name}" ? Cette action est irréversible.`)) return;
    this.skillsService.deleteSkill(skill.id).subscribe({
      next: () => {
        this.skillsByLevel.update(map => {
          const skills = map.get(levelId) ?? [];
          map.set(levelId, skills.filter(s => s.id !== skill.id));
          return new Map(map);
        });
      },
    });
  }

  // ── Enrollments dialog ─────────────────────────────────────────────
  readonly enrollmentsVisible = signal(false);

  // ── Upload / suppression médias ───────────────────────────────────────────
  readonly uploadingSkillId = signal<number | null>(null);

  onFileSelected(event: Event, skill: Skill): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    // Réinitialise la valeur pour permettre de re-sélectionner le même fichier
    input.value = '';

    this.uploadingSkillId.set(skill.id);
    this.skillMediaTutosService.upload(skill.id, file).subscribe({
      next: (tuto) => {
        this.skillsByLevel.update(map => {
          for (const [levelId, skills] of map) {
            const idx = skills.findIndex(s => s.id === skill.id);
            if (idx !== -1) {
              const newSkills = [...skills];
              newSkills[idx] = {
                ...newSkills[idx],
                skillMediaTutos: [...newSkills[idx].skillMediaTutos, tuto],
              };
              map.set(levelId, newSkills);
              break;
            }
          }
          return new Map(map);
        });
        // Met à jour la lightbox si elle est ouverte sur ce skill
        if (this.lightboxVisible() && this.lightboxMedias().some(m => skill.skillMediaTutos.includes(m))) {
          this.lightboxMedias.update(list => [...list, tuto]);
        }
      },
      complete: () => this.uploadingSkillId.set(null),
      error:    () => this.uploadingSkillId.set(null),
    });
  }

  deleteMedia(tutoId: number, skill: Skill): void {
    if (!confirm('Supprimer ce média ? Cette action est irréversible.')) return;
    this.skillMediaTutosService.delete(tutoId).subscribe({
      next: () => {
        this.skillsByLevel.update(map => {
          for (const [levelId, skills] of map) {
            const idx = skills.findIndex(s => s.id === skill.id);
            if (idx !== -1) {
              const newSkills = [...skills];
              newSkills[idx] = {
                ...newSkills[idx],
                skillMediaTutos: newSkills[idx].skillMediaTutos.filter(m => m.id !== tutoId),
              };
              map.set(levelId, newSkills);
              break;
            }
          }
          return new Map(map);
        });
        // Met à jour la lightbox si elle est ouverte
        this.lightboxMedias.update(list => list.filter(m => m.id !== tutoId));
        if (this.lightboxMedias().length === 0) {
          this.lightboxVisible.set(false);
        } else if (this.lightboxIndex() >= this.lightboxMedias().length) {
          this.lightboxIndex.set(this.lightboxMedias().length - 1);
        }
      },
    });
  }

  readonly myActivityEntry = computed<MyActivity | undefined>(() =>
    this.myActivitiesService.myActivities().find(a => a.activity.id === this.activityId())
  );

  readonly isApproved = computed(() => this.myActivityEntry()?.status === 'APPROVED');

  // ── Rôles ─────────────────────────────────────────────────────────────────
  /** True si l'utilisateur est Teacher de cette activité spécifique */
  readonly isTeacher = computed(() =>
    this.myActivitiesService.isTeacherOf(this.activityId())
  );

  /** True si l'utilisateur est Admin du club */
  readonly isAdmin = computed(() =>
    this.userClubsService.userClubs().some(
      uc => uc.club.id === this.clubId() && uc.roles.includes('ADMIN')
    )
  );

  /** True si l'utilisateur peut créer/modifier du contenu pédagogique */
  readonly canManageContent = computed(() => this.isTeacher() || this.isAdmin());

  /** True si l'utilisateur peut modifier/supprimer un level spécifique */
  canEditLevel(level: Level): boolean {
    if (this.isAdmin()) return true;
    return this.isTeacher() && !!level.createdBy && this.isCurrentUser(level.createdBy.id);
  }

  /** True si l'utilisateur peut modifier/supprimer un skill spécifique */
  canEditSkill(skill: Skill): boolean {
    if (this.isAdmin()) return true;
    return this.isTeacher() && !!skill.createdBy && this.isCurrentUser(skill.createdBy.id);
  }

  /** True si l'utilisateur peut uploader/supprimer un média sur un skill */
  canEditMedia(skill: Skill): boolean {
    return this.canEditSkill(skill);
  }

  isCurrentUser(userId: number): boolean {
    return this.authService.currentUser()?.id === userId;
  }

  readonly mediaBaseUrl = environment.api.mediaBaseUrl;

  // Retourne les médias avec une url valide uniquement
  readonly validMedias = (skill: Skill): SkillMediaTuto[] =>
    skill.skillMediaTutos.filter(t => t.mediaUrl);

  openLightbox(skill: Skill, index: number): void {
    this.lightboxSkill.set(skill);
    this.lightboxMedias.set(this.validMedias(skill));
    this.lightboxIndex.set(index);
    this.lightboxVisible.set(true);
  }

  closeLightbox(): void {
    this.lightboxVisible.set(false);
  }

  prevMedia(): void {
    const len = this.lightboxMedias().length;
    this.lightboxIndex.set((this.lightboxIndex() - 1 + len) % len);
  }

  nextMedia(): void {
    const len = this.lightboxMedias().length;
    this.lightboxIndex.set((this.lightboxIndex() + 1) % len);
  }

  @HostListener('document:keydown', ['$event'])
  onKey(event: KeyboardEvent): void {
    if (!this.lightboxVisible()) return;
    if (event.key === 'ArrowLeft') this.prevMedia();
    if (event.key === 'ArrowRight') this.nextMedia();
  }

  ngOnInit(): void {
    const load = () => {
      this.levelsService.getLevels(this.activityId()).subscribe({
        next: (lvls) => this.levels.set(lvls),
        complete: () => this.loading.set(false),
        error: () => this.loading.set(false),
      });
    };

    if (this.myActivitiesService.myActivities().length === 0) {
      this.myActivitiesService.fetchMyActivities(this.clubId()).subscribe({
        next: () => load(),
        error: () => {
          this.loading.set(false);
          this.router.navigate(['/club', this.clubId()]);
        },
      });
    } else {
      load();
    }
  }

  onLevelOpen(levelId: number): void {
    if (this.skillsByLevel().has(levelId)) return;

    const set = new Set(this.loadingSkills());
    set.add(levelId);
    this.loadingSkills.set(set);

    this.skillsService.getSkills(levelId).subscribe({
      next: (skills) => {
        const map = new Map(this.skillsByLevel());
        map.set(levelId, skills);
        this.skillsByLevel.set(map);
      },
      complete: () => {
        const s = new Set(this.loadingSkills());
        s.delete(levelId);
        this.loadingSkills.set(s);
      },
    });
  }
}