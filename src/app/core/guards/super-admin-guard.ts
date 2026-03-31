import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const superAdminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.currentUser();

  if (user) {
    return user.roles.includes('ROLE_SUPER_ADMIN')
      ? true
      : router.createUrlTree(['/']);
  }

  return auth.getMe().pipe(
    map((u) => {
      return u.roles.includes('ROLE_SUPER_ADMIN')
        ? true
        : router.createUrlTree(['/']);
    }),
    catchError(() => of(router.createUrlTree(['/'])))
  );
};