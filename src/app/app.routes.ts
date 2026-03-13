import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { RegisterClubAdmin } from './pages/register-club-admin/register-club-admin';
import { Register } from './pages/register/register';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'register/club-admin', component: RegisterClubAdmin },
  { path: 'register', component: Register },
  {
    path: 'dashboard/super-admin',
    loadComponent: () =>
      import('./pages/dashboard-super-admin/dashboard-super-admin').then(
        (m) => m.DashboardSuperAdmin
      ),
    canActivate: [authGuard],
  },
];