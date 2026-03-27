import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MultiSelect } from 'primeng/multiselect';
import { ClubMember } from '../club-members.service';
import { ClubRole, CLUB_ROLE_OPTIONS, CLUB_ROLE_LABELS } from '../user-clubs-management.service';

@Component({
  selector: 'app-members-tab',
  imports: [DatePipe, FormsModule, MultiSelect],
  templateUrl: './members-tab.html',
  styleUrl: './members-tab.scss',
})
export class MembersTab {
  readonly members = input.required<ClubMember[]>();

  readonly validate = output<number>();
  readonly changeRoles = output<{ userClubId: number; roles: ClubRole[] }>();
  readonly remove = output<number>();

  readonly roleOptions = CLUB_ROLE_OPTIONS;
  readonly roleLabels = CLUB_ROLE_LABELS;

  onValidate(userClubId: number): void {
    this.validate.emit(userClubId);
  }

  onChangeRoles(userClubId: number, roles: string[] | null): void {
    this.changeRoles.emit({ userClubId, roles: (roles ?? []) as ClubRole[] });
  }

  onRemove(userClubId: number): void {
    this.remove.emit(userClubId);
  }

  getRoleLabel(r: string): string {
    return this.roleLabels[r as ClubRole] ?? r;
  }
}