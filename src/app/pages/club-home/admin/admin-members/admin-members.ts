import { Component, input, signal, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PaginatorModule } from 'primeng/paginator';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';
import { ClubMembersService } from '../../../../core/services/club-members.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ClubMember } from '../../../../core/models/club.model';
import { ClubRole, CLUB_ROLE_LABELS, CLUB_ROLE_OPTIONS } from '../../../../core/models/club-role.model';
import { MemberRoleDialog } from './member-role-dialog/member-role-dialog';

@Component({
  selector: 'app-admin-members',
  imports: [FormsModule, ButtonModule, InputTextModule, SelectModule, TagModule, ConfirmDialogModule, PaginatorModule, TooltipModule, MemberRoleDialog],
  providers: [ConfirmationService],
  templateUrl: './admin-members.html',
  styleUrl: './admin-members.scss',
})
export class AdminMembers implements OnInit {
  readonly clubId = input.required<number>();

  private readonly membersService      = inject(ClubMembersService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly toast               = inject(ToastService);

  members    = signal<ClubMember[]>([]);
  loading    = signal(true);
  total      = signal(0);
  page       = signal(1);
  limit      = signal(20);

  search     = signal('');
  roleFilter = signal('');

  selectedMember = signal<ClubMember | null>(null);
  showRoleDialog = signal(false);

  readonly roleOptions = [{ label: 'Tous', value: '' }, ...CLUB_ROLE_OPTIONS];
  readonly roleLabels  = CLUB_ROLE_LABELS;

  ngOnInit(): void { this.loadMembers(); }

  loadMembers(): void {
    this.loading.set(true);
    this.membersService.getMembers(this.clubId(), {
      search: this.search() || undefined,
      role:   this.roleFilter() || undefined,
      page:   this.page(),
      limit:  this.limit(),
    }).subscribe({
      next: (res) => {
        this.members.set(res.members);
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); },
    });
  }

  onPageChange(event: { page?: number; rows?: number }): void {
    this.page.set((event.page ?? 0) + 1);
    if (event.rows && event.rows !== this.limit()) {
      this.limit.set(event.rows);
      this.page.set(1);
    }
    this.loadMembers();
  }
  onFilterChange(): void {
    this.page.set(1);
    this.loadMembers();
  }

  openRoleDialog(member: ClubMember): void {
    this.selectedMember.set(member);
    this.showRoleDialog.set(true);
  }

  onSaveRoles(event: { userClubId: number; roles: ClubRole[] }): void {
    this.membersService.patchUserClub(event.userClubId, { roles: event.roles }).subscribe({
      next: () => { this.toast.success('Rôles mis à jour'); this.loadMembers(); },
      error: () => { this.toast.error('Erreur lors de la mise à jour'); },
    });
  }

  validateMember(member: ClubMember): void {
    this.membersService.patchUserClub(member.id, { validatedAt: new Date().toISOString() }).subscribe({
      next: () => { this.toast.success('Membre validé'); this.loadMembers(); },
      error: () => { this.toast.error('Erreur lors de la validation'); },
    });
  }

  confirmExclude(member: ClubMember): void {
    this.confirmationService.confirm({
      message: `Exclure ${member.member.firstName} ${member.member.lastName} du club ?`,
      header: 'Confirmer l\'exclusion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Exclure',
      rejectLabel: 'Annuler',
      accept: () => {
        this.membersService.deleteUserClub(member.id).subscribe({
          next: () => { this.toast.success('Membre exclu'); this.loadMembers(); },
          error: () => { this.toast.error('Erreur lors de l\'exclusion'); },
        });
      },
    });
  }

  isPending(member: ClubMember): boolean { return member.validatedAt === null; }
  getRoleLabel(role: ClubRole): string { return this.roleLabels[role] ?? role; }
}