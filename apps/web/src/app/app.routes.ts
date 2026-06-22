import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/landing.page').then(m => m.default) },
  { path: 'login', loadComponent: () => import('./pages/login.page').then(m => m.default) },
  { path: 'register', loadComponent: () => import('./pages/register.page').then(m => m.default) },
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard.page').then(m => m.default), canActivate: [authGuard] },
  { path: 'interview/new', loadComponent: () => import('./pages/new-interview.page').then(m => m.default), canActivate: [authGuard] },
  { path: 'interview/:id', loadComponent: () => import('./pages/interview-session.page').then(m => m.default), canActivate: [authGuard] },
  { path: 'interview/:id/summary', loadComponent: () => import('./pages/interview-summary.page').then(m => m.default), canActivate: [authGuard] },
  { path: 'history', loadComponent: () => import('./pages/interview-history.page').then(m => m.default), canActivate: [authGuard] },
  { path: 'history/:id', loadComponent: () => import('./pages/interview-detail.page').then(m => m.default), canActivate: [authGuard] },
  { path: 'profile', loadComponent: () => import('./pages/profile.page').then(m => m.default), canActivate: [authGuard] },
  { path: '**', loadComponent: () => import('./pages/not-found.page').then(m => m.default) },
];
