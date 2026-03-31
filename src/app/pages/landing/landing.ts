import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { JoinClubDialog } from '../../shared/components/join-club-dialog/join-club-dialog';
import { CreateClubDialog } from '../../shared/components/create-club-dialog/create-club-dialog';

@Component({
  selector: 'app-landing',
  imports: [RouterLink, JoinClubDialog, CreateClubDialog],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing implements OnInit {
  readonly auth = inject(AuthService);

  ngOnInit(): void {
    // getMe() est maintenant géré dans App (app.ts) au démarrage global
  }
}
