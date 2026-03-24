import { Routes } from '@angular/router';
import { superAdminGuard } from './core/guards/super-admin-guard';
import { dashboardGuard } from './core/guards/dashboard-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'register/club-admin',
    loadComponent: () =>
      import('./pages/register-club-admin/register-club-admin').then(
        (m) => m.RegisterClubAdmin
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register').then((m) => m.Register),
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