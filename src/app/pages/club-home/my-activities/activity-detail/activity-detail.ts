import { Component, inject, OnInit, signal, computed, HostListener } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MyActivitiesService } from '../../../../core/services/my-activities.service';
import { LevelsService } from '../../../../core/services/levels.service';
import { SkillsService } from '../../../../core/services/skills.service';
import { Level, LEVEL_VALUES } from '../../../../core/models/level.model';
import { Skill, SkillMediaTuto } from '../../../../core/models/skill.model';
import { MyActivity } from '../../../../core/models/user-activity.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-activity-detail',
  imports: [RouterLink, AccordionModule, ButtonModule, DialogModule],
  templateUrl: './activity-detail.html',
  styleUrl: './activity-detail.scss',
})
export class ActivityDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly myActivitiesService = inject(MyActivitiesService);
  private readonly levelsService = inject(LevelsService);
  private readonly skillsService = inject(SkillsService);

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

  readonly lightboxCurrent = computed(() =>
    this.lightboxMedias()[this.lightboxIndex()] ?? null
  );

  readonly myActivityEntry = computed<MyActivity | undefined>(() =>
    this.myActivitiesService.myActivities().find(a => a.activity.id === this.activityId())
  );

  readonly isApproved = computed(() => this.myActivityEntry()?.status === 'APPROVED');

  readonly mediaBaseUrl = environment.api.mediaBaseUrl;

  readonly levelLabel = (value: string): string =>
    LEVEL_VALUES.find(l => l.value === value)?.label ?? value;

  // Retourne les médias avec une url valide uniquement
  readonly validMedias = (skill: Skill): SkillMediaTuto[] =>
    skill.skillMediaTutos.filter(t => t.mediaUrl);

  openLightbox(skill: Skill, index: number): void {
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
          this.router.navigate(['/club', this.clubId(), 'my-activities']);
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