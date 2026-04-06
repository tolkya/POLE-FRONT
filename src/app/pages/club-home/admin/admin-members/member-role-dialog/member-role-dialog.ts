import { Component, input, output, OnChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ClubMember } from '../../../../../core/models/club.model';
import { ClubRole, CLUB_ROLE_OPTIONS } from '../../../../../core/models/club-role.model';

@Component({
  selector: 'app-member-role-dialog',
  imports: [DialogModule, ButtonModule, CheckboxModule, FormsModule],
  templateUrl: './member-role-dialog.html',
  styleUrl: './member-role-dialog.scss',
})
export class MemberRoleDialog implements OnChanges {
  readonly member  = input<ClubMember | null>(null);
  readonly visible = input<boolean>(false);
  readonly visibleChange = output<boolean>();
  readonly save    = output<{ userClubId: number; roles: ClubRole[] }>();

  readonly roleOptions = CLUB_ROLE_OPTIONS;
  selectedRoles: ClubRole[] = [];

  ngOnChanges(): void {
    const m = this.member();
    if (m) this.selectedRoles = [...m.roles];
  }

  onSave(): void {
    const m = this.member();
    if (!m) return;
    this.save.emit({ userClubId: m.id, roles: this.selectedRoles });
    this.visibleChange.emit(false);
  }

  onHide(): void { this.visibleChange.emit(false); }
}