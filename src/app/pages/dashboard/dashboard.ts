import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserClubsService, UserClub } from '../../core/services/user-clubs.service';
import { ClubService } from './club.service';
import { Header } from '../../shared/components/header/header';
import { ClubTabBar } from './club-tab-bar/club-tab-bar';
import { ClubWorkspace } from './club-workspace/club-workspace';
import { Dialog } from 'primeng/dialog';

@Component({
  selector: 'app-dashboard',
  imports: [Header, ClubTabBar, ClubWorkspace, ReactiveFormsModule, Dialog],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userClubsService = inject(UserClubsService);
  private readonly clubService = inject(ClubService);

  readonly userClubs = this.userClubsService.userClubs;
  readonly currentClub = this.userClubsService.currentClub;

  readonly showJoinForm = signal(false);
  readonly showCreateForm = signal(false);
  readonly joinPending = signal(false);
  readonly createPending = signal(false);
  readonly joinError = signal<string | null>(null);
  readonly createError = signal<string | null>(null);

  readonly joinForm = this.fb.nonNullable.group({
    clubCode: ['', Validators.required],
  });

  readonly createForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: [''],
    phone: [''],
  });

  ngOnInit(): void {
    if (this.userClubs().length === 0) {
      this.userClubsService.fetchUserClubs().subscribe();
    }
  }

  selectClub(userClub: UserClub): void {
    this.userClubsService.selectClub(userClub);
  }

  openJoin(): void {
    this.showCreateForm.set(false);
    this.joinForm.reset();
    this.joinError.set(null);
    this.showJoinForm.set(true);
  }

  openCreate(): void {
    this.showJoinForm.set(false);
    this.createForm.reset();
    this.createError.set(null);
    this.showCreateForm.set(true);
  }

  submitJoin(): void {
    if (this.joinForm.invalid || this.joinPending()) return;
    this.joinPending.set(true);
    this.joinError.set(null);
    const { clubCode } = this.joinForm.getRawValue();
    this.clubService.joinClub(clubCode).subscribe({
      next: () => {
        this.userClubsService.fetchUserClubs().subscribe();
        this.showJoinForm.set(false);
        this.joinPending.set(false);
      },
      error: (err) => {
        this.joinPending.set(false);
        this.joinError.set(
          err.status === 409 ? 'Vous êtes déjà membre de ce club.' : 'Code de club invalide.'
        );
      },
    });
  }

  submitCreate(): void {
    if (this.createForm.invalid || this.createPending()) return;
    this.createPending.set(true);
    this.createError.set(null);
    this.clubService.createClub(this.createForm.getRawValue()).subscribe({
      next: () => {
        this.userClubsService.fetchUserClubs().subscribe();
        this.showCreateForm.set(false);
        this.createPending.set(false);
      },
      error: () => {
        this.createPending.set(false);
        this.createError.set('Erreur lors de la création du club.');
      },
    });
  }
}