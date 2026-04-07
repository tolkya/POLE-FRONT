import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserClubsService } from '../../../core/services/user-clubs.service';
import { SidenavService } from '../../../core/services/sidenav.service';
import { ThemeService } from '../../../core/services/theme.service';
import { JoinClubDialog } from '../join-club-dialog/join-club-dialog';
import { CreateClubDialog } from '../create-club-dialog/create-club-dialog';
import { environment } from '../../../../environments/environment';
import { UserClub } from '../../../core/models';

@Component({
  selector: 'app-sidenav',
  imports: [RouterLink, RouterLinkActive, JoinClubDialog, CreateClubDialog],
  templateUrl: './sidenav.html',
  styleUrl: './sidenav.scss',
})
export class Sidenav implements OnInit {
  private readonly auth             = inject(AuthService);
  private readonly userClubsService = inject(UserClubsService);
  readonly sidenavService           = inject(SidenavService);
  readonly themeService             = inject(ThemeService);

  readonly user        = this.auth.currentUser;
  readonly userClubs   = this.userClubsService.userClubs;
  readonly currentClub = this.userClubsService.currentClub;
  readonly expanded    = this.sidenavService.expanded;
  readonly darkMode    = this.themeService.darkMode;

  readonly openClubId = signal<number | null>(null);

  clubStyles(themeColor: string | null): Record<string, string> {
    const hex = themeColor ?? '#7c3aed';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return {
      '--cc':        hex,
      '--cc-hover':  `rgba(${r},${g},${b},0.18)`,
      '--cc-active': `rgba(${r},${g},${b},0.28)`,
      '--cc-border': `rgba(${r},${g},${b},0.45)`,
      '--cc-text':   hex,
    };
  }

  ngOnInit(): void {
    if (this.userClubs().length === 0) {
      this.userClubsService.fetchUserClubs().subscribe();
    }
  }

  toggle(): void { this.sidenavService.toggle(); }

  toggleClub(id: number): void {
    this.openClubId.update(current => current === id ? null : id);
  }

  isAdmin(roles: string[]): boolean {
    return roles.includes('ADMIN');
  }

  selectClub(userClub: UserClub): void {
    this.userClubsService.selectClub(userClub);
    // Ouvre automatiquement le sous-menu du club sélectionné
    this.openClubId.set(userClub.id);
  }

  logout(): void {
    this.auth.logout();
  }

  clubInitials(name: string): string {
    return name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();
  }

  clubLogoUrl(logoUrl: string | null): string | null {
    if (!logoUrl) return null;
    if (logoUrl.startsWith('http')) return logoUrl;
    return environment.api.baseUrl.replace('/api', '') + logoUrl;
  }
}
