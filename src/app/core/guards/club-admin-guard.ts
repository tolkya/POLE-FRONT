import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError, of, switchMap } from 'rxjs';
import { Auth } from '../services/auth.service';
import { UserClubsService } from '../services/user-clubs.service';

export const clubAdminGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  const userClubsService = inject(UserClubsService);

  const redirectToHome = () => router.createUrlTree(['/']);

  // Vérifie si l'utilisateur est admin d'un club
  const checkClubAdmin = () => {
    // Si les clubs sont déjà chargés
    if (userClubsService.userClubs().length > 0) {
      return userClubsService.isAdminOfAnyClub()
        ? true
        : redirectToHome();
    }

    // Sinon, charger les clubs
    return userClubsService.fetchUserClubs().pipe(
      map(() => userClubsService.isAdminOfAnyClub() ? true : redirectToHome()),
      catchError(() => of(redirectToHome()))
    );
  };

  // Si l'utilisateur est déjà connecté
  const user = auth.currentUser();
  if (user) {
    return checkClubAdmin();
  }

  // Sinon, vérifier la connexion puis les clubs
  return auth.getMe().pipe(
    switchMap(() => userClubsService.fetchUserClubs()),
    map(() => userClubsService.isAdminOfAnyClub() ? true : redirectToHome()),
    catchError(() => of(redirectToHome()))
  );
};