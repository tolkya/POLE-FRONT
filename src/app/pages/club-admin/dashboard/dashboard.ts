import { Component, inject, signal, OnInit } from '@angular/core';
import { Header } from '../../../shared/components/header/header';
import { UserClubsService, UserClub } from '../../../core/services/user-clubs.service';

@Component({
  selector: 'app-dashboard',
  imports: [Header],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly userClubsService = inject(UserClubsService);

  readonly currentClub = this.userClubsService.currentClub;
  readonly userClubs = this.userClubsService.userClubs;

  ngOnInit(): void {
    // Les clubs sont déjà chargés par le guard
  }

  selectClub(userClub: UserClub): void {
    this.userClubsService.selectClub(userClub);
  }
}