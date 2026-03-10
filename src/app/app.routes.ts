import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { RegisterClubAdmin } from './pages/register-club-admin/register-club-admin';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'register/club-admin', component: RegisterClubAdmin },
];
