import { Component, inject, OnInit } from '@angular/core';
import { UserClubsService } from '../../core/services/user-clubs.service';
import { ClubWorkspace } from './club-workspace/club-workspace';

@Component({
  selector: 'app-dashboard',
  imports: [ClubWorkspace],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly userClubsService = inject(UserClubsService);

  readonly currentClub = this.userClubsService.currentClub;
  readonly userClubs   = this.userClubsService.userClubs;

  ngOnInit(): void {
    if (this.userClubs().length === 0) {
      this.userClubsService.fetchUserClubs().subscribe();
    }
  }
}