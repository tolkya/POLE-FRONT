import { Component, input, inject, signal, effect, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserClub } from '../../../core/services/user-clubs.service';
import { ClubMembersService } from '../../../core/services/club-members.service';
import { ClubMember } from '../../../core/models';
import { ClubService, Club } from '../club.service';
import { UserClubsManagementService, ClubRole } from './user-clubs-management.service';
import { ActivitiesService } from '../../../core/services/activities.service';
import { Activity } from '../../../core/models';
import { MembersTab } from './members-tab/members-tab';
import { ActivitiesTab } from './activities-tab/activities-tab';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';


@Component({
  selector: 'app-admin-workspace',
  imports: [ReactiveFormsModule, MembersTab, ActivitiesTab, Tabs, TabList, Tab, TabPanels, TabPanel],
  templateUrl: './admin-workspace.html',
  styleUrl: './admin-workspace.scss',
})
export class AdminWorkspace {
  private readonly fb = inject(FormBuilder);
  private readonly clubService = inject(ClubService);
  private readonly clubMembersService = inject(ClubMembersService);
  private readonly userClubsManagementService = inject(UserClubsManagementService);
  private readonly activitiesService = inject(ActivitiesService);

  readonly userClub = input.required<UserClub>();

  readonly clubDetails = signal<Club | null>(null);
  readonly members = signal<ClubMember[]>([]);
  readonly activities = signal<Activity[]>([]);
  readonly editing = signal(false);
  readonly saving = signal(false);

  readonly editForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: [''],
    phone: [''],
  });

  constructor() {
    effect(() => {
      const clubId = this.userClub().club.id;
      untracked(() => {
        this.clubDetails.set(null);
        this.members.set([]);
        this.activities.set([]);
        this.loadClubDetails(clubId);
        this.loadMembers(clubId);
        this.loadActivities(clubId);
      });
    });
  }

  private loadClubDetails(clubId: number): void {
    this.clubService.getClub(clubId).subscribe((c) => this.clubDetails.set(c));
  }

  private loadMembers(clubId: number): void {
    this.clubMembersService.getMembers(clubId).subscribe((m) => this.members.set(m));
  }

  private loadActivities(clubId: number): void {
    this.activitiesService.getActivities(clubId).subscribe((a) => this.activities.set(a));
  }

  startEdit(): void {
    const club = this.clubDetails();
    if (!club) return;
    this.editForm.patchValue({ name: club.name, email: club.email ?? '', phone: club.phone ?? '' });
    this.editing.set(true);
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
      },
      error: () => this.saving.set(false),
    });
  }

  onValidateMember(userClubId: number): void {
    this.userClubsManagementService
      .patch(userClubId, { validatedAt: new Date().toISOString() })
      .subscribe(() => this.loadMembers(this.userClub().club.id));
  }

  onChangeRole(event: { userClubId: number; roles: ClubRole[] }): void {
    this.userClubsManagementService
      .patch(event.userClubId, { roles: event.roles })
      .subscribe(() => this.loadMembers(this.userClub().club.id));
  }

  onRemoveMember(userClubId: number): void {
    this.userClubsManagementService
      .delete(userClubId)
      .subscribe(() => {
        this.members.update((list) => list.filter((m) => m.id !== userClubId));
      });
  }

  onActivityCreated(activity: Activity): void {
    this.activities.update((list) => [...list, activity]);
  }

  onActivityDeleted(activityId: number): void {
    this.activitiesService.deleteActivity(activityId).subscribe(() => {
      this.activities.update((list) => list.filter((a) => a.id !== activityId));
    });
  }
}