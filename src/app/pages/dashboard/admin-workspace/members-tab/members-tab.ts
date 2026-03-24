import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ClubMember } from '../club-members.service';
import { ClubRole } from '../user-clubs-management.service';

@Component({
  selector: 'app-members-tab',
  imports: [DatePipe],
  templateUrl: './members-tab.html',
  styleUrl: './members-tab.scss',
})
export class MembersTab {
  readonly members = input.required<ClubMember[]>();

  readonly validate = output<number>();
  readonly changeRole = output<{ userClubId: number; role: ClubRole }>();
  readonly remove = output<number>();

  readonly roles: ClubRole[] = ['ADMIN', 'TEACHER', 'SECRETARY', 'MEMBER'];

  readonly roleLabels: Record<string, string> = {
    ADMIN: 'Admin',
    TEACHER: 'Professeur',
    SECRETARY: 'Secrétaire',
    MEMBER: 'Membre',
    USER: 'En attente',
  };

  onValidate(userClubId: number): void {
    this.validate.emit(userClubId);
  }

  onChangeRole(userClubId: number, event: Event): void {
    const role = (event.target as HTMLSelectElement).value as ClubRole;
    this.changeRole.emit({ userClubId, role });
  }

  onRemove(userClubId: number): void {
    this.remove.emit(userClubId);
  }
}