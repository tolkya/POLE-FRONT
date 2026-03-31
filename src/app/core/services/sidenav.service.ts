import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'sidenav_expanded';

@Injectable({ providedIn: 'root' })
export class SidenavService {
  // Ouverte par défaut, état persisté dans localStorage
  readonly expanded = signal<boolean>(this.loadState());

  toggle(): void {
    this.expanded.update(v => !v);
    this.saveState(this.expanded());
  }

  close(): void {
    this.expanded.set(false);
    this.saveState(false);
  }

  private loadState(): boolean {
    const stored = localStorage.getItem(STORAGE_KEY);
    // Si jamais stocké → ouverte par défaut
    return stored === null ? true : stored === 'true';
  }

  private saveState(value: boolean): void {
    localStorage.setItem(STORAGE_KEY, String(value));
  }
}
