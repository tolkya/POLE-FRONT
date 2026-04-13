import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError, of, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserClubsService } from '../services/user-clubs.service';

export const clubAdminGuard: CanActivateFn = (route) => {
  const auth             = inject(AuthService);
  const router           = inject(Router);
  const userClubsService = inject(UserClubsService);

  const clubId = Number(route.paramMap.get('id'));

  const check = () => {
    const isAdmin = userClubsService.userClubs().some(
      uc => uc.club.id === clubId && uc.roles.includes('ADMIN')
    );
    return isAdmin ? true : router.createUrlTree(['/club', clubId]);
  };

  if (userClubsService.userClubs().length > 0) {
    return check();
  }

  if (auth.currentUser()) {
    return userClubsService.fetchUserClubs().pipe(
      map(() => check()),
      catchError(() => of(router.createUrlTree(['/club', clubId])))
    );
  }

  return auth.getMe().pipe(
    switchMap(() => userClubsService.fetchUserClubs()),
    map(() => check()),
    catchError(() => of(router.createUrlTree(['/login'])))
  );
};