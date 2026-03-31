import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ClubService } from '../../core/services/club.service';
import { UserClubsService } from '../../core/services/user-clubs.service';
import { Club } from '../../core/models/club.model';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-club-home',
  imports: [CommonModule, TagModule, CardModule, SkeletonModule],
  templateUrl: './club-home.html',
  styleUrl: './club-home.scss',
})
export class ClubHome implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly clubService = inject(ClubService);
  private readonly userClubsService = inject(UserClubsService);
  private paramSub?: Subscription;

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

  roleTag = computed(() => {
    if (this.isAdmin()) return { label: 'ADMIN', severity: 'contrast' as const };
    if (this.isTeacher()) return { label: 'TEACHER', severity: 'info' as const };
    if (this.isMember()) return { label: 'MEMBRE', severity: 'success' as const };
    return { label: "S'inscrire", severity: 'warn' as const };
  });

  initials = computed(() => {
    const name = this.club()?.name ?? '';
    return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
  });

  logoAbsoluteUrl = computed(() => {
    const url = this.club()?.logoUrl;
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const base = environment.api.baseUrl.replace('/api', '');
    return base + url;
  });

  themeColor = computed(() => this.club()?.themeColor ?? '#7c3aed');

  address = computed(() => {
    const c = this.club();
    if (!c?.street && !c?.city) return null;
    return [c.street, c.postalCode, c.city].filter(Boolean).join(', ');
  });

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

  ngOnDestroy(): void {
    this.paramSub?.unsubscribe();
  }
}
