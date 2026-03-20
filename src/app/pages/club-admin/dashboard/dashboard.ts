import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { Header } from '../../../shared/components/header/header';
import { UserClubsService, UserClub } from '../../../core/services/user-clubs.service';
import { ClubMembersService, ClubMember } from './club-members.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [Header, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly userClubsService = inject(UserClubsService);
  private readonly clubMembersService = inject(ClubMembersService);

  readonly currentClub = this.userClubsService.currentClub;
  readonly userClubs = this.userClubsService.userClubs;
  readonly members = signal<ClubMember[]>([]);

  constructor() {
    // Recharge les membres quand on change de club
    effect(() => {
      const club = this.currentClub();
      if (club) {
        this.loadMembers(club.club.id);
      }
    });
  }

  ngOnInit(): void {
    // Les clubs sont déjà chargés par le guard
  }

  selectClub(userClub: UserClub): void {
    this.userClubsService.selectClub(userClub);
  }

  private loadMembers(clubId: number): void {
    this.clubMembersService.getMembers(clubId).subscribe({
      next: (members) => this.members.set(members),
      error: () => this.members.set([]),
    });
  }
}