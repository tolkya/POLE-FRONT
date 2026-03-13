import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly currentUser = signal<User | null>(null);
  readonly isLoggedIn = computed(() => this.currentUser() !== null);

  login(email: string, password: string): Observable<void> {
    return this.http
      .post<void>(`${environment.api.baseUrl}/login`, { email, password });
  }

  getMe(): Observable<User> {
    return this.http
      .get<User>(`${environment.api.baseUrl}/me`)
      .pipe(tap(user => this.currentUser.set(user)));
  }

  logout(): void {
    this.http
      .post(`${environment.api.baseUrl}/logout`, {})
      .subscribe({
        complete: () => {
          this.currentUser.set(null);
          void this.router.navigate(['/']);
        },
      });
  }
}