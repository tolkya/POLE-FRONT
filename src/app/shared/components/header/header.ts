import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private readonly auth = inject(AuthService);

  readonly user      = this.auth.currentUser;
  readonly isLoggedIn = this.auth.isLoggedIn;

  logout(): void {
    this.auth.logout();
  }
}