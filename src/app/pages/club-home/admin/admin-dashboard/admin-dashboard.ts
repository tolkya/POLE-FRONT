import { Component, input, output, OnInit, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ClubService, ClubAdminStats } from '../../../../core/services/club.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard implements OnInit {
  readonly clubId  = input.required<number>();
  readonly tabChange = output<string>();   // émet "1" (membres) ou "2" (activités)

  private readonly clubService = inject(ClubService);

  stats   = signal<ClubAdminStats | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    this.clubService.getAdminStats(this.clubId()).subscribe({
      next: (s) => { this.stats.set(s); this.loading.set(false); },
      error: ()  => { this.loading.set(false); },
    });
  }

  goToTab(tab: string): void {
    this.tabChange.emit(tab);
  }
}