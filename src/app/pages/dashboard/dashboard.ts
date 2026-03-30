import { Component, inject, OnInit } from '@angular/core';
import { UserClubsService, UserClub } from '../../core/services/user-clubs.service';
import { Header } from '../../shared/components/header/header';
import { ClubTabBar } from './club-tab-bar/club-tab-bar';
import { ClubWorkspace } from './club-workspace/club-workspace';
import { JoinClubDialog } from '../../shared/components/join-club-dialog/join-club-dialog';
import { CreateClubDialog } from '../../shared/components/create-club-dialog/create-club-dialog';

@Component({
  selector: 'app-dashboard',
  imports: [Header, ClubTabBar, ClubWorkspace, JoinClubDialog, CreateClubDialog],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly userClubsService = inject(UserClubsService);

  readonly userClubs   = this.userClubsService.userClubs;
  readonly currentClub = this.userClubsService.currentClub;

  ngOnInit(): void {
    if (this.userClubs().length === 0) {
      this.userClubsService.fetchUserClubs().subscribe();
    }
  }

  selectClub(userClub: UserClub): void {
    this.userClubsService.selectClub(userClub);
  }
}