import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError, of, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserClubsService } from '../services/user-clubs.service';

export const dashboardGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const userClubsService = inject(UserClubsService);

  const loadAndCheck = () =>
    userClubsService.fetchUserClubs().pipe(
      map(() => true),
      catchError(() => of(router.createUrlTree(['/login'])))
    );

  const user = auth.currentUser();

  if (user) {
    if (user.roles.includes('ROLE_SUPER_ADMIN')) {
      return router.createUrlTree(['/dashboard/super-admin']);
    }
    return loadAndCheck();
  }

  return auth.getMe().pipe(
    switchMap((u) => {
      if (u.roles.includes('ROLE_SUPER_ADMIN')) {
        return of(router.createUrlTree(['/dashboard/super-admin']));
      }
      return loadAndCheck();
    }),
    catchError(() => of(router.createUrlTree(['/login'])))
  );
};