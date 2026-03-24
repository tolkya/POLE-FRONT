import { Component, input, computed } from '@angular/core';
import { UserClub } from '../../../core/services/user-clubs.service';
import { AdminWorkspace } from '../admin-workspace/admin-workspace';

@Component({
  selector: 'app-club-workspace',
  imports: [AdminWorkspace],
  templateUrl: './club-workspace.html',
  styleUrl: './club-workspace.scss',
})
export class ClubWorkspace {
  readonly userClub = input.required<UserClub>();

  readonly isAdmin = computed(() =>
    this.userClub().roles.includes('ADMIN')
  );
}