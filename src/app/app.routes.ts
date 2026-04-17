import { Routes } from '@angular/router';
import { superAdminGuard } from './core/guards/super-admin-guard';
import { dashboardGuard } from './core/guards/dashboard-guard';
import { clubAdminGuard } from './core/guards/club-admin-guard';

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
    path: 'club/:id',
    loadComponent: () => import('./pages/club-home/club-home').then((m) => m.ClubHome),
    canActivate: [dashboardGuard],
  },
  {
    path: 'club/:id/my-activities',
    loadComponent: () => import('./pages/club-home/my-activities/my-activities').then((m) => m.MyActivities),
    canActivate: [dashboardGuard],
  },
  {
    path: 'club/:id/my-activities/:activityId',
    loadComponent: () => import('./pages/club-home/my-activities/activity-detail/activity-detail').then((m) => m.ActivityDetail),
    canActivate: [dashboardGuard],
  },
  {
    path: 'club/:id/admin',
    loadComponent: () => import('./pages/club-home/admin/admin-panel/admin-panel').then(m => m.AdminPanel),
    canActivate: [clubAdminGuard],
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
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile').then((m) => m.Profile),
    canActivate: [dashboardGuard],
  },
  { path: '**', redirectTo: '' },
];