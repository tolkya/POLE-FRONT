import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth } from '../../core/services/auth.service';
import { Header } from '../../shared/components/header/header';
import { JoinClubDialog } from '../../shared/components/join-club-dialog/join-club-dialog';
import { CreateClubDialog } from '../../shared/components/create-club-dialog/create-club-dialog';

@Component({
  selector: 'app-landing',
  imports: [RouterLink, Header, JoinClubDialog, CreateClubDialog],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing implements OnInit {
  readonly auth = inject(Auth);

  ngOnInit(): void {
    if (!this.auth.currentUser()) {
      this.auth.getMe().subscribe({ error: () => {} });
    }
  }
}
