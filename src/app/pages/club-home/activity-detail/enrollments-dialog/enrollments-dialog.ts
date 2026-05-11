import { Component, Input, inject, signal, computed, output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { ActivityMembersService } from '../../../../core/services/activity-members.service';
import { ToastService } from '../../../../core/services/toast.service';
import { UserActivity } from '../../../../core/models/user-activity.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-enrollments-dialog',
  imports: [DialogModule, ButtonModule, TabsModule, TagModule, DatePipe],
  templateUrl: './enrollments-dialog.html',
  styleUrl: './enrollments-dialog.scss',
})
export class EnrollmentsDialog {
  private readonly activityMembersService = inject(ActivityMembersService);
  private readonly toast = inject(ToastService);

  readonly visible$    = signal(false);
  readonly showContent = signal(false);
  readonly loading     = signal(false);
  readonly members     = signal<UserActivity[]>([]);
  readonly processingId = signal<number | null>(null);

  private activityId = 0;

  @Input() set activityId_(v: number) { this.activityId = v; }

  @Input() isAdmin = false;

  readonly teachers = computed(() => this.members().filter(m => m.status === 'APPROVED' && m.role === 'TEACHER'));
  readonly students = computed(() => this.members().filter(m => m.status === 'APPROVED' && m.role === 'STUDENT'));


  @Input() set visible(v: boolean) {
    if (v) {
      this.showContent.set(true);
      this.loadMembers();
    }
    this.visible$.set(v);
  }

  readonly visibleChange = output<boolean>();

  readonly pending  = computed(() => this.members().filter(m => m.status === 'PENDING'));

  private loadMembers(): void {
    this.loading.set(true);
    this.activityMembersService.getMembers(this.activityId).subscribe({
      next: (list) => this.members.set(list),
      complete: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  approve(ua: UserActivity): void {
    this.processingId.set(ua.id);
    this.activityMembersService.patchStatus(ua.id, 'APPROVED').subscribe({
      next: (updated) => {
        this.members.update(list => list.map(m => m.id === updated.id ? updated : m));
        this.toast.success('Inscription validée');
      },
      complete: () => this.processingId.set(null),
      error: () => this.processingId.set(null),
    });
  }

  reject(ua: UserActivity): void {
    this.processingId.set(ua.id);
    this.activityMembersService.patchStatus(ua.id, 'REJECTED').subscribe({
      next: (updated) => {
        this.members.update(list => list.map(m => m.id === updated.id ? updated : m));
        this.toast.warning('Inscription refusée');
      },
      complete: () => this.processingId.set(null),
      error: () => this.processingId.set(null),
    });
  }

  remove(ua: UserActivity): void {
    if (!confirm(`Retirer ${ua.member.firstName} ${ua.member.lastName} de cette activité ?`)) return;
    this.processingId.set(ua.id);
    this.activityMembersService.deleteMembership(ua.id).subscribe({
      next: () => {
        this.members.update(list => list.filter(m => m.id !== ua.id));
        this.toast.success('Membre retiré');
      },
      complete: () => this.processingId.set(null),
      error: () => this.processingId.set(null),
    });
  }

  close(): void {
    this.showContent.set(false);
    this.visibleChange.emit(false);
  }
}

