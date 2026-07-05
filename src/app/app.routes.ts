import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'map',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'map',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/map/map.component').then(m => m.MapComponent)
  },
  {
    path: 'books',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/book-list/book-list.component').then(m => m.BookListComponent)
  },
  {
    path: 'books/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/book-detail/book-detail.component').then(m => m.BookDetailComponent)
  },
  {
  path: 'import',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./pages/import/import.component').then(m => m.ImportComponent)
},
];