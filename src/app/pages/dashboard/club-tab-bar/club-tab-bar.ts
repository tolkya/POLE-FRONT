import { Component, input, output } from '@angular/core';
import { UserClub } from '../../../core/services/user-clubs.service';

@Component({
  selector: 'app-club-tab-bar',
  imports: [],
  templateUrl: './club-tab-bar.html',
  styleUrl: './club-tab-bar.scss',
})
export class ClubTabBar {
  readonly userClubs = input.required<UserClub[]>();
  readonly activeClub = input.required<UserClub | null>();

  readonly clubSelected = output<UserClub>();
  readonly joinClub = output<void>();
  readonly createClub = output<void>();

  readonly roleIcons: Record<string, string> = {
    ADMIN: '👑',
    TEACHER: '🎓',
    SECRETARY: '📋',
    MEMBER: '👤',
    USER: '⏳',
  };

  getMainRole(userClub: UserClub): string {
    const priority = ['ADMIN', 'TEACHER', 'SECRETARY', 'MEMBER', 'USER'];
    return priority.find((r) => userClub.roles.includes(r)) ?? userClub.roles[0] ?? 'MEMBER';
  }

  isActive(userClub: UserClub): boolean {
    return this.activeClub()?.club.id === userClub.club.id;
  }
}