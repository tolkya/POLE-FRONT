import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  login(email: string, password: string): Observable<void> {
    return this.http
      .post<void>(`${environment.api.baseUrl}login`, { email, password })
      .pipe(map(() => undefined));
  }

  logout(): void {
    this.http
      .post(`${environment.api.baseUrl}logout`, {})
      .subscribe({ complete: () => void this.router.navigate(['/login']) });
  }
}