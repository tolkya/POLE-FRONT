import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, tap, catchError, EMPTY } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ToastService } from './toast.service';

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
export class AuthService {
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly toast  = inject(ToastService);

  readonly currentUser = signal<User | null>(null);
  readonly isLoggedIn  = computed(() => this.currentUser() !== null);

  login(email: string, password: string): Observable<void> {
    return this.http
      .post<void>(`${environment.api.baseUrl}/login`, { email, password });
  }

  getMe(): Observable<User> {
    return this.http
      .get<User>(`${environment.api.baseUrl}/me`)
      .pipe(tap(user => this.currentUser.set(user)));
  }

  /**
   * Enchaîne login + getMe après une inscription réussie.
   * En cas d'échec du login, affiche un toast et redirige vers /login.
   * Utilisé par tous les formulaires d'inscription.
   */
  loginAfterRegistration(email: string, password: string, successMsg: string): Observable<User> {
    return this.login(email, password).pipe(
      catchError(() => {
        this.toast.success('Compte créé\u00a0! Connectez-vous.', 'Inscription réussie');
        void this.router.navigate(['/login']);
        return EMPTY;
      }),
      switchMap(() => this.getMe()),
      tap(() => {
        this.toast.success(successMsg, 'Bienvenue\u00a0!');
        void this.router.navigate(['/']);
      }),
    );
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