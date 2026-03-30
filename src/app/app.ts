import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from 'primeng/toast';
import { Auth } from './core/services/auth.service';
import { SidenavService } from './core/services/sidenav.service';
import { Header } from './shared/components/header/header';
import { Sidenav } from './shared/components/sidenav/sidenav';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast, Header, Sidenav],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('POLE-FRONT');
  readonly auth    = inject(Auth);
  readonly sidenav = inject(SidenavService);

  ngOnInit(): void {
    if (!this.auth.currentUser()) {
      this.auth.getMe().subscribe({ error: () => {} });
    }
  }
}
