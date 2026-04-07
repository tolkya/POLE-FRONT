import { Component, input, output, OnInit, signal, inject } from '@angular/core';
import { ClubService, ClubAdminStats } from '../../../../core/services/club.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard implements OnInit {
  readonly clubId    = input.required<number>();
  readonly tabChange = output<string>();

  private readonly clubService = inject(ClubService);

  stats   = signal<ClubAdminStats | null>(null);
  loading = signal(true);
  error   = signal(false);

  ngOnInit(): void {
    this.clubService.getAdminStats(this.clubId()).subscribe({
      next:  (s) => { this.stats.set(s);    this.loading.set(false); },
      error: ()  => { this.error.set(true); this.loading.set(false); },
    });
  }

  goToTab(tab: string): void {
    this.tabChange.emit(tab);
  }
}