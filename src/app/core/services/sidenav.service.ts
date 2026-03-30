import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SidenavService {
  readonly expanded = signal(false);

  toggle(): void { this.expanded.update(v => !v); }
  close(): void  { this.expanded.set(false); }
}
