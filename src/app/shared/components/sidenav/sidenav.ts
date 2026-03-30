import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../../core/services/auth.service';
import { UserClubsService } from '../../../core/services/user-clubs.service';
import { SidenavService } from '../../../core/services/sidenav.service';
import { JoinClubDialog } from '../join-club-dialog/join-club-dialog';
import { CreateClubDialog } from '../create-club-dialog/create-club-dialog';

@Component({
  selector: 'app-sidenav',
  imports: [RouterLink, RouterLinkActive, JoinClubDialog, CreateClubDialog],
  templateUrl: './sidenav.html',
  styleUrl: './sidenav.scss',
})
export class Sidenav implements OnInit {
  private readonly auth             = inject(Auth);
  private readonly userClubsService = inject(UserClubsService);
  readonly sidenavService           = inject(SidenavService);

  readonly user        = this.auth.currentUser;
  readonly userClubs   = this.userClubsService.userClubs;
  readonly currentClub = this.userClubsService.currentClub;
  readonly expanded    = this.sidenavService.expanded;

  readonly openClubId = signal<number | null>(null);

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

  selectClub(userClub: any): void {
    this.userClubsService.selectClub(userClub);
  }

  logout(): void {
    this.auth.logout();
  }

  clubInitials(name: string): string {
    return name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();
  }
}
