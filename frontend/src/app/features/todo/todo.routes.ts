import { Routes } from '@angular/router';

export const todoRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/todo-list/todo-list.component').then(m => m.TodoListComponent)
  }
];
