import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { Auth } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (auth.currentUser()) {
    return true;
  }

  return auth.getMe().pipe(
    map(() => true),
    catchError(() => of(router.createUrlTree(['/']),))
  );
};