import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ClubSummary {
  id: number;
  name: string;
}

export interface UserClub {
  club: ClubSummary;
  roles: string[];
  validatedAt: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class UserClubsService {
  private readonly apiUrl = `${environment.api.baseUrl}/me/clubs`;

  /** Liste des clubs de l'utilisateur connecté */
  userClubs = signal<UserClub[]>([]);

  /** Club actuellement sélectionné */
  currentClub = signal<UserClub | null>(null);

  constructor(private http: HttpClient) {}

  /** Récupère tous les clubs de l'utilisateur connecté */
  fetchUserClubs(): Observable<UserClub[]> {
    return this.http.get<UserClub[]>(this.apiUrl, { withCredentials: true }).pipe(
      tap((clubs) => {
        this.userClubs.set(clubs);
        // Sélectionne automatiquement le premier club admin, sinon le premier club
        const adminClub = clubs.find((uc) => uc.roles.includes('ADMIN'));
        this.currentClub.set(adminClub ?? clubs[0] ?? null);
      })
    );
  }

  /** Change le club actif */
  selectClub(userClub: UserClub): void {
    this.currentClub.set(userClub);
  }

  /** Vérifie si l'utilisateur est admin d'au moins un club */
  isAdminOfAnyClub(): boolean {
    return this.userClubs().some((uc) => uc.roles.includes('ADMIN'));
  }
}