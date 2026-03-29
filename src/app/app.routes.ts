import { Routes } from '@angular/router';
import { superAdminGuard } from './core/guards/super-admin-guard';
import { dashboardGuard } from './core/guards/dashboard-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing').then((m) => m.Landing),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'register/club-admin',
    loadComponent: () => import('./pages/register/register').then((m) => m.Register),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then((m) => m.Register),
  },
  {
    path: 'clubs/:id',
    // Placeholder Phase 2 — page publique d'un club
    loadComponent: () => import('./pages/landing/landing').then((m) => m.Landing),
  },
  {
    path: 'dashboard/super-admin',
    loadComponent: () =>
      import('./pages/super-admin/dashboard/dashboard').then(
        (m) => m.Dashboard
      ),
    canActivate: [superAdminGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
    canActivate: [dashboardGuard],
  },
  { path: '**', redirectTo: '' },
];