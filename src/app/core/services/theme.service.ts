import { Injectable, signal, effect } from '@angular/core';

const STORAGE_KEY = 'darkMode';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  readonly darkMode = signal<boolean>(
    localStorage.getItem(STORAGE_KEY) === 'true'
  );

  constructor() {
    // Applique la classe dès le démarrage
    this.applyClass(this.darkMode());

    // Sync automatique à chaque changement
    effect(() => {
      const dark = this.darkMode();
      this.applyClass(dark);
      localStorage.setItem(STORAGE_KEY, String(dark));
    });
  }

  toggle(): void {
    this.darkMode.update(v => !v);
  }

  private applyClass(dark: boolean): void {
    document.documentElement.classList.toggle('dark', dark);
  }
}
