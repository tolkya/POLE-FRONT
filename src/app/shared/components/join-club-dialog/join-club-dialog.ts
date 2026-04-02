import { Component, inject, signal, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Dialog } from 'primeng/dialog';
import { AutoCompleteModule, AutoCompleteCompleteEvent, AutoComplete } from 'primeng/autocomplete';
import { ClubService } from '../../../core/services/club.service';
import { UserClubsService } from '../../../core/services/user-clubs.service';
import { ToastService } from '../../../core/services/toast.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface ClubSearchResult {
  id: number;
  name: string;
  city: string | null;
  logoUrl: string | null;
}

@Component({
  selector: 'app-join-club-dialog',
  imports: [ReactiveFormsModule, FormsModule, Dialog, AutoCompleteModule],
  templateUrl: './join-club-dialog.html',
  styleUrl: './join-club-dialog.scss',
})
export class JoinClubDialog {
  @ViewChild('ac') ac!: AutoComplete;
  private readonly fb               = inject(FormBuilder);
  private readonly clubService      = inject(ClubService);
  private readonly userClubsService = inject(UserClubsService);
  private readonly toast            = inject(ToastService);
  private readonly router           = inject(Router);
  private readonly http             = inject(HttpClient);

  @Output() joined = new EventEmitter<void>();
  @Output() visibleChange = new EventEmitter<boolean>();

  @Input() set visible(v: boolean) {
    if (v) {
      this.form.reset();
      this.error.set(null);
      this.showContent.set(true);
    }
    this.visible$.set(v);
  }

  readonly visible$       = signal(false);
  readonly pending        = signal(false);
  readonly error          = signal<string | null>(null);
  readonly searchResults  = signal<ClubSearchResult[]>([]);
  readonly hasSearched    = signal(false);
  readonly showContent    = signal(true);
  selectedClub: ClubSearchResult | null = null;

  readonly form = this.fb.nonNullable.group({
    clubCode: ['', Validators.required],
  });

  open(): void {
    this.form.reset();
    this.error.set(null);
    this.selectedClub = null;
    this.searchResults.set([]);
    this.hasSearched.set(false);
    this.showContent.set(true);
    this.visible$.set(true);
    this.visibleChange.emit(true);
  }

  onClear(): void {
    this.searchResults.set([]);
    this.hasSearched.set(false);
    setTimeout(() => this.ac?.hide(), 0);
  }

  onSearch(event: AutoCompleteCompleteEvent): void {
    const q = event.query?.trim();
    if (!q || q.length < 2) { this.searchResults.set([]); return; }
    this.hasSearched.set(true);
    this.http.get<{ member: ClubSearchResult[] }>(
      `${environment.api.baseUrl}/clubs/search?name=${encodeURIComponent(q)}`
    ).subscribe(res => this.searchResults.set(res.member ?? []));
  }

  onSelectClub(club: ClubSearchResult): void {
    this.close();
    this.router.navigate(['/club', club.id]);
  }

  logoUrl(url: string | null): string | null {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return environment.api.baseUrl.replace('/api', '') + url;
  }

  onVisibleChange(v: boolean): void {
    if (!v) this.showContent.set(false);
    this.visible$.set(v);
    this.visibleChange.emit(v);
  }

  close(): void {
    this.showContent.set(false);
    this.visible$.set(false);
    this.visibleChange.emit(false);
  }

  submit(): void {
    if (this.form.invalid || this.pending()) return;
    this.pending.set(true);
    this.error.set(null);
    const { clubCode } = this.form.getRawValue();
    this.clubService.joinClub(clubCode).subscribe({
      next: () => {
        this.userClubsService.fetchUserClubs().subscribe();
        this.toast.success('Vous avez rejoint le club.');
        this.close();
        this.pending.set(false);
        this.joined.emit();
      },
      error: (err) => {
        this.pending.set(false);
        this.error.set(
          err.status === 409 ? 'Vous êtes déjà membre de ce club.' : 'Code invalide ou club introuvable.'
        );
      },
    });
  }
}
