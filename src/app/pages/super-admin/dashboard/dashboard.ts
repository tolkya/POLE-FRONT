import { Component, inject, signal, OnInit } from '@angular/core';
import { Header } from '../../../shared/components/header/header';
import { StatsCard } from '../../../shared/components/stats-card/stats-card';
import { NotificationList } from './components/notification-list/notification-list';
import { ClubTable, Club } from './components/club-table/club-table';
import { StatsService, Stats } from './stats.service';
import { NotificationReceiptsService, NotificationReceipt } from './notification-receipts.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  imports: [Header, StatsCard, NotificationList, ClubTable],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly statsService = inject(StatsService);
  private readonly notifService = inject(NotificationReceiptsService);
  private readonly http = inject(HttpClient);

  readonly stats = signal<Stats | null>(null);
  readonly receipts = signal<NotificationReceipt[]>([]);
  readonly clubs = signal<Club[]>([]);

  ngOnInit(): void {
    this.statsService.get().subscribe((s) => this.stats.set(s));
    this.loadReceipts();
    this.http
      .get<{ 'member': Club[] }>(`${environment.api.baseUrl}/clubs`, {
        headers: new HttpHeaders({ Accept: 'application/ld+json' }),
      })
      .subscribe((col) => this.clubs.set(col['member']));
  }

  private loadReceipts(): void {
    this.notifService.getAll().subscribe((col) =>
      this.receipts.set(col['member'])
    );
  }

  onMarkAsRead(id: number): void {
    this.notifService.markAsRead(id).subscribe(() => {
      this.loadReceipts();
      this.statsService.get().subscribe((s) => this.stats.set(s));
    });
  }
}