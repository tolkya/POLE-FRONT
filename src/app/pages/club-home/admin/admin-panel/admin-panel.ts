import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { UserClubsService } from '../../../../core/services/user-clubs.service';
import { AdminDashboard } from '../admin-dashboard/admin-dashboard';
import { AdminMembers } from '../admin-members/admin-members';
import { AdminActivities } from '../admin-activities/admin-activities';
import { AdminSettings } from '../admin-settings/admin-settings';

@Component({
  selector: 'app-admin-panel',
  imports: [TabsModule, AdminDashboard, AdminMembers, AdminActivities, AdminSettings],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.scss',
})
export class AdminPanel implements OnInit {
  private readonly route  = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userClubsService = inject(UserClubsService);

  clubId = signal<number>(0);

  private myUserClub = computed(() => {
    const id = this.clubId();
    if (!id) return null;
    return this.userClubsService.userClubs().find(uc => uc.club.id === id) ?? null;
  });

  isAdmin = computed(() => this.myUserClub()?.roles.includes('ADMIN') ?? false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.clubId.set(id);

    // Redirige vers la page club si l'utilisateur n'est pas admin
    if (!this.isAdmin()) {
      this.router.navigate(['/club', id]);
    }
  }
}