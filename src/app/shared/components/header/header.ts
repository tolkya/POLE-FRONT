import { Component, inject } from '@angular/core';
import { Auth } from '../../../core/services/auth.service';


@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private readonly auth = inject(Auth);

  readonly user = this.auth.currentUser;

  logout(): void {
    this.auth.logout();
  }
}