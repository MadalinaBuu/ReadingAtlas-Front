import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'map',
    pathMatch: 'full'
  },
  {
    path: 'map',
    loadComponent: () =>
      import('./pages/map/map.component').then(m => m.MapComponent)
  },
  {
    path: 'books',
    loadComponent: () =>
      import('./pages/book-list/book-list.component').then(m => m.BookListComponent)
  },
  {
    path: 'books/:id',
    loadComponent: () =>
      import('./pages/book-detail/book-detail.component').then(m => m.BookDetailComponent)
  }
];