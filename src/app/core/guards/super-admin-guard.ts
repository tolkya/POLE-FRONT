import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth.service';

export const superAdminGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (auth.currentUser()?.roles.includes('ROLE_SUPER_ADMIN')) {
    return true;
  }

  return router.createUrlTree(['/']);
};
