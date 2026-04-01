import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const messages = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          if (!req.url.includes('/api/me')) {
            router.navigate(['/login']);
          }
          break;
        case 403:
          messages.add({ severity: 'error', summary: 'Accès refusé', detail: 'Vous n\'avez pas les droits nécessaires.' });
          break;
        case 429:
          messages.add({ severity: 'warn', summary: 'Trop de tentatives', detail: 'Veuillez patienter avant de réessayer.' });
          break;
        case 500:
        case 502:
        case 503:
          messages.add({ severity: 'error', summary: 'Erreur serveur', detail: 'Une erreur inattendue s\'est produite.' });
          break;
      }
      return throwError(() => error);
    })
  );
};
