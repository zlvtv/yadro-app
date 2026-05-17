import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'users',
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./components/user-list/user-list').then((m) => m.UserListComponent),
  },
  {
    path: 'users/new',
    loadComponent: () =>
      import('./components/user-form/user-form').then((m) => m.UserFormComponent),
  },
  {
    path: 'users/:id',
    loadComponent: () =>
      import('./components/user-detail/user-detail').then((m) => m.UserDetailComponent),
  },
  {
    path: 'users/:id/edit',
    loadComponent: () =>
      import('./components/user-form/user-form').then((m) => m.UserFormComponent),
  },
  {
    path: '**',
    redirectTo: 'users',
  },
];
