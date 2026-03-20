import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Header } from '../../../shared/components/header/header';
import { UserClubsService, UserClub } from '../../../core/services/user-clubs.service';
import { ClubMembersService, ClubMember } from './club-members.service';
import { ClubService, Club } from './club.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [Header, DatePipe, ReactiveFormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userClubsService = inject(UserClubsService);
  private readonly clubMembersService = inject(ClubMembersService);
  private readonly clubService = inject(ClubService);

  readonly currentClub = this.userClubsService.currentClub;
  readonly userClubs = this.userClubsService.userClubs;
  readonly members = signal<ClubMember[]>([]);
  readonly clubDetails = signal<Club | null>(null);
  readonly editing = signal(false);
  readonly saving = signal(false);

  readonly editForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: [''],
    phone: [''],
  });

  readonly creatingClub = signal(false);
  readonly creatingClubPending = signal(false);

  readonly createClubForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: [''],
    phone: [''],
  });

  constructor() {
    effect(() => {
      const club = this.currentClub();
      if (club) {
        this.loadMembers(club.club.id);
        this.loadClubDetails(club.club.id);
      }
    });
  }

  ngOnInit(): void {}

  selectClub(userClub: UserClub): void {
    this.userClubsService.selectClub(userClub);
  }

  startEdit(): void {
    const club = this.clubDetails();
    if (club) {
      this.editForm.patchValue({
        name: club.name,
        email: club.email ?? '',
        phone: club.phone ?? '',
      });
      this.editing.set(true);
    }
  }

  cancelEdit(): void {
    this.editing.set(false);
  }

  saveClub(): void {
    if (this.editForm.invalid || this.saving()) return;

    const club = this.clubDetails();
    if (!club) return;

    this.saving.set(true);
    this.clubService.updateClub(club.id, this.editForm.getRawValue()).subscribe({
      next: (updated) => {
        this.clubDetails.set(updated);
        this.editing.set(false);
        this.saving.set(false);
        // Mettre à jour le nom dans userClubs aussi
        const currentClub = this.currentClub();
        if (currentClub) {
          currentClub.club.name = updated.name;
        }
      },
      error: () => this.saving.set(false),
    });
  }

  startCreateClub(): void {
    this.createClubForm.reset();
    this.creatingClub.set(true);
  }

  cancelCreateClub(): void {
    this.creatingClub.set(false);
  }

  submitCreateClub(): void {
    if (this.createClubForm.invalid || this.creatingClubPending()) return;

    this.creatingClubPending.set(true);
    this.clubService.createClub(this.createClubForm.getRawValue()).subscribe({
      next: () => {
        this.creatingClub.set(false);
        this.creatingClubPending.set(false);
        // Recharger les clubs de l'utilisateur
        this.userClubsService.fetchUserClubs().subscribe();
      },
      error: () => this.creatingClubPending.set(false),
    });
  }

  private loadMembers(clubId: number): void {
    this.clubMembersService.getMembers(clubId).subscribe({
      next: (members) => this.members.set(members),
      error: () => this.members.set([]),
    });
  }

  private loadClubDetails(clubId: number): void {
    this.clubService.getClub(clubId).subscribe({
      next: (club) => this.clubDetails.set(club),
      error: () => this.clubDetails.set(null),
    });
  }
}