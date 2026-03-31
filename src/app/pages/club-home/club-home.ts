import { Component, inject, signal, computed, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ClubService } from '../../core/services/club.service';
import { UserClubsService } from '../../core/services/user-clubs.service';
import { ToastService } from '../../core/services/toast.service';
import { Club } from '../../core/models/club.model';
import { JoinClubDialog } from '../../shared/components/join-club-dialog/join-club-dialog';
import { SkeletonModule } from 'primeng/skeleton';
import { ClubHero } from './club-hero/club-hero';
import { ClubStats } from './club-stats/club-stats';
import { ClubActivityBoards } from './club-activity-boards/club-activity-boards';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-club-home',
  imports: [CommonModule, SkeletonModule, ClubHero, ClubStats, ClubActivityBoards, JoinClubDialog],
  templateUrl: './club-home.html',
  styleUrl: './club-home.scss',
})
export class ClubHome implements OnInit, OnDestroy {
  // Injecte le thème du club comme variables CSS sur l'élément hôte
  // Tous les composants enfants héritent de ces variables par cascade
  @HostBinding('style')
  get hostStyles(): Record<string, string> {
    const hex = this.club()?.themeColor ?? '#7c3aed';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return {
      '--club-primary':          hex,
      '--club-primary-hover':    this.shiftColor(r, g, b, 0.88),
      '--club-primary-light':    `rgba(${r}, ${g}, ${b}, 0.06)`,
      '--club-primary-subtle':   `rgba(${r}, ${g}, ${b}, 0.12)`,
      '--club-primary-dark':     this.shiftColor(r, g, b, 0.8),
      '--club-on-primary':       this.contrastColor(r, g, b),
      '--club-surface-tinted':   `rgba(${r}, ${g}, ${b}, 0.02)`,
      '--club-surface-accent':   `rgba(${r}, ${g}, ${b}, 0.06)`,
      '--club-border':           `rgba(${r}, ${g}, ${b}, 0.12)`,
      '--club-border-accent':    `rgba(${r}, ${g}, ${b}, 0.22)`,
      '--club-text-accent':      hex,
      '--club-text-on-light':    this.shiftColor(r, g, b, 0.8),
      '--club-badge-bg':         `rgba(${r}, ${g}, ${b}, 0.12)`,
      '--club-badge-text':       this.shiftColor(r, g, b, 0.8),
      '--club-shadow':           `0 4px 24px rgba(${r}, ${g}, ${b}, 0.08)`,
      '--club-shadow-hover':     `0 8px 32px rgba(${r}, ${g}, ${b}, 0.14)`,
    };
  }

  /** Assombrit/éclaircit une couleur. factor < 1 = plus sombre. */
  private shiftColor(r: number, g: number, b: number, factor: number): string {
    return `rgb(${Math.round(r * factor)}, ${Math.round(g * factor)}, ${Math.round(b * factor)})`;
  }

  /** Retourne blanc ou noir selon la luminance du fond. */
  private contrastColor(r: number, g: number, b: number): string {
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5 ? '#1a1a2e' : '#ffffff';
  }
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly clubService = inject(ClubService);
  private readonly userClubsService = inject(UserClubsService);
  private readonly toast = inject(ToastService);
  private paramSub?: Subscription;

  /** Contrôle l'ouverture du dialog rejoindre (depuis le bouton S'inscrire du hero) */
  showJoinDialog = signal(false);

  club = signal<Club | null>(null);
  loading = signal(true);

  private myUserClub = computed(() => {
    const id = this.club()?.id;
    if (!id) return null;
    return this.userClubsService.userClubs().find(uc => uc.club.id === id) ?? null;
  });

  isAdmin = computed(() => this.myUserClub()?.roles.includes('ADMIN') ?? false);
  isTeacher = computed(() => this.myUserClub()?.roles.includes('TEACHER') ?? false);
  isMember = computed(() => this.myUserClub() !== null);

  logoAbsoluteUrl = computed(() => {
    const url = this.club()?.logoUrl;
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const base = environment.api.baseUrl.replace('/api', '');
    return base + url;
  });

  /** Rôle de l'utilisateur dans ce club spécifique */
  userRole = computed<'ADMIN' | 'TEACHER' | 'MEMBRE' | null>(() => {
    const uc = this.myUserClub();
    if (!uc) return null;
    if (uc.roles.includes('ADMIN')) return 'ADMIN';
    if (uc.roles.includes('TEACHER')) return 'TEACHER';
    return 'MEMBRE';
  });

  /** ActivityTypes distincts du club (alimenté par ClubBoards) */
  activityTypes = signal<{ id: number; name: string }[]>([]);

  /** Stats du club — activitiesCount mis à jour par ClubActivityBoards via output */
  membersCount = signal(0);
  activitiesCount = signal(0);
  teachersCount = signal(0);

  onActivitiesCountChange(count: number): void {
    this.activitiesCount.set(count);
  }

  ngOnInit(): void {
    // Écoute CHAQUE changement de paramètre id dans l'URL
    // Indispensable car Angular réutilise le même composant entre /club/15 et /club/8
    this.paramSub = this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.loading.set(true);
      this.club.set(null);
      this.clubService.getClub(id).subscribe({
        next: (club) => {
          this.club.set(club);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    });
  }

  /** Changement de couleur de thème par l'admin */
  onThemeChange(color: string): void {
    const club = this.club();
    if (!club) return;
    this.clubService.updateClub(club.id, { themeColor: color }).subscribe({
      next: (updated) => {
        this.club.set(updated);
        this.toast.success('Thème mis à jour.');
      },
      error: () => this.toast.error('Erreur lors de la mise à jour du thème.'),
    });
  }

  /** Quitter le club — appelé après confirmation dans le hero */
  onLeaveClub(): void {
    const uc = this.myUserClub();
    if (!uc) return;
    this.clubService.leaveClub(uc.id).subscribe({
      next: () => {
        this.userClubsService.fetchUserClubs().subscribe();
        this.toast.success('Vous avez quitté le club.');
        void this.router.navigate(['/']);
      },
      error: () => this.toast.error('Impossible de quitter le club.'),
    });
  }

  /** S'inscrire au club — ouvre le dialog rejoindre */
  onJoinClub(): void {
    this.showJoinDialog.set(true);
  }

  /** Callback après inscription réussie via le dialog */
  onJoined(): void {
    this.showJoinDialog.set(false);
    // Recharge le club pour mettre à jour le rôle affiché
    const club = this.club();
    if (!club) return;
    this.clubService.getClub(club.id).subscribe(c => this.club.set(c));
    this.userClubsService.fetchUserClubs().subscribe();
  }

  ngOnDestroy(): void {
    this.paramSub?.unsubscribe();
  }
}
